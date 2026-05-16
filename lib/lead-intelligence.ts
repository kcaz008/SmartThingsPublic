import type {
  AiReply,
  CompetitorMention,
  FacebookReplyHistory,
  Opportunity,
  ReputationMemory,
  Source,
  TeamMember,
} from "@/lib/types";

export type LeadTemperature = "Hot" | "Warm" | "Cold";
export type SuggestedNextAction =
  | "Reply now"
  | "Wait"
  | "Follow up"
  | "DM instead"
  | "Already handled"
  | "Assign to team member"
  | "Avoid replying";
export type CoordinationLabel =
  | "Safe to reply"
  | "Wait"
  | "DM only"
  | "Already handled"
  | "Second responder recommended"
  | "Avoid replying";

export type LeadIntelligence = {
  temperature: LeadTemperature;
  likelihoodToConvert: number;
  homeownerRenterGuess: "Homeowner" | "Renter" | "Unknown";
  emergency: boolean;
  recommendedResponseSpeed: string;
  suggestedNextAction: SuggestedNextAction;
  bestResponder: string;
  adminRiskWarnings: string[];
  embarrassmentWarnings: string[];
  collisionWarnings: string[];
  safetyLabel: CoordinationLabel;
  secondResponderRecommended: boolean;
  firstResponder: string;
  recommendedSecondResponder: string;
  secondResponderReason: string;
  competitorInsights: string[];
};

export type LeadAnalytics = {
  leadsByTown: Array<{ label: string; count: number }>;
  leadsByGroup: Array<{ label: string; count: number }>;
  hotLeadsThisWeek: number;
  responseRate: number;
  bookedClosedCount: number;
  competitorMentions: number;
  followUpsNeeded: number;
  secondResponderNeeded: number;
  teamCollisions: number;
  wrongBrandRisk: number;
  dmRecommended: number;
  hotUnassigned: number;
  followUpsByEmployee: Array<{ label: string; count: number }>;
};

const hostilePattern =
  /spam|stop soliciting|no businesses|no contractors|sales pitch|vultures|annoying|reported/i;
const contractorCrowdPattern =
  /too many contractors|contractors already|companies already|everyone commenting|5 contractors|six companies|bunch of hvac/i;
const bookedPattern = /booked|scheduled|appointment set|already found someone|taken care of/i;
const renterPattern = /landlord|rental|renting|apartment|property manager/i;
const homeownerPattern = /my house|our house|homeowner|own this|replacement quote|my system/i;

export function deriveLeadIntelligence({
  opportunity,
  source,
  teamMembers = [],
  reply,
  replyHistory = [],
  reputationMemories = [],
  competitorMentions = [],
}: {
  opportunity: Opportunity;
  source?: Source | null;
  teamMembers?: TeamMember[];
  reply?: AiReply | null;
  replyHistory?: FacebookReplyHistory[];
  reputationMemories?: ReputationMemory[];
  competitorMentions?: CompetitorMention[];
}): LeadIntelligence {
  const text = opportunity.originalText;
  const textLower = text.toLowerCase();
  const relevantCompetitors = competitorMentions.filter(
    (mention) =>
      mention.opportunityId === opportunity.id ||
      mention.sourceId === opportunity.sourceId ||
      mention.town === opportunity.detectedTown,
  );
  const promoSensitiveMemory = reputationMemories.find(
    (memory) =>
      memory.active &&
      memory.memoryType === "group_dislikes_promo" &&
      (memory.sourceId === opportunity.sourceId ||
        memory.subject.toLowerCase().includes(source?.name.toLowerCase() ?? "")),
  );
  const phoneUnsafe = source && !source.phoneSafeInPublic;
  const dmPreferred = source?.dmFirstPreferred || source?.promoSensitivity === "high";
  const emergency =
    opportunity.urgency === "high" ||
    /no heat|no ac|no a\/c|not cooling|not heating|burning|leak|carbon monoxide|sparking|emergency|today|tonight|asap/i.test(
      text,
    );
  const competitorBoost = relevantCompetitors.some((mention) => mention.higherPriority)
    ? 8
    : relevantCompetitors.length
      ? 4
      : 0;
  const riskPenalty =
    hostilePattern.test(text) || promoSensitiveMemory ? 12 : contractorCrowdPattern.test(text) ? 6 : 0;
  const likelihoodToConvert = clamp(
    opportunity.leadScore + competitorBoost - riskPenalty,
    0,
    100,
  );
  const temperature: LeadTemperature =
    likelihoodToConvert >= 82 || emergency
      ? "Hot"
      : likelihoodToConvert >= 58
        ? "Warm"
        : "Cold";
  const adminRiskWarnings = [
    contractorCrowdPattern.test(text)
      ? "Many contractors may already be in the thread."
      : "",
    hostilePattern.test(text)
      ? "Thread sounds hostile to business replies."
      : "",
    promoSensitiveMemory
      ? `${source?.name ?? "This group"} has memory warning against promotional comments.`
      : "",
    phoneUnsafe ? "Phone number is not safe in public comments for this group." : "",
    dmPreferred ? "This group is better handled DM-first." : "",
  ].filter(Boolean);
  const firstResponder =
    reply?.copied || ["approved", "replied", "booked", "won"].includes(opportunity.status)
      ? teamMembers[0]?.fullName ?? "A team member"
      : "None yet";
  const recommendedSecondResponder =
    teamMembers.find((member) => member.fullName !== firstResponder && member.role === "dispatcher")
      ?.fullName ??
    teamMembers.find((member) => member.fullName !== firstResponder)?.fullName ??
    "Assign second responder";
  const competitorAfterUs = relevantCompetitors.some(
    (mention) => !mention.mentionedBeforeUs,
  );
  const secondResponderRecommended =
    firstResponder !== "None yet" &&
    source?.secondResponderWorks !== false &&
    (competitorAfterUs ||
      opportunity.status === "approved" ||
      /follow up|any update|still need|did you/i.test(text));
  const secondResponderReason = secondResponderRecommended
    ? competitorAfterUs
      ? "A competitor commented after us while the thread is still active."
      : "The first reply may need a more personal follow-up."
    : "No second responder needed yet.";
  const embarrassmentWarnings = [
    reply?.copied || opportunity.status === "replied"
      ? "Our team appears to have already replied."
      : "",
    bookedPattern.test(text) || ["booked", "won", "lost"].includes(opportunity.status)
      ? "Lead may already be booked, closed, or handled."
      : "",
    hostilePattern.test(text) ? "Thread has turned negative or weird." : "",
    textLower.includes("same reply") || textLower.includes("copy paste")
      ? "A repetitive reply may be noticed."
      : "",
    textLower.includes("516-777-0242") || textLower.includes("(516) 777-0242")
      ? "Phone number was already posted recently."
      : "",
    source?.bestReplyStyle === "personal"
      ? "A personal/team-member reply may feel safer than another company reply."
      : "",
  ].filter(Boolean);
  const collisionWarnings = [
    firstResponder !== "None yet" ? `${firstResponder} already replied or copied a draft.` : "",
    ["booked", "won", "lost"].includes(opportunity.status)
      ? "Lead is already booked or closed."
      : "",
    /no more company comments|please no more|stop commenting/i.test(text)
      ? "Customer asked not to receive more company comments."
      : "",
  ].filter(Boolean);
  const bestResponder = chooseBestResponder({
    opportunity,
    teamMembers,
    replyHistory,
    reputationMemories,
  });

  return {
    temperature,
    likelihoodToConvert,
    homeownerRenterGuess: renterPattern.test(text)
      ? "Renter"
      : homeownerPattern.test(text)
        ? "Homeowner"
        : "Unknown",
    emergency,
    recommendedResponseSpeed: emergency
      ? "Reply within 5-10 minutes"
      : temperature === "Hot"
        ? "Reply within 30 minutes"
        : temperature === "Warm"
          ? "Reply today"
          : "Monitor or wait",
    suggestedNextAction: chooseNextAction({
      opportunity,
      emergency,
      adminRiskWarnings,
      embarrassmentWarnings,
      bestResponder,
      temperature,
    }),
    bestResponder,
    adminRiskWarnings,
    embarrassmentWarnings,
    collisionWarnings,
    safetyLabel: chooseSafetyLabel({
      opportunity,
      secondResponderRecommended,
      adminRiskWarnings,
      embarrassmentWarnings,
      collisionWarnings,
      dmPreferred,
    }),
    secondResponderRecommended,
    firstResponder,
    recommendedSecondResponder,
    secondResponderReason,
    competitorInsights: relevantCompetitors.map((mention) => {
      const timing = mention.mentionedBeforeUs ? "before us" : "after us";
      const priority = mention.higherPriority ? "raises priority" : "monitor";
      return `${mention.competitorName}: ${mention.mentionCount} mention(s), ${timing}; ${priority}.`;
    }),
  };
}

export function buildLeadAnalytics({
  opportunities,
  sources,
  intelligenceById,
  competitorMentions,
}: {
  opportunities: Opportunity[];
  sources: Source[];
  intelligenceById: Map<string, LeadIntelligence>;
  competitorMentions: CompetitorMention[];
}): LeadAnalytics {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const respondedCount = opportunities.filter((opportunity) =>
    ["replied", "booked", "won"].includes(opportunity.status),
  ).length;

  return {
    leadsByTown: topCounts(opportunities.map((opportunity) => opportunity.detectedTown)),
    leadsByGroup: topCounts(
      opportunities.map(
        (opportunity) =>
          sources.find((source) => source.id === opportunity.sourceId)?.name ??
          "Unknown group",
      ),
    ),
    hotLeadsThisWeek: opportunities.filter((opportunity) => {
      const createdAt = new Date(opportunity.createdAt).getTime();
      return (
        createdAt >= weekAgo &&
        intelligenceById.get(opportunity.id)?.temperature === "Hot"
      );
    }).length,
    responseRate: opportunities.length
      ? Math.round((respondedCount / opportunities.length) * 100)
      : 0,
    bookedClosedCount: opportunities.filter((opportunity) =>
      ["booked", "won"].includes(opportunity.status),
    ).length,
    competitorMentions: competitorMentions.reduce(
      (total, mention) => total + mention.mentionCount,
      0,
    ),
    followUpsNeeded: opportunities.filter(
      (opportunity) =>
        intelligenceById.get(opportunity.id)?.suggestedNextAction === "Follow up",
    ).length,
    secondResponderNeeded: opportunities.filter(
      (opportunity) =>
        intelligenceById.get(opportunity.id)?.secondResponderRecommended,
    ).length,
    teamCollisions: opportunities.filter(
      (opportunity) =>
        (intelligenceById.get(opportunity.id)?.collisionWarnings.length ?? 0) > 0,
    ).length,
    wrongBrandRisk: 0,
    dmRecommended: opportunities.filter(
      (opportunity) =>
        intelligenceById.get(opportunity.id)?.safetyLabel === "DM only",
    ).length,
    hotUnassigned: opportunities.filter((opportunity) => {
      const intelligence = intelligenceById.get(opportunity.id);
      return (
        intelligence?.temperature === "Hot" &&
        intelligence.bestResponder === "Assign to team member"
      );
    }).length,
    followUpsByEmployee: topCounts(
      opportunities
        .filter(
          (opportunity) =>
            intelligenceById.get(opportunity.id)?.suggestedNextAction ===
            "Follow up",
        )
        .map(
          (opportunity) =>
            intelligenceById.get(opportunity.id)?.bestResponder ?? "Unassigned",
        ),
    ),
  };
}

function chooseBestResponder({
  opportunity,
  teamMembers,
  replyHistory,
  reputationMemories,
}: {
  opportunity: Opportunity;
  teamMembers: TeamMember[];
  replyHistory: FacebookReplyHistory[];
  reputationMemories: ReputationMemory[];
}) {
  const memoryMatch = reputationMemories.find(
    (memory) =>
      memory.active &&
      memory.memoryType === "employee_closes" &&
      memory.teamMemberId &&
      (memory.subject
        .toLowerCase()
        .includes(opportunity.serviceType.toLowerCase()) ||
        memory.subject.toLowerCase().includes(opportunity.detectedTown.toLowerCase())),
  );
  const memoryResponder = teamMembers.find(
    (member) => member.id === memoryMatch?.teamMemberId,
  );

  if (memoryResponder) {
    return memoryResponder.fullName;
  }

  const priorReply = replyHistory.find(
    (history) => history.teamMemberId && history.businessId === opportunity.businessId,
  );
  const priorResponder = teamMembers.find(
    (member) => member.id === priorReply?.teamMemberId,
  );

  if (priorResponder) {
    return priorResponder.fullName;
  }

  const technician = teamMembers.find(
    (member) => member.active && member.role === "technician",
  );
  const dispatcher = teamMembers.find(
    (member) => member.active && member.role === "dispatcher",
  );

  if (opportunity.urgency === "high" && technician) {
    return technician.fullName;
  }

  return dispatcher?.fullName ?? technician?.fullName ?? "Assign to team member";
}

function chooseNextAction({
  opportunity,
  emergency,
  adminRiskWarnings,
  embarrassmentWarnings,
  bestResponder,
  temperature,
}: {
  opportunity: Opportunity;
  emergency: boolean;
  adminRiskWarnings: string[];
  embarrassmentWarnings: string[];
  bestResponder: string;
  temperature: LeadTemperature;
}): SuggestedNextAction {
  if (["booked", "won", "lost", "ignored"].includes(opportunity.status)) {
    return "Already handled";
  }

  if (embarrassmentWarnings.length) {
    if (temperature === "Hot" && bestResponder !== "Assign to team member") {
      return "DM instead";
    }
    return "Avoid replying";
  }

  if (adminRiskWarnings.length) {
    return "DM instead";
  }

  if (bestResponder === "Assign to team member") {
    return "Assign to team member";
  }

  if (opportunity.status === "approved" || opportunity.status === "replied") {
    return "Follow up";
  }

  if (emergency || temperature === "Hot") {
    return "Reply now";
  }

  return temperature === "Warm" ? "Follow up" : "Wait";
}

function chooseSafetyLabel({
  opportunity,
  secondResponderRecommended,
  adminRiskWarnings,
  embarrassmentWarnings,
  collisionWarnings,
  dmPreferred,
}: {
  opportunity: Opportunity;
  secondResponderRecommended: boolean;
  adminRiskWarnings: string[];
  embarrassmentWarnings: string[];
  collisionWarnings: string[];
  dmPreferred?: boolean;
}): CoordinationLabel {
  if (["booked", "won", "lost", "ignored"].includes(opportunity.status)) {
    return "Already handled";
  }

  if (secondResponderRecommended) {
    return "Second responder recommended";
  }

  if (embarrassmentWarnings.length || collisionWarnings.length) {
    return "Avoid replying";
  }

  if (dmPreferred || adminRiskWarnings.length) {
    return "DM only";
  }

  if (opportunity.urgency === "low") {
    return "Wait";
  }

  return "Safe to reply";
}

function topCounts(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
