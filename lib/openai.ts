import OpenAI from "openai";
import type { AiAnalysis, Business } from "@/lib/types";

export type LocalSignalAnalysisInput = {
  post_text: string;
  source_name: string;
  source_type: string;
  service_area: string;
  company_name: string;
  company_phone: string;
  tone_rules: string;
};

export type LocalSignalAnalysisOutput = {
  is_relevant: boolean;
  service_type: string;
  detected_town: string;
  urgency: "low" | "medium" | "high";
  lead_score: number;
  sentiment: string;
  intent_type:
    | "recommendation_request"
    | "urgent_repair"
    | "price_check"
    | "maintenance_question"
    | "complaint"
    | "not_relevant"
    | "other";
  reasoning_summary: string;
  suggested_reply: string;
};

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

export async function createAiAnalysis(
  input: LocalSignalAnalysisInput,
): Promise<LocalSignalAnalysisOutput> {
  const client = getOpenAiClient();

  if (!client) {
    return placeholderLocalSignalAnalysis(input);
  }

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: [
          "You are LocalSignal's AI analysis function for local HVAC sales opportunities.",
          "Only return valid JSON matching the provided schema.",
          "Analyze whether the post is relevant to the company and draft one helpful manual reply.",
          "Do not pretend to be a customer.",
          "Do not make fake personal recommendations.",
          'Do not say "I used them", "they did work for me", or anything implying personal experience.',
          "Sound local, helpful, and human.",
          "Keep suggested_reply under 75 words.",
          "Mention the business name no more than once.",
          "Vary wording, sentence length, CTA, tone, phone-number usage, and whether to mention the company name.",
          "Use company knowledge and phrases-to-avoid from tone_rules when present.",
          "Do not be salesy.",
          "Include light helpful context when appropriate.",
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "localsignal_ai_analysis",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            is_relevant: { type: "boolean" },
            service_type: { type: "string" },
            detected_town: { type: "string" },
            urgency: { type: "string", enum: ["low", "medium", "high"] },
            lead_score: { type: "integer", minimum: 0, maximum: 100 },
            sentiment: { type: "string" },
            intent_type: {
              type: "string",
              enum: [
                "recommendation_request",
                "urgent_repair",
                "price_check",
                "maintenance_question",
                "complaint",
                "not_relevant",
                "other",
              ],
            },
            reasoning_summary: { type: "string" },
            suggested_reply: { type: "string" },
          },
          required: [
            "is_relevant",
            "service_type",
            "detected_town",
            "urgency",
            "lead_score",
            "sentiment",
            "intent_type",
            "reasoning_summary",
            "suggested_reply",
          ],
        },
      },
    },
  });

  return normalizeLocalSignalAnalysis(
    JSON.parse(response.output_text) as LocalSignalAnalysisOutput,
    input,
  );
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

export function localSignalAnalysisToOpportunityAnalysis(
  analysis: LocalSignalAnalysisOutput,
): AiAnalysis {
  return {
    isServiceOpportunity: analysis.is_relevant,
    category: analysis.service_type,
    urgency: analysis.urgency,
    confidence: analysis.lead_score / 100,
    homeownerIntent: `${analysis.intent_type.replaceAll("_", " ")}; sentiment: ${
      analysis.sentiment
    }`,
    recommendedAction: analysis.suggested_reply,
    spamRisk: analysis.lead_score >= 70 ? "low" : analysis.lead_score >= 45 ? "medium" : "high",
  };
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

function placeholderLocalSignalAnalysis(
  input: LocalSignalAnalysisInput,
): LocalSignalAnalysisOutput {
  const text = input.post_text.toLowerCase();
  const relevantPattern = /ac|a\/c|hvac|heat|furnace|air conditioner|thermostat|duct|mini[- ]?split/;
  const isRelevant = relevantPattern.test(text);
  const urgentPattern = /stopped|not cooling|no ac|no a\/c|broken|emergency|today|tonight|asap|leak|burning/;
  const pricePattern = /quote|estimate|price|cost|second opinion|too high/;
  const recommendationPattern = /recommend|referral|who do you use|anyone know|looking for/;
  const maintenancePattern = /tune[- ]?up|filter|maintenance|noise|rattle|check/;
  const urgency: LocalSignalAnalysisOutput["urgency"] = urgentPattern.test(text)
    ? "high"
    : pricePattern.test(text) || recommendationPattern.test(text)
      ? "medium"
      : "low";
  const intentType: LocalSignalAnalysisOutput["intent_type"] = !isRelevant
    ? "not_relevant"
    : urgentPattern.test(text)
      ? "urgent_repair"
      : recommendationPattern.test(text)
        ? "recommendation_request"
        : pricePattern.test(text)
          ? "price_check"
          : maintenancePattern.test(text)
            ? "maintenance_question"
            : "other";
  const detectedTown = detectTown(input.post_text, input.service_area);
  const leadScore = !isRelevant
    ? 12
    : urgency === "high"
      ? 88
      : intentType === "recommendation_request" || intentType === "price_check"
        ? 76
        : 58;
  const serviceType = !isRelevant
    ? "Not Relevant"
    : urgentPattern.test(text)
      ? "HVAC Repair"
      : pricePattern.test(text)
        ? "HVAC Estimate"
        : maintenancePattern.test(text)
          ? "HVAC Maintenance"
          : "HVAC Service";
  const sentiment = /frustrat|annoy|upset|mad|hot|stressed|desperate/.test(text)
    ? "frustrated"
    : urgentPattern.test(text)
      ? "concerned"
      : "neutral";

  return normalizeLocalSignalAnalysis(
    {
      is_relevant: isRelevant,
      service_type: serviceType,
      detected_town: detectedTown,
      urgency,
      lead_score: leadScore,
      sentiment,
      intent_type: intentType,
      reasoning_summary: isRelevant
        ? `User appears to need ${serviceType.toLowerCase()} help from a local provider.`
        : "Post does not show clear HVAC service intent.",
      suggested_reply: isRelevant
        ? buildHelpfulReply(input, urgency)
        : "This does not look like a fit for an HVAC reply right now.",
    },
    input,
  );
}

function detectTown(postText: string, serviceArea: string) {
  const townCandidates = serviceArea
    .split(/[,;/|]|\band\b/)
    .map((town) => town.trim())
    .filter(Boolean);
  const normalizedPost = postText.toLowerCase();

  return (
    townCandidates.find((town) => normalizedPost.includes(town.toLowerCase())) ??
    townCandidates[0] ??
    "Unknown"
  );
}

function buildHelpfulReply(
  input: LocalSignalAnalysisInput,
  urgency: LocalSignalAnalysisOutput["urgency"],
) {
  const variation = Math.abs(hashString(input.post_text)) % 4;
  const context =
    urgency === "high"
      ? "A quick check of airflow, the outdoor unit, and thermostat settings can help narrow it down."
      : "It can help to note when it started and whether the system is cooling, heating, or making noise.";

  if (variation === 0) {
    return `Sorry you are dealing with that. ${context} ${input.company_name} can help take a look if you still need someone.`;
  }

  if (variation === 1) {
    return `That sounds worth checking sooner than later. ${context} If helpful, ${input.company_name} can point you in the right direction without pressure.`;
  }

  if (variation === 2) {
    return `A quick HVAC check may save some guessing here. ${context} Happy to help if you still need a local option.`;
  }

  return `For something like this, I would start with ${context.toLowerCase()} ${input.company_name} is local; call or text ${input.company_phone} if you want help sorting it out.`;
}

function normalizeLocalSignalAnalysis(
  analysis: LocalSignalAnalysisOutput,
  input: LocalSignalAnalysisInput,
): LocalSignalAnalysisOutput {
  return {
    ...analysis,
    lead_score: clamp(Math.round(analysis.lead_score), 0, 100),
    suggested_reply: enforceReplyRules(
      analysis.suggested_reply,
      input.company_name,
    ),
  };
}

function enforceReplyRules(reply: string, companyName: string) {
  const withoutForbiddenClaims = reply
    .replace(/\bI used them\b/gi, "")
    .replace(/\bthey did work for me\b/gi, "")
    .replace(/\bthey worked for me\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const limitedCompanyMentions = limitCompanyMention(
    withoutForbiddenClaims,
    companyName,
  );
  const words = limitedCompanyMentions.split(/\s+/);

  return words.length <= 75 ? limitedCompanyMentions : words.slice(0, 75).join(" ");
}

function limitCompanyMention(reply: string, companyName: string) {
  const firstIndex = reply.toLowerCase().indexOf(companyName.toLowerCase());

  if (firstIndex === -1) {
    return reply;
  }

  const beforeAndFirstMention = reply.slice(
    0,
    firstIndex + companyName.length,
  );
  const afterFirstMention = reply
    .slice(firstIndex + companyName.length)
    .replace(new RegExp(escapeRegExp(companyName), "gi"), "the company");

  return `${beforeAndFirstMention}${afterFirstMention}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hashString(value: string) {
  return value.split("").reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) | 0;
  }, 7);
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
