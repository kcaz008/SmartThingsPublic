import type { AiReply, Business, Opportunity, Source, User } from "@/lib/types";

export const currentBusiness: Business = {
  id: "biz_greenline_hvac",
  name: "Greenline Heating & Air",
  serviceArea: "North Austin neighborhoods",
  toneRules: "Helpful local pro, never pushy, clear next step.",
  phone: "(512) 555-0188",
  website: "https://greenline.example",
  autopilotMode: "draft_only",
};

export const currentUser: User = {
  id: "user_avery",
  businessId: currentBusiness.id,
  email: "avery@greenline.example",
  fullName: "Avery Chen",
  role: "owner",
};

export const sources: Source[] = [
  {
    id: "src_maple_fb",
    businessId: currentBusiness.id,
    name: "Maple Grove Neighbors",
    type: "facebook_group",
    url: "https://facebook.com/groups/maple-grove-neighbors",
    town: "Maple Grove",
    active: true,
  },
  {
    id: "src_northloop_nextdoor",
    businessId: currentBusiness.id,
    name: "North Loop Nextdoor",
    type: "nextdoor",
    town: "North Loop",
    active: true,
  },
  {
    id: "src_manual",
    businessId: currentBusiness.id,
    name: "Manual intake",
    type: "manual",
    town: "All service areas",
    active: true,
  },
  {
    id: "src_reddit",
    businessId: currentBusiness.id,
    name: "r/Austin homeowners",
    type: "reddit",
    town: "Austin",
    active: false,
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "opp_ac_not_cooling",
    businessId: currentBusiness.id,
    sourceId: "src_maple_fb",
    postUrl: "https://facebook.com/groups/maple-grove-neighbors/posts/1001",
    authorName: "Megan R.",
    detectedTown: "Maple Grove",
    serviceType: "HVAC Repair",
    urgency: "high",
    leadScore: 94,
    sentiment: "frustrated",
    intentType: "urgent_repair",
    originalText:
      "Does anyone have a recommendation for an AC person who can come out today? Our system is running constantly but the house will not get below 82 and we have family visiting tonight.",
    status: "drafted",
    createdAt: "2026-05-16T03:46:00Z",
  },
  {
    id: "opp_second_opinion",
    businessId: currentBusiness.id,
    sourceId: "src_northloop_nextdoor",
    postUrl: "https://nextdoor.com/p/second-opinion-hvac",
    authorName: "Daniel P.",
    detectedTown: "North Loop",
    serviceType: "HVAC Estimate",
    urgency: "medium",
    leadScore: 86,
    sentiment: "skeptical",
    intentType: "price_check",
    originalText:
      "We were quoted for a full HVAC replacement and it feels high. Has anyone used a company that will do an honest second opinion before we decide?",
    status: "approved",
    createdAt: "2026-05-15T22:12:00Z",
  },
  {
    id: "opp_filter_noise",
    businessId: currentBusiness.id,
    sourceId: "src_manual",
    authorName: "Priya S.",
    detectedTown: "Crestview",
    serviceType: "HVAC Maintenance",
    urgency: "low",
    leadScore: 69,
    sentiment: "curious",
    intentType: "maintenance_question",
    originalText:
      "After changing our AC filter there is a rattling sound near the return. Is that something simple or should I call someone?",
    status: "new",
    createdAt: "2026-05-15T18:30:00Z",
  },
  {
    id: "opp_booked_tuneup",
    businessId: currentBusiness.id,
    sourceId: "src_maple_fb",
    authorName: "Carlos M.",
    detectedTown: "Wooten",
    serviceType: "HVAC Maintenance",
    urgency: "medium",
    leadScore: 90,
    sentiment: "proactive",
    intentType: "recommendation_request",
    originalText:
      "Looking for someone local to do a spring AC tune-up before next week's heat. Prefer a small business if possible.",
    status: "booked",
    createdAt: "2026-05-14T16:04:00Z",
  },
];

export const aiReplies: AiReply[] = [
  {
    id: "reply_ac_not_cooling",
    opportunityId: "opp_ac_not_cooling",
    approved: false,
    copied: false,
    postedManually: false,
    createdAt: "2026-05-16T03:47:00Z",
    draftText:
      "Hi Megan - sorry you are dealing with that, especially with family coming in. If the system is running nonstop and holding at 82, it is worth having airflow and the outdoor unit checked. Greenline Heating & Air is local and can help take a look if you still need someone.",
  },
  {
    id: "reply_second_opinion",
    opportunityId: "opp_second_opinion",
    approved: true,
    copied: true,
    postedManually: false,
    createdAt: "2026-05-15T22:14:00Z",
    draftText:
      "Hi Daniel - getting a second opinion is a smart move before a full replacement. Greenline Heating & Air can review the quote, inspect the system, and explain what looks necessary versus optional without pressure.",
  },
];

export function getOpportunityById(id: string) {
  return opportunities.find((opportunity) => opportunity.id === id);
}

export function getReplyForOpportunity(opportunityId: string) {
  return aiReplies.find((reply) => reply.opportunityId === opportunityId);
}

export function getSourceById(id: string) {
  return sources.find((source) => source.id === id);
}
