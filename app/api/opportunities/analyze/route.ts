import { NextResponse } from "next/server";
import { analyzeOpportunity, generateReplyDraft } from "@/lib/openai";
import { currentBusiness } from "@/lib/sample-data";

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const postText = String(body.postText ?? "").trim();

  if (!title || !postText) {
    return NextResponse.json(
      { error: "title and postText are required" },
      { status: 400 },
    );
  }

  const opportunityInput = {
    title,
    postText,
    neighborhood: String(body.neighborhood ?? "").trim(),
    sourceName: String(body.sourceName ?? "").trim(),
  };

  const analysis = await analyzeOpportunity(opportunityInput);
  const reply = await generateReplyDraft(
    currentBusiness,
    opportunityInput,
    analysis,
  );

  return NextResponse.json({
    analysis,
    reply,
    autopilotMode: currentBusiness.autopilotMode,
    autoPosted: false,
  });
}
