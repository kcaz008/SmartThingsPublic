import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { formatCompanyKnowledgeForAi } from "@/lib/company-knowledge";
import { getBusiness, getReputationMemorySummary } from "@/lib/data";
import { createAiAnalysis } from "@/lib/openai";
import { createSupabaseServerClient } from "@/lib/supabase";

type BrowserImportPayload = {
  source?: string;
  groupName?: string;
  groupUrl?: string;
  postUrl?: string;
  posterName?: string | null;
  postText?: string;
  visibleComments?: string[];
  importedByTeamMemberId?: string | null;
  clientId?: string | null;
  confirmSave?: boolean;
};

export async function POST(request: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as BrowserImportPayload;
  const validationError = validatePayload(body);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const businessId = body.clientId || authContext.businessId;
  const supabase = await createSupabaseServerClient();
  const textHash = hashText(body.postText ?? "");
  const [business, reputationMemory] = await Promise.all([
    getBusiness(businessId),
    getReputationMemorySummary(businessId),
  ]);
  const aiAnalysis = await createAiAnalysis({
    post_text: [
      body.postText,
      ...(body.visibleComments ?? []).map((comment) => `Comment: ${comment}`),
    ].join("\n"),
    source_name: body.groupName ?? "Facebook browser assist",
    source_type: "facebook_group",
    service_area: business.serviceArea,
    company_name: business.name,
    company_phone: business.phone,
    tone_rules: [
      business.toneRules,
      formatCompanyKnowledgeForAi(business),
      reputationMemory ? `Reputation memory:\n${reputationMemory}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  let duplicateOf: string | null = null;
  let importId: string | null = null;

  if (supabase && businessId) {
    const duplicateQuery = supabase
      .from("browser_imports")
      .select("id")
      .eq("business_id", businessId)
      .limit(1);
    const duplicate = body.postUrl
      ? await duplicateQuery.eq("post_url", body.postUrl).maybeSingle()
      : await duplicateQuery.eq("text_hash", textHash).maybeSingle();

    duplicateOf = duplicate.data?.id ?? null;

    const { data: browserImport } = await supabase
      .from("browser_imports")
      .insert({
        business_id: businessId,
        source: "facebook_browser_assist",
        group_name: body.groupName,
        group_url: body.groupUrl || null,
        post_url: body.postUrl || null,
        poster_name: body.posterName || null,
        post_text: body.postText,
        visible_comments: body.visibleComments ?? [],
        imported_by_team_member_id: body.importedByTeamMemberId || null,
        text_hash: textHash,
        duplicate_of: duplicateOf,
        status: body.confirmSave ? "saved_as_lead" : "pending_review",
        analysis: {
          detected_intent: aiAnalysis.intent_type,
          lead_score: aiAnalysis.lead_score,
          recommended_action: recommendationFromAnalysis(aiAnalysis),
        },
      })
      .select("id")
      .single();

    importId = browserImport?.id ?? null;

    if (body.confirmSave) {
      await supabase.from("opportunities").insert({
        business_id: businessId,
        original_text: body.postText,
        post_url: body.postUrl || null,
        author_name: body.posterName || null,
        detected_town: aiAnalysis.detected_town,
        service_type: aiAnalysis.service_type,
        urgency: aiAnalysis.urgency,
        lead_score: aiAnalysis.lead_score,
        sentiment: aiAnalysis.sentiment,
        intent_type: aiAnalysis.intent_type,
        status: aiAnalysis.is_relevant ? "drafted" : "ignored",
      });
    }
  }

  return NextResponse.json({
    importId,
    saved: Boolean(body.confirmSave),
    duplicateWarning: duplicateOf
      ? "Possible duplicate: this post URL or text was already imported."
      : null,
    duplicateOf,
    review: {
      groupName: body.groupName,
      groupUrl: body.groupUrl,
      postUrl: body.postUrl,
      posterName: body.posterName ?? null,
      postText: body.postText,
      visibleComments: body.visibleComments ?? [],
      detectedIntent: aiAnalysis.intent_type,
      leadScore: aiAnalysis.lead_score,
      competitorMentions: detectCompetitors([
        body.postText,
        ...(body.visibleComments ?? []),
      ].join("\n")),
      recommendedAction: recommendationFromAnalysis(aiAnalysis),
    },
    aiAnalysis,
    safety:
      "Browser Assist is user-initiated. It only imports selected visible posts and never posts back to Facebook.",
  });
}

function validatePayload(payload: BrowserImportPayload) {
  if (payload.source !== "facebook_browser_assist") {
    return "source must be facebook_browser_assist";
  }

  if (!payload.groupName?.trim()) {
    return "groupName is required";
  }

  if (!payload.postText?.trim()) {
    return "postText is required";
  }

  if (payload.visibleComments && !Array.isArray(payload.visibleComments)) {
    return "visibleComments must be an array";
  }

  return null;
}

function hashText(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function detectCompetitors(text: string) {
  return [
    "Cool Breeze",
    "Four Seasons",
    "Universe",
    "Petro",
    "Apple Air",
    "Gold Star",
  ].filter((name) => text.toLowerCase().includes(name.toLowerCase()));
}

function recommendationFromAnalysis(analysis: { urgency: string; lead_score: number }) {
  if (analysis.lead_score >= 80 || analysis.urgency === "high") {
    return "Review immediately and choose a soft, human reply.";
  }

  if (analysis.lead_score >= 55) {
    return "Save as lead and follow up when a team member is available.";
  }

  return "Keep pending or ignore unless the context changes.";
}
