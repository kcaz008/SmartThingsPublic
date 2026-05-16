import { NextResponse } from "next/server";
import { createAiAnalysis } from "@/lib/openai";
import { currentBusiness, getOpportunityById } from "@/lib/sample-data";

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

  const analysis = await createAiAnalysis({
    post_text: `${opportunity.title}\n\n${opportunity.postText}`,
    source_name: opportunity.sourceName,
    source_type: "manual",
    service_area: currentBusiness.serviceArea,
    company_name: currentBusiness.name,
    company_phone: currentBusiness.phone,
    tone_rules: currentBusiness.tone,
  });

  return NextResponse.json({
    opportunityId,
    ai_analysis: analysis,
    reply: analysis.suggested_reply,
    autoPosted: false,
  });
}
