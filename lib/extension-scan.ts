import { createAiAnalysis } from "@/lib/openai";
import { currentBusiness } from "@/lib/sample-data";

export type VisiblePostInput = {
  original_text: string;
  post_url?: string;
  author_name?: string;
};

export type ExtensionScanInput = {
  source_name: string;
  source_type: string;
  page_url?: string;
  posts: VisiblePostInput[];
};

export type ExtensionOpportunityCard = {
  id: string;
  group_source_name: string;
  original_post_text: string;
  post_url?: string;
  author_name?: string;
  service_type: string;
  urgency: "low" | "medium" | "high";
  town: string;
  lead_score: number;
  sentiment: string;
  intent_type: string;
  suggested_reply: string;
  status: "drafted" | "ignored" | "replied" | "booked" | "won";
};

const MAX_VISIBLE_POSTS_PER_SCAN = 25;
const MIN_POST_LENGTH = 24;

export async function scanVisiblePosts(
  input: ExtensionScanInput,
): Promise<ExtensionOpportunityCard[]> {
  const visiblePosts = dedupeVisiblePosts(input.posts)
    .filter((post) => post.original_text.length >= MIN_POST_LENGTH)
    .slice(0, MAX_VISIBLE_POSTS_PER_SCAN);

  const analyzedPosts: Array<ExtensionOpportunityCard | null> = await Promise.all(
    visiblePosts.map(async (post) => {
      const analysis = await createAiAnalysis({
        post_text: post.original_text,
        source_name: input.source_name,
        source_type: input.source_type,
        service_area: currentBusiness.serviceArea,
        company_name: currentBusiness.name,
        company_phone: currentBusiness.phone,
        tone_rules: currentBusiness.toneRules,
      });

      if (!analysis.is_relevant) {
        return null;
      }

      return {
        id: stableCardId(input.source_name, post.original_text),
        group_source_name: input.source_name,
        original_post_text: post.original_text,
        post_url: post.post_url,
        author_name: post.author_name,
        service_type: analysis.service_type,
        urgency: analysis.urgency,
        town: analysis.detected_town,
        lead_score: analysis.lead_score,
        sentiment: analysis.sentiment,
        intent_type: analysis.intent_type,
        suggested_reply: analysis.suggested_reply,
        status: "drafted" as const,
      };
    }),
  );

  return analyzedPosts.filter(isOpportunityCard);
}

function isOpportunityCard(
  card: ExtensionOpportunityCard | null,
): card is ExtensionOpportunityCard {
  return card !== null;
}

function dedupeVisiblePosts(posts: VisiblePostInput[]) {
  const seen = new Set<string>();

  return posts
    .map((post) => ({
      ...post,
      original_text: normalizePostText(post.original_text),
    }))
    .filter((post) => {
      if (!post.original_text || seen.has(post.original_text)) {
        return false;
      }

      seen.add(post.original_text);
      return true;
    });
}

function normalizePostText(value: string) {
  return value
    .replace(/\b(Like|Comment|Share|Send|See more)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stableCardId(sourceName: string, postText: string) {
  const hashInput = `${sourceName}:${postText}`;
  let hash = 0;

  for (let index = 0; index < hashInput.length; index += 1) {
    hash = (hash << 5) - hash + hashInput.charCodeAt(index);
    hash |= 0;
  }

  return `scan_${Math.abs(hash).toString(36)}`;
}
