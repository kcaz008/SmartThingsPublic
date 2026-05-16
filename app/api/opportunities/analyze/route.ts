import { NextResponse } from "next/server";
import {
  createAiAnalysis,
  localSignalAnalysisToOpportunityAnalysis,
} from "@/lib/openai";
import { currentBusiness } from "@/lib/sample-data";

export async function POST(request: Request) {
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

  const aiAnalysis = await createAiAnalysis({
    post_text: postText,
    source_name: String(body.source_name ?? body.sourceName ?? "Manual intake"),
    source_type: String(body.source_type ?? body.sourceType ?? "manual"),
    service_area: String(body.service_area ?? currentBusiness.serviceArea),
    company_name: String(body.company_name ?? currentBusiness.name),
    company_phone: String(body.company_phone ?? currentBusiness.phone),
    tone_rules: String(body.tone_rules ?? currentBusiness.toneRules),
  });
  const analysis = localSignalAnalysisToOpportunityAnalysis(aiAnalysis);

  return NextResponse.json({
    analysis,
    ai_analysis: aiAnalysis,
    reply: aiAnalysis.suggested_reply,
    autopilotMode: currentBusiness.autopilotMode,
    autoPosted: false,
  });
}
