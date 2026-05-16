import type {
  AiReply,
  Business,
  CompetitorMention,
  Opportunity,
  Source,
  TeamMember,
  User,
} from "@/lib/types";

export const currentBusiness: Business = {
  id: "biz_atlantic_climate",
  name: "Atlantic Climate Systems",
  serviceArea: "Nassau County, Suffolk County, Queens, and western Long Island",
  toneRules:
    "Helpful Long Island HVAC pro, neighborly, specific, never pushy.",
  phone: "(516) 777-0242",
  website: "https://atlanticclimatesystems.example",
  autopilotMode: "draft_only",
  servicesOffered:
    "AC repair, heating repair, furnace service, boiler service, heat pumps, mini-splits, indoor air quality, maintenance, installations.",
  emergencyAvailability:
    "Same-day emergency HVAC help when schedules allow; no false guarantees.",
  brandsServiced:
    "Carrier, Trane, Lennox, Rheem, Goodman, Mitsubishi, Fujitsu, Bosch, Navien, and most major HVAC brands.",
  financingOptions: "Financing may be available for qualifying replacements.",
  warrantyNotes:
    "Warranty depends on equipment, repair type, and manufacturer coverage.",
  preferredTone:
    "Calm, practical, local, and plainspoken. Mention one useful diagnostic clue.",
  phrasesToAvoid:
    "Best in town, cheapest, call now, guaranteed today, we beat any price.",
};

export const currentUser: User = {
  id: "user_avery",
  businessId: currentBusiness.id,
  email: "avery@atlanticclimatesystems.example",
  fullName: "Avery Chen",
  role: "owner",
};

export const teamMembers: TeamMember[] = [
  {
    id: "tm_avery",
    businessId: currentBusiness.id,
    authUserId: currentUser.id,
    email: currentUser.email,
    fullName: currentUser.fullName,
    role: "owner",
    phone: "(516) 777-0242",
    facebookDisplayName: "Avery at Atlantic Climate",
    active: true,
    createdAt: "2026-05-01T12:00:00Z",
  },
  {
    id: "tm_maria",
    businessId: currentBusiness.id,
    email: "maria@atlanticclimatesystems.example",
    fullName: "Maria Lopez",
    role: "dispatcher",
    phone: "(516) 777-0242",
    facebookDisplayName: "Maria L.",
    active: true,
    createdAt: "2026-05-02T12:00:00Z",
  },
  {
    id: "tm_rob",
    businessId: currentBusiness.id,
    email: "rob@atlanticclimatesystems.example",
    fullName: "Rob Feldman",
    role: "technician",
    phone: "(516) 777-0242",
    facebookDisplayName: "Rob F.",
    active: true,
    createdAt: "2026-05-03T12:00:00Z",
  },
];

export const sources: Source[] = [
  {
    id: "src_garden_city_fb",
    businessId: currentBusiness.id,
    name: "Garden City Moms & Neighbors",
    type: "facebook_group",
    url: "https://facebook.com/groups/garden-city-neighbors",
    town: "Garden City",
    active: true,
  },
  {
    id: "src_massapequa_fb",
    businessId: currentBusiness.id,
    name: "Massapequa Community Forum",
    type: "facebook_group",
    town: "Massapequa",
    active: true,
  },
  {
    id: "src_manual",
    businessId: currentBusiness.id,
    name: "Manual intake",
    type: "manual",
    town: "Long Island",
    active: true,
  },
  {
    id: "src_huntington_fb",
    businessId: currentBusiness.id,
    name: "Huntington Homeowners",
    type: "facebook_group",
    town: "Huntington",
    active: true,
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "opp_ac_not_cooling",
    businessId: currentBusiness.id,
    sourceId: "src_garden_city_fb",
    postUrl: "https://facebook.com/groups/garden-city-neighbors/posts/1001",
    authorName: "Megan R.",
    detectedTown: "Garden City",
    serviceType: "HVAC Repair",
    urgency: "high",
    leadScore: 94,
    sentiment: "frustrated",
    intentType: "urgent_repair",
    originalText:
      "Our AC stopped cooling and the upstairs is 84. Two contractors already commented and someone mentioned Cool Breeze. Need someone honest in Garden City tonight if possible.",
    status: "drafted",
    createdAt: "2026-05-16T03:46:00Z",
  },
  {
    id: "opp_second_opinion",
    businessId: currentBusiness.id,
    sourceId: "src_massapequa_fb",
    postUrl: "https://facebook.com/groups/massapequa-community/posts/2882",
    authorName: "Daniel P.",
    detectedTown: "Massapequa",
    serviceType: "HVAC Estimate",
    urgency: "medium",
    leadScore: 86,
    sentiment: "skeptical",
    intentType: "price_check",
    originalText:
      "We own a cape in Massapequa and got a huge replacement quote from Four Seasons. Is it worth getting a second opinion before signing?",
    status: "approved",
    createdAt: "2026-05-15T22:12:00Z",
  },
  {
    id: "opp_filter_noise",
    businessId: currentBusiness.id,
    sourceId: "src_manual",
    authorName: "Priya S.",
    detectedTown: "Queens",
    serviceType: "HVAC Maintenance",
    urgency: "low",
    leadScore: 69,
    sentiment: "curious",
    intentType: "maintenance_question",
    originalText:
      "Apartment AC is rattling after the filter was changed. Landlord says wait until Monday. Is this dangerous or just annoying?",
    status: "new",
    createdAt: "2026-05-15T18:30:00Z",
  },
  {
    id: "opp_booked_tuneup",
    businessId: currentBusiness.id,
    sourceId: "src_huntington_fb",
    authorName: "Carlos M.",
    detectedTown: "Huntington",
    serviceType: "HVAC Maintenance",
    urgency: "medium",
    leadScore: 90,
    sentiment: "proactive",
    intentType: "recommendation_request",
    originalText:
      "Booked a spring tune-up for next week. Thanks everyone. Please no more company comments.",
    status: "booked",
    createdAt: "2026-05-14T16:04:00Z",
  },
  {
    id: "opp_hostile_thread",
    businessId: currentBusiness.id,
    sourceId: "src_massapequa_fb",
    authorName: "Lena T.",
    detectedTown: "Massapequa",
    serviceType: "HVAC Service",
    urgency: "medium",
    leadScore: 72,
    sentiment: "annoyed",
    intentType: "recommendation_request",
    originalText:
      "Can anyone recommend an HVAC company that is NOT going to spam me? Last time 6 companies piled on with call now comments. Looking for one quiet recommendation.",
    status: "new",
    createdAt: "2026-05-16T12:20:00Z",
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
      "Hi Megan - sorry you are dealing with that heat upstairs. If it is running nonstop, airflow and the outdoor unit are worth checking first. Atlantic Climate Systems is local; if you still need help, we can point you in the right direction.",
  },
  {
    id: "reply_second_opinion",
    opportunityId: "opp_second_opinion",
    approved: true,
    copied: true,
    postedManually: false,
    createdAt: "2026-05-15T22:14:00Z",
    draftText:
      "Hi Daniel - a second opinion before a full replacement is smart. Atlantic Climate Systems can review what was quoted, look at the system, and explain what seems necessary versus optional without pressure.",
  },
];

export const competitorMentions: CompetitorMention[] = [
  {
    id: "comp_cool_breeze_garden",
    businessId: currentBusiness.id,
    opportunityId: "opp_ac_not_cooling",
    sourceId: "src_garden_city_fb",
    competitorName: "Cool Breeze",
    town: "Garden City",
    mentionCount: 2,
    mentionedBeforeUs: true,
    higherPriority: true,
    createdAt: "2026-05-16T03:50:00Z",
  },
  {
    id: "comp_four_seasons_massapequa",
    businessId: currentBusiness.id,
    opportunityId: "opp_second_opinion",
    sourceId: "src_massapequa_fb",
    competitorName: "Four Seasons",
    town: "Massapequa",
    mentionCount: 1,
    mentionedBeforeUs: true,
    higherPriority: true,
    createdAt: "2026-05-15T22:20:00Z",
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
