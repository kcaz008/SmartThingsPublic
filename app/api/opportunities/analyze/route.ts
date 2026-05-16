import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { getBusiness } from "@/lib/data";
import {
  createAiAnalysis,
  localSignalAnalysisToOpportunityAnalysis,
} from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: `opportunity-analyze:${authContext.user.id}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many analysis requests" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const rawPostText = String(body.post_text ?? body.postText ?? "").trim();
  const postText = title ? `${title}\n\n${rawPostText}` : rawPostText;

  if (!postText) {
    return NextResponse.json(
      { error: "post_text is required" },
      { status: 400 },
    );
  }

  const currentBusiness = await getBusiness(authContext.businessId);
  const supabase = await createSupabaseServerClient();
  const sourceId = String(body.sourceId ?? body.source_id ?? "").trim();
  const sourceName = String(body.source_name ?? body.sourceName ?? "Manual intake");
  const sourceType = String(body.source_type ?? body.sourceType ?? "manual");
  const aiAnalysis = await createAiAnalysis({
    post_text: postText,
    source_name: sourceName,
    source_type: sourceType,
    service_area: String(body.service_area ?? currentBusiness.serviceArea),
    company_name: String(body.company_name ?? currentBusiness.name),
    company_phone: String(body.company_phone ?? currentBusiness.phone),
    tone_rules: String(body.tone_rules ?? currentBusiness.toneRules),
  });
  const analysis = localSignalAnalysisToOpportunityAnalysis(aiAnalysis);
  let opportunityId: string | undefined;
  let replyId: string | undefined;

  if (supabase && authContext.businessId) {
    const { data: opportunity, error: opportunityError } = await supabase
      .from("opportunities")
      .insert({
        business_id: authContext.businessId,
        source_id: sourceId || null,
        original_text: postText,
        author_name: String(body.authorName ?? body.author_name ?? "").trim() || null,
        detected_town:
          String(body.detected_town ?? body.town ?? aiAnalysis.detected_town).trim() ||
          aiAnalysis.detected_town,
        service_type: aiAnalysis.service_type,
        urgency: aiAnalysis.urgency,
        lead_score: aiAnalysis.lead_score,
        sentiment: aiAnalysis.sentiment,
        intent_type: aiAnalysis.intent_type,
        status: aiAnalysis.is_relevant ? "drafted" : "ignored",
      })
      .select("id")
      .single();

    if (opportunityError || !opportunity) {
      return NextResponse.json(
        { error: opportunityError?.message ?? "Unable to save opportunity" },
        { status: 500 },
      );
    }

    opportunityId = opportunity.id;

    const { data: reply, error: replyError } = await supabase
      .from("ai_replies")
      .insert({
        opportunity_id: opportunity.id,
        draft_text: aiAnalysis.suggested_reply,
        approved: false,
      })
      .select("id")
      .single();

    if (replyError || !reply) {
      return NextResponse.json(
        { error: replyError?.message ?? "Unable to save reply draft" },
        { status: 500 },
      );
    }

    replyId = reply.id;

    await logAuditEvent({
      businessId: authContext.businessId,
      userId: authContext.user.id,
      action: "opportunity.analyzed",
      targetTable: "opportunities",
      targetId: opportunity.id,
      metadata: {
        sourceId,
        sourceName,
        sourceType,
        leadScore: aiAnalysis.lead_score,
        status: aiAnalysis.is_relevant ? "drafted" : "ignored",
      },
    });
  }

  return NextResponse.json({
    opportunityId,
    replyId,
    analysis,
    ai_analysis: aiAnalysis,
    reply: aiAnalysis.suggested_reply,
    autopilotMode: currentBusiness.autopilotMode,
    autoPosted: false,
  });
}
