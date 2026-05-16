import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { formatCompanyKnowledgeForAi } from "@/lib/company-knowledge";
import {
  getBusiness,
  getOpportunity,
  getReputationMemorySummary,
  getSource,
} from "@/lib/data";
import { createAiAnalysis } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: `reply-generate:${authContext.user.id}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many reply requests" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const body = await request.json();
  const opportunityId = String(body.opportunityId ?? "");
  const opportunity = await getOpportunity(authContext.businessId, opportunityId);

  if (!opportunity) {
    return NextResponse.json(
      { error: "opportunityId was not found" },
      { status: 404 },
    );
  }

  const [currentBusiness, source, reputationMemory] = await Promise.all([
    getBusiness(authContext.businessId),
    getSource(authContext.businessId, opportunity.sourceId),
    getReputationMemorySummary(authContext.businessId),
  ]);
  const analysis = await createAiAnalysis({
    post_text: opportunity.originalText,
    source_name: source?.name ?? "Manual intake",
    source_type: source?.type ?? "manual",
    service_area: currentBusiness.serviceArea,
    company_name: currentBusiness.name,
    company_phone: currentBusiness.phone,
    tone_rules: [
      currentBusiness.toneRules,
      formatCompanyKnowledgeForAi(currentBusiness),
      reputationMemory ? `Reputation memory:\n${reputationMemory}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  let replyId: string | undefined;
  const supabase = await createSupabaseServerClient();

  if (supabase && authContext.businessId) {
    const { data: reply, error } = await supabase
      .from("ai_replies")
      .insert({
        opportunity_id: opportunity.id,
        draft_text: analysis.suggested_reply,
        approved: false,
      })
      .select("id")
      .single();

    if (error || !reply) {
      return NextResponse.json(
        { error: error?.message ?? "Unable to save reply draft" },
        { status: 500 },
      );
    }

    replyId = reply.id;
    await supabase
      .from("opportunities")
      .update({ status: "drafted" })
      .eq("id", opportunity.id)
      .eq("business_id", authContext.businessId);

    await logAuditEvent({
      businessId: authContext.businessId,
      userId: authContext.user.id,
      action: "reply.generated",
      targetTable: "ai_replies",
      targetId: reply.id,
      metadata: { opportunityId: opportunity.id },
    });
  }

  return NextResponse.json({
    opportunityId,
    replyId,
    ai_analysis: analysis,
    reply: analysis.suggested_reply,
    autoPosted: false,
  });
}
