import OpenAI from "openai";
import type { AiAnalysis, Business } from "@/lib/types";

export type OpportunityInput = {
  title: string;
  postText: string;
  neighborhood?: string;
  sourceName?: string;
};

function getOpenAiClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function analyzeOpportunity(
  input: OpportunityInput,
): Promise<AiAnalysis> {
  const client = getOpenAiClient();

  if (!client) {
    return placeholderAnalysis(input);
  }

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You classify neighborhood posts for an HVAC company. Return concise JSON with isServiceOpportunity, category, urgency, confidence, homeownerIntent, recommendedAction, and spamRisk.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "hvac_opportunity_analysis",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            isServiceOpportunity: { type: "boolean" },
            category: { type: "string" },
            urgency: {
              type: "string",
              enum: ["low", "medium", "high", "emergency"],
            },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            homeownerIntent: { type: "string" },
            recommendedAction: { type: "string" },
            spamRisk: { type: "string", enum: ["low", "medium", "high"] },
          },
          required: [
            "isServiceOpportunity",
            "category",
            "urgency",
            "confidence",
            "homeownerIntent",
            "recommendedAction",
            "spamRisk",
          ],
        },
      },
    },
  });

  const output = response.output_text;
  return JSON.parse(output) as AiAnalysis;
}

export async function generateReplyDraft(
  business: Business,
  input: OpportunityInput,
  analysis: AiAnalysis,
) {
  const client = getOpenAiClient();

  if (!client) {
    return placeholderReply(business, input, analysis);
  }

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Draft a human-sounding HVAC reply for a neighborhood/community post. Be helpful, specific, non-spammy, and never imply auto-posting. Keep it under 95 words.",
      },
      {
        role: "user",
        content: JSON.stringify({
          business,
          opportunity: input,
          analysis,
        }),
      },
    ],
  });

  return response.output_text.trim();
}

function placeholderAnalysis(input: OpportunityInput): AiAnalysis {
  const text = `${input.title} ${input.postText}`.toLowerCase();
  const emergencyTerms = ["today", "not cooling", "no ac", "82", "emergency"];
  const replacementTerms = ["replace", "replacement", "quote", "second opinion"];
  const urgency = emergencyTerms.some((term) => text.includes(term))
    ? "emergency"
    : replacementTerms.some((term) => text.includes(term))
      ? "medium"
      : "low";

  return {
    isServiceOpportunity: /ac|a\/c|hvac|heat|furnace|air|thermostat/.test(text),
    category:
      urgency === "emergency"
        ? "No-cooling or urgent comfort issue"
        : replacementTerms.some((term) => text.includes(term))
          ? "Estimate or replacement question"
          : "HVAC maintenance or advice request",
    urgency,
    confidence: urgency === "emergency" ? 0.91 : 0.74,
    homeownerIntent:
      "Likely looking for trustworthy local guidance and a clear next step.",
    recommendedAction:
      "Respond with empathy, one useful detail, and a low-pressure way to contact the business.",
    spamRisk: "low",
  };
}

function placeholderReply(
  business: Business,
  input: OpportunityInput,
  analysis: AiAnalysis,
) {
  const neighborhood = input.neighborhood
    ? ` in ${input.neighborhood}`
    : "";
  const urgencyLine =
    analysis.urgency === "emergency"
      ? "If it is not cooling, it is worth having airflow, refrigerant, and the outdoor unit checked soon."
      : "A quick check can usually separate a simple fix from something that needs a visit.";

  return `Hi - sorry you are dealing with that${neighborhood}. ${urgencyLine} We are ${business.name}, a local HVAC company, and we are happy to help without any pressure. If useful, call or text ${business.phone} and we can point you in the right direction.`;
}
