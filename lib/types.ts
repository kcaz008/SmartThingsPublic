export const opportunityStatuses = [
  "new",
  "drafted",
  "approved",
  "replied",
  "booked",
  "won",
  "lost",
  "ignored",
] as const;

export type OpportunityStatus = (typeof opportunityStatuses)[number];

export const autopilotModes = [
  "off",
  "draft_only",
  "approval_required",
  "post_when_connected",
] as const;

export type AutopilotMode = (typeof autopilotModes)[number];

export type UrgencyLevel = "low" | "medium" | "high" | "emergency";
export type LeadUrgency = "low" | "medium" | "high";
export type SourceType =
  | "facebook_group"
  | "nextdoor"
  | "reddit"
  | "manual"
  | "other";
export type Platform = "facebook" | "nextdoor" | "reddit" | "manual" | "other";
export type ReputationMemoryType =
  | "tone_works"
  | "reply_converts"
  | "employee_closes"
  | "group_dislikes_promo";
export type CtaPhoneRule =
  | "always_include_phone"
  | "usually_include_phone"
  | "dm_only"
  | "never_first_public"
  | "tracking_number"
  | "employee_phone"
  | "no_cta_if_promo_sensitive";
export type GroupSensitivity = "low" | "medium" | "high";
export type ReplyStyle = "company" | "personal" | "both";
export type IntentType =
  | "recommendation_request"
  | "urgent_repair"
  | "price_check"
  | "maintenance_question"
  | "complaint"
  | "not_relevant"
  | "other";

export type User = {
  id: string;
  businessId: string;
  email: string;
  fullName: string;
  role: "owner" | "admin" | "dispatcher" | "technician";
};

export type Business = {
  id: string;
  name: string;
  serviceArea: string;
  toneRules: string;
  phone: string;
  website: string;
  autopilotMode: AutopilotMode;
  servicesOffered: string;
  emergencyAvailability: string;
  brandsServiced: string;
  financingOptions: string;
  warrantyNotes: string;
  preferredTone: string;
  phrasesToAvoid: string;
  ctaPhoneRule: CtaPhoneRule;
  trackingPhone?: string;
  brandColor: string;
};

export type TargetKeyword = {
  id: string;
  businessId: string;
  keyword: string;
  createdAt: string;
};

export type TeamMember = {
  id: string;
  businessId: string;
  authUserId?: string;
  fullName: string;
  email: string;
  role: User["role"];
  phone?: string;
  facebookDisplayName?: string;
  active: boolean;
  createdAt: string;
};

export type ConnectedAccount = {
  id: string;
  businessId: string;
  teamMemberId?: string;
  platform: Platform;
  displayName: string;
  status:
    | "not_connected"
    | "pending_oauth"
    | "connected"
    | "needs_reauth"
    | "error";
  externalAccountId?: string;
  allowedBusinessIds: string[];
  connectedGroups: string[];
  allowedGroups: string[];
  replyStyle: ReplyStyle;
  scopes: string[];
  notes?: string;
  createdAt: string;
  connectedAt?: string;
  lastSyncAt?: string;
};

export type FacebookManualPost = {
  id: string;
  businessId: string;
  sourceId?: string;
  externalPostId?: string;
  postUrl?: string;
  authorName?: string;
  postText: string;
  commentCount: number;
  createdAt: string;
};

export type FacebookReplyHistory = {
  id: string;
  businessId: string;
  manualPostId: string;
  teamMemberId?: string;
  aiReplyId?: string;
  responseText: string;
  commentsAgo: number;
  respondedAt: string;
  createdAt: string;
};

export type ReputationMemory = {
  id: string;
  businessId: string;
  memoryType: ReputationMemoryType;
  subject: string;
  sourceId?: string;
  teamMemberId?: string;
  opportunityId?: string;
  content: string;
  score: number;
  evidenceCount: number;
  metadata: Record<string, unknown>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompetitorMention = {
  id: string;
  businessId: string;
  opportunityId?: string;
  sourceId?: string;
  competitorName: string;
  town?: string;
  mentionCount: number;
  mentionedBeforeUs: boolean;
  higherPriority: boolean;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  businessId: string;
  userId?: string;
  action: string;
  targetTable?: string;
  targetId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type Source = {
  id: string;
  businessId: string;
  name: string;
  type: SourceType;
  url?: string;
  town: string;
  active: boolean;
  promoSensitivity: GroupSensitivity;
  adminStrictness: GroupSensitivity;
  bestReplyStyle: ReplyStyle;
  phoneSafeInPublic: boolean;
  dmFirstPreferred: boolean;
  secondResponderWorks: boolean;
};

export type AiAnalysis = {
  isServiceOpportunity: boolean;
  category: string;
  urgency: UrgencyLevel;
  confidence: number;
  homeownerIntent: string;
  recommendedAction: string;
  spamRisk: "low" | "medium" | "high";
};

export type Opportunity = {
  id: string;
  businessId: string;
  sourceId: string;
  originalText: string;
  postUrl?: string;
  authorName: string;
  detectedTown: string;
  serviceType: string;
  urgency: LeadUrgency;
  leadScore: number;
  sentiment: string;
  intentType: IntentType;
  status: OpportunityStatus;
  createdAt: string;
};

export type AiReply = {
  id: string;
  opportunityId: string;
  draftText: string;
  approved: boolean;
  copied: boolean;
  postedManually: boolean;
  createdAt: string;
};
