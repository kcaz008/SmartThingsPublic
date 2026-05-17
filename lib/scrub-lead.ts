import type { Opportunity, Source } from "@/lib/types";

export type ScrubbedLead = {
  actionableItem: string;
  cleanedPost: string;
  removedDetails: string[];
  whyItMatters: string;
};

export function scrubOpportunityForAction(
  opportunity: Opportunity,
  source?: Source | null,
): ScrubbedLead {
  const removedDetails: string[] = [];
  let cleanedPost = opportunity.originalText;

  if (/\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/.test(cleanedPost)) {
    removedDetails.push("email address");
    cleanedPost = cleanedPost.replace(
      /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g,
      "[email removed]",
    );
  }

  if (/\b\d{3}[-.)\s]*\d{3}[-.\s]*\d{4}\b/.test(cleanedPost)) {
    removedDetails.push("phone number");
    cleanedPost = cleanedPost.replace(
      /\b\d{3}[-.)\s]*\d{3}[-.\s]*\d{4}\b/g,
      "[phone removed]",
    );
  }

  if (/\b\d{1,5}\s+[A-Z][A-Za-z]+\s+(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr)\b/.test(cleanedPost)) {
    removedDetails.push("street address");
    cleanedPost = cleanedPost.replace(
      /\b\d{1,5}\s+[A-Z][A-Za-z]+\s+(Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr)\b/g,
      "[address removed]",
    );
  }

  const sourceLabel = source?.name ?? "Unknown source";
  const urgencyText =
    opportunity.urgency === "high"
      ? "High urgency"
      : opportunity.urgency === "medium"
        ? "Medium urgency"
        : "Low urgency";

  return {
    actionableItem: `${urgencyText} ${opportunity.serviceType.toLowerCase()} lead in ${opportunity.detectedTown} from ${sourceLabel}.`,
    cleanedPost,
    removedDetails: removedDetails.length ? removedDetails : ["No sensitive details found"],
    whyItMatters:
      "This is the version a coordinator can safely review before choosing a reply style.",
  };
}
