import { NextResponse } from "next/server";
import { analyzeOpportunity, generateReplyDraft } from "@/lib/openai";
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

  const input = {
    title: opportunity.title,
    postText: opportunity.postText,
    neighborhood: opportunity.neighborhood,
    sourceName: opportunity.sourceName,
  };
  const analysis = await analyzeOpportunity(input);
  const reply = await generateReplyDraft(currentBusiness, input, analysis);

  return NextResponse.json({
    opportunityId,
    reply,
    autoPosted: false,
  });
}
