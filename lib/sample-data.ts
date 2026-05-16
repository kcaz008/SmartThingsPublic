import type { AiReply, Business, Opportunity, Source, User } from "@/lib/types";

export const currentBusiness: Business = {
  id: "biz_greenline_hvac",
  name: "Greenline Heating & Air",
  vertical: "hvac",
  serviceArea: "North Austin neighborhoods",
  tone: "Helpful local pro, never pushy, clear next step.",
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
    neighborhood: "Maple Grove",
    active: true,
    leadScore: 84,
    lastCheckedAt: "2026-05-16T03:35:00Z",
  },
  {
    id: "src_northloop_nextdoor",
    businessId: currentBusiness.id,
    name: "North Loop Nextdoor",
    type: "nextdoor",
    neighborhood: "North Loop",
    active: true,
    leadScore: 71,
    lastCheckedAt: "2026-05-16T02:20:00Z",
  },
  {
    id: "src_manual",
    businessId: currentBusiness.id,
    name: "Manual intake",
    type: "manual",
    neighborhood: "All service areas",
    active: true,
    leadScore: 92,
    lastCheckedAt: "2026-05-16T03:58:00Z",
  },
  {
    id: "src_reddit",
    businessId: currentBusiness.id,
    name: "r/Austin homeowners",
    type: "reddit",
    neighborhood: "Austin",
    active: false,
    leadScore: 43,
    lastCheckedAt: "2026-05-14T22:10:00Z",
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "opp_ac_not_cooling",
    businessId: currentBusiness.id,
    sourceId: "src_maple_fb",
    sourceName: "Maple Grove Neighbors",
    title: "AC running but house is still 82",
    authorName: "Megan R.",
    neighborhood: "Maple Grove",
    postText:
      "Does anyone have a recommendation for an AC person who can come out today? Our system is running constantly but the house will not get below 82 and we have family visiting tonight.",
    status: "drafted",
    urgency: "emergency",
    confidence: 0.94,
    estimatedValue: 425,
    detectedAt: "2026-05-16T03:46:00Z",
    tags: ["no cooling", "same-day", "referral request"],
    aiAnalysis: {
      isServiceOpportunity: true,
      category: "No-cooling emergency",
      urgency: "emergency",
      confidence: 0.94,
      homeownerIntent:
        "Needs a trusted HVAC technician today and is likely ready to book.",
      recommendedAction:
        "Reply with empathy, mention same-day diagnostics, and invite a quick call.",
      spamRisk: "low",
    },
  },
  {
    id: "opp_second_opinion",
    businessId: currentBusiness.id,
    sourceId: "src_northloop_nextdoor",
    sourceName: "North Loop Nextdoor",
    title: "Second opinion on full HVAC replacement quote",
    authorName: "Daniel P.",
    neighborhood: "North Loop",
    postText:
      "We were quoted for a full HVAC replacement and it feels high. Has anyone used a company that will do an honest second opinion before we decide?",
    status: "approved",
    urgency: "medium",
    confidence: 0.86,
    estimatedValue: 9800,
    detectedAt: "2026-05-15T22:12:00Z",
    tags: ["replacement", "second opinion", "high value"],
    aiAnalysis: {
      isServiceOpportunity: true,
      category: "Replacement estimate review",
      urgency: "medium",
      confidence: 0.86,
      homeownerIntent:
        "Comparing bids and looking for a trustworthy local HVAC company.",
      recommendedAction:
        "Offer a no-pressure second opinion and avoid criticizing the other quote.",
      spamRisk: "medium",
    },
  },
  {
    id: "opp_filter_noise",
    businessId: currentBusiness.id,
    sourceId: "src_manual",
    sourceName: "Manual intake",
    title: "New rattling noise after filter change",
    authorName: "Priya S.",
    neighborhood: "Crestview",
    postText:
      "After changing our AC filter there is a rattling sound near the return. Is that something simple or should I call someone?",
    status: "new",
    urgency: "low",
    confidence: 0.69,
    estimatedValue: 160,
    detectedAt: "2026-05-15T18:30:00Z",
    tags: ["noise", "maintenance", "education"],
    aiAnalysis: {
      isServiceOpportunity: true,
      category: "Maintenance question",
      urgency: "low",
      confidence: 0.69,
      homeownerIntent:
        "Looking for quick guidance before deciding whether to book service.",
      recommendedAction:
        "Give one safe troubleshooting tip and offer a service visit if it continues.",
      spamRisk: "low",
    },
  },
  {
    id: "opp_booked_tuneup",
    businessId: currentBusiness.id,
    sourceId: "src_maple_fb",
    sourceName: "Maple Grove Neighbors",
    title: "Spring tune-up before heat wave",
    authorName: "Carlos M.",
    neighborhood: "Wooten",
    postText:
      "Looking for someone local to do a spring AC tune-up before next week's heat. Prefer a small business if possible.",
    status: "booked",
    urgency: "medium",
    confidence: 0.9,
    estimatedValue: 189,
    detectedAt: "2026-05-14T16:04:00Z",
    tags: ["tune-up", "preventive", "small business"],
    aiAnalysis: {
      isServiceOpportunity: true,
      category: "Seasonal tune-up",
      urgency: "medium",
      confidence: 0.9,
      homeownerIntent:
        "Ready to schedule preventive maintenance with a local provider.",
      recommendedAction:
        "Mention local availability and simple online or phone scheduling.",
      spamRisk: "low",
    },
  },
];

export const aiReplies: AiReply[] = [
  {
    id: "reply_ac_not_cooling",
    opportunityId: "opp_ac_not_cooling",
    tone: "neighborly",
    status: "draft",
    model: "placeholder-local",
    createdAt: "2026-05-16T03:47:00Z",
    body:
      "Hi Megan - sorry you are dealing with that, especially with family coming in. If the system is running nonstop and holding at 82, it is worth having someone check refrigerant levels, airflow, and the outdoor unit today. We are Greenline Heating & Air, a local HVAC company, and we have a couple same-day diagnostic windows. Happy to help if you want to call or text (512) 555-0188.",
  },
  {
    id: "reply_second_opinion",
    opportunityId: "opp_second_opinion",
    tone: "professional",
    status: "approved",
    model: "placeholder-local",
    createdAt: "2026-05-15T22:14:00Z",
    body:
      "Hi Daniel - getting a second opinion is a smart move before a full replacement. We are Greenline Heating & Air and can review the quote, inspect the system, and explain what looks necessary versus optional without pressure. If helpful, send us a message or call (512) 555-0188 and we can set up a time.",
  },
];

export function getOpportunityById(id: string) {
  return opportunities.find((opportunity) => opportunity.id === id);
}

export function getReplyForOpportunity(opportunityId: string) {
  return aiReplies.find((reply) => reply.opportunityId === opportunityId);
}
