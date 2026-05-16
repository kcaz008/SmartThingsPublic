import { NextResponse } from "next/server";
import { createAiAnalysis } from "@/lib/openai";
import {
  currentBusiness,
  getOpportunityById,
  getSourceById,
} from "@/lib/sample-data";

export async function POST(request: Request) {
  const body = await request.json();
  const opportunityId = String(body.opportunityId ?? "");
  const opportunity = getOpportunityById(opportunityId);

  if (!opportunity) {
    return NextResponse.json(
      { error: "opportunityId was not found" },
      { status: 404 },
    );
  }

  const source = getSourceById(opportunity.sourceId);
  const analysis = await createAiAnalysis({
    post_text: opportunity.originalText,
    source_name: source?.name ?? "Manual intake",
    source_type: source?.type ?? "manual",
    service_area: currentBusiness.serviceArea,
    company_name: currentBusiness.name,
    company_phone: currentBusiness.phone,
    tone_rules: currentBusiness.toneRules,
  });

  return NextResponse.json({
    opportunityId,
    ai_analysis: analysis,
    reply: analysis.suggested_reply,
    autoPosted: false,
  });
}
