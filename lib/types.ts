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
] as const;

export type AutopilotMode = (typeof autopilotModes)[number];

export type UrgencyLevel = "low" | "medium" | "high" | "emergency";

export type User = {
  id: string;
  businessId: string;
  email: string;
  fullName: string;
  role: "owner" | "dispatcher" | "technician";
};

export type Business = {
  id: string;
  name: string;
  vertical: "hvac";
  serviceArea: string;
  tone: string;
  phone: string;
  website: string;
  autopilotMode: AutopilotMode;
};

export type Source = {
  id: string;
  businessId: string;
  name: string;
  type: "facebook_group" | "nextdoor" | "reddit" | "manual" | "other";
  url?: string;
  neighborhood: string;
  active: boolean;
  leadScore: number;
  lastCheckedAt: string;
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
  sourceName: string;
  title: string;
  authorName: string;
  neighborhood: string;
  postText: string;
  status: OpportunityStatus;
  urgency: UrgencyLevel;
  confidence: number;
  estimatedValue: number;
  detectedAt: string;
  tags: string[];
  aiAnalysis: AiAnalysis;
};

export type AiReply = {
  id: string;
  opportunityId: string;
  body: string;
  tone: "neighborly" | "professional" | "concise";
  status: "draft" | "approved" | "copied";
  model: string;
  createdAt: string;
};
