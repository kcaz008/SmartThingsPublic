import { createSupabaseServerClient } from "@/lib/supabase";
import { recommendedKeywords } from "@/lib/default-keywords";
import {
  aiReplies as sampleReplies,
  businesses as sampleBusinesses,
  competitorMentions as sampleCompetitorMentions,
  currentBusiness as sampleBusiness,
  opportunities as sampleOpportunities,
  sources as sampleSources,
  teamMembers as sampleTeamMembers,
} from "@/lib/sample-data";
import type {
  AiReply,
  AuditLog,
  Business,
  ConnectedAccount,
  CompetitorMention,
  FacebookManualPost,
  FacebookReplyHistory,
  Opportunity,
  ReputationMemory,
  Source,
  TargetKeyword,
  TeamMember,
} from "@/lib/types";

type BusinessRow = {
  id: string;
  name: string;
  service_area: string;
  tone_rules: string;
  phone: string | null;
  website: string | null;
  autopilot_mode: Business["autopilotMode"];
  services_offered: string | null;
  emergency_availability: string | null;
  brands_serviced: string | null;
  financing_options: string | null;
  warranty_notes: string | null;
  preferred_tone: string | null;
  phrases_to_avoid: string | null;
  cta_phone_rule: Business["ctaPhoneRule"] | null;
  tracking_phone: string | null;
};

type SourceRow = {
  id: string;
  business_id: string;
  name: string;
  type: Source["type"];
  url: string | null;
  town: string | null;
  active: boolean;
  promo_sensitivity: Source["promoSensitivity"] | null;
  admin_strictness: Source["adminStrictness"] | null;
  best_reply_style: Source["bestReplyStyle"] | null;
  phone_safe_in_public: boolean | null;
  dm_first_preferred: boolean | null;
  second_responder_works: boolean | null;
};

type OpportunityRow = {
  id: string;
  business_id: string;
  source_id: string | null;
  original_text: string;
  post_url: string | null;
  author_name: string | null;
  detected_town: string | null;
  service_type: string | null;
  urgency: Opportunity["urgency"];
  lead_score: number;
  sentiment: string | null;
  intent_type: Opportunity["intentType"];
  status: Opportunity["status"];
  created_at: string;
};

type ReplyRow = {
  id: string;
  opportunity_id: string;
  draft_text: string;
  approved: boolean;
  copied: boolean;
  posted_manually: boolean;
  created_at: string;
};

type KeywordRow = {
  id: string;
  business_id: string;
  keyword: string;
  created_at: string;
};

type ConnectedAccountRow = {
  id: string;
  business_id: string;
  team_member_id: string | null;
  platform: ConnectedAccount["platform"];
  provider: Source["type"] | null;
  external_account_id: string | null;
  allowed_business_ids: string[] | null;
  display_name: string;
  status: ConnectedAccount["status"];
  connected_groups: string[] | null;
  allowed_groups: string[] | null;
  reply_style: ConnectedAccount["replyStyle"] | null;
  scopes: string[] | null;
  notes: string | null;
  created_at: string;
  connected_at: string | null;
  last_sync_at: string | null;
};

type TeamMemberRow = {
  id: string;
  business_id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  role: TeamMember["role"];
  phone: string | null;
  facebook_display_name: string | null;
  active: boolean;
  created_at: string;
};

type FacebookManualPostRow = {
  id: string;
  business_id: string;
  source_id: string | null;
  external_post_id: string | null;
  post_url: string | null;
  author_name: string | null;
  post_text: string;
  comment_count: number;
  created_at: string;
};

type FacebookReplyHistoryRow = {
  id: string;
  business_id: string;
  manual_post_id: string;
  team_member_id: string | null;
  ai_reply_id: string | null;
  response_text: string;
  comments_ago: number;
  responded_at: string;
  created_at: string;
};

type AuditLogRow = {
  id: string;
  business_id: string;
  user_id: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type ReputationMemoryRow = {
  id: string;
  business_id: string;
  memory_type: ReputationMemory["memoryType"];
  subject: string;
  source_id: string | null;
  team_member_id: string | null;
  opportunity_id: string | null;
  content: string;
  score: number;
  evidence_count: number;
  metadata: Record<string, unknown> | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type CompetitorMentionRow = {
  id: string;
  business_id: string;
  opportunity_id: string | null;
  source_id: string | null;
  competitor_name: string;
  town: string | null;
  mention_count: number;
  mentioned_before_us: boolean;
  higher_priority: boolean;
  created_at: string;
};

export async function getBusiness(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return (
      sampleBusinesses.find((business) => business.id === businessId) ??
      sampleBusiness
    );
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,service_area,tone_rules,phone,website,autopilot_mode,services_offered,emergency_availability,brands_serviced,financing_options,warranty_notes,preferred_tone,phrases_to_avoid,cta_phone_rule,tracking_phone")
    .eq("id", businessId)
    .single<BusinessRow>();

  if (error || !data) {
    return sampleBusiness;
  }

  return mapBusiness(data);
}

export async function listBusinesses() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return sampleBusinesses;
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,service_area,tone_rules,phone,website,autopilot_mode,services_offered,emergency_availability,brands_serviced,financing_options,warranty_notes,preferred_tone,phrases_to_avoid,cta_phone_rule,tracking_phone")
    .order("name")
    .returns<BusinessRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapBusiness);
}

export async function listSources(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return sampleSources.filter((source) => source.businessId === businessId);
  }

  const { data, error } = await supabase
    .from("sources")
    .select("id,business_id,name,type,url,town,active,promo_sensitivity,admin_strictness,best_reply_style,phone_safe_in_public,dm_first_preferred,second_responder_works")
    .eq("business_id", businessId)
    .order("active", { ascending: false })
    .order("name")
    .returns<SourceRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapSource);
}

export async function listOpportunities(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return sampleOpportunities.filter(
      (opportunity) => opportunity.businessId === businessId,
    );
  }

  const { data, error } = await supabase
    .from("opportunities")
    .select(
      "id,business_id,source_id,original_text,post_url,author_name,detected_town,service_type,urgency,lead_score,sentiment,intent_type,status,created_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .returns<OpportunityRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapOpportunity);
}

export async function getOpportunity(
  businessId: string | null,
  opportunityId: string,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return sampleOpportunities.find(
      (opportunity) =>
        opportunity.id === opportunityId && opportunity.businessId === businessId,
    );
  }

  const { data, error } = await supabase
    .from("opportunities")
    .select(
      "id,business_id,source_id,original_text,post_url,author_name,detected_town,service_type,urgency,lead_score,sentiment,intent_type,status,created_at",
    )
    .eq("business_id", businessId)
    .eq("id", opportunityId)
    .single<OpportunityRow>();

  if (error || !data) {
    return null;
  }

  return mapOpportunity(data);
}

export async function getReplyForOpportunity(
  businessId: string | null,
  opportunityId: string,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return sampleReplies.find((reply) => reply.opportunityId === opportunityId);
  }

  const { data, error } = await supabase
    .from("ai_replies")
    .select(
      "id,opportunity_id,draft_text,approved,copied,posted_manually,created_at",
    )
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single<ReplyRow>();

  if (error || !data) {
    return null;
  }

  return mapReply(data);
}

export async function getSource(businessId: string | null, sourceId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return sampleSources.find(
      (source) => source.id === sourceId && source.businessId === businessId,
    );
  }

  const { data, error } = await supabase
    .from("sources")
    .select("id,business_id,name,type,url,town,active")
    .eq("business_id", businessId)
    .eq("id", sourceId)
    .single<SourceRow>();

  if (error || !data) {
    return null;
  }

  return mapSource(data);
}

export async function listTargetKeywords(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return recommendedKeywords.map((keyword, index) => ({
      id: `demo_keyword_${index}`,
      businessId: businessId ?? sampleBusiness.id,
      keyword,
      createdAt: new Date(0).toISOString(),
    })) satisfies TargetKeyword[];
  }

  const { data, error } = await supabase
    .from("target_keywords")
    .select("id,business_id,keyword,created_at")
    .eq("business_id", businessId)
    .order("keyword")
    .returns<KeywordRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapKeyword);
}

export async function listConnectedAccounts(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return [] satisfies ConnectedAccount[];
  }

  const { data, error } = await supabase
    .from("connected_accounts")
    .select(
      "id,business_id,team_member_id,platform,provider,external_account_id,allowed_business_ids,display_name,status,connected_groups,allowed_groups,reply_style,scopes,notes,created_at,connected_at,last_sync_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .returns<ConnectedAccountRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapConnectedAccount);
}

export async function listTeamMembers(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return sampleTeamMembers.filter((member) => member.businessId === businessId);
  }

  const { data, error } = await supabase
    .from("team_members")
    .select(
      "id,business_id,auth_user_id,full_name,email,role,phone,facebook_display_name,active,created_at",
    )
    .eq("business_id", businessId)
    .order("active", { ascending: false })
    .order("full_name")
    .returns<TeamMemberRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapTeamMember);
}

export async function listFacebookManualPosts(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return [] satisfies FacebookManualPost[];
  }

  const { data, error } = await supabase
    .from("facebook_manual_posts")
    .select(
      "id,business_id,source_id,external_post_id,post_url,author_name,post_text,comment_count,created_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(12)
    .returns<FacebookManualPostRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapFacebookManualPost);
}

export async function listFacebookReplyHistory(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return [] satisfies FacebookReplyHistory[];
  }

  const { data, error } = await supabase
    .from("facebook_reply_history")
    .select(
      "id,business_id,manual_post_id,team_member_id,ai_reply_id,response_text,comments_ago,responded_at,created_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<FacebookReplyHistoryRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapFacebookReplyHistory);
}

export async function listAuditLogs(businessId: string | null, limit = 10) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return [] satisfies AuditLog[];
  }

  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id,business_id,user_id,action,target_table,target_id,metadata,created_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<AuditLogRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapAuditLog);
}

export async function listReputationMemories(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return [] satisfies ReputationMemory[];
  }

  const { data, error } = await supabase
    .from("reputation_memories")
    .select(
      "id,business_id,memory_type,subject,source_id,team_member_id,opportunity_id,content,score,evidence_count,metadata,active,created_at,updated_at",
    )
    .eq("business_id", businessId)
    .order("active", { ascending: false })
    .order("score", { ascending: false })
    .order("updated_at", { ascending: false })
    .returns<ReputationMemoryRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapReputationMemory);
}

export async function listCompetitorMentions(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return sampleCompetitorMentions.filter(
      (mention) => mention.businessId === businessId,
    );
  }

  const { data, error } = await supabase
    .from("competitor_mentions")
    .select(
      "id,business_id,opportunity_id,source_id,competitor_name,town,mention_count,mentioned_before_us,higher_priority,created_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .returns<CompetitorMentionRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapCompetitorMention);
}

export async function getReputationMemorySummary(businessId: string | null) {
  const memories = await listReputationMemories(businessId);
  const activeMemories = memories.filter((memory) => memory.active).slice(0, 12);

  if (!activeMemories.length) {
    return "";
  }

  return activeMemories
    .map((memory) => {
      const label = memory.memoryType.replaceAll("_", " ");
      return `${label}: ${memory.subject} - ${memory.content}`;
    })
    .join("\n");
}

function mapBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    serviceArea: row.service_area,
    toneRules: row.tone_rules,
    phone: row.phone ?? "",
    website: row.website ?? "",
    autopilotMode: row.autopilot_mode,
    servicesOffered: row.services_offered ?? "",
    emergencyAvailability: row.emergency_availability ?? "",
    brandsServiced: row.brands_serviced ?? "",
    financingOptions: row.financing_options ?? "",
    warrantyNotes: row.warranty_notes ?? "",
    preferredTone: row.preferred_tone ?? "",
    phrasesToAvoid: row.phrases_to_avoid ?? "",
    ctaPhoneRule: row.cta_phone_rule ?? "usually_include_phone",
    trackingPhone: row.tracking_phone ?? undefined,
  };
}

function mapSource(row: SourceRow): Source {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    type: row.type,
    url: row.url ?? undefined,
    town: row.town ?? "All service areas",
    active: row.active,
    promoSensitivity: row.promo_sensitivity ?? "medium",
    adminStrictness: row.admin_strictness ?? "medium",
    bestReplyStyle: row.best_reply_style ?? "both",
    phoneSafeInPublic: row.phone_safe_in_public ?? true,
    dmFirstPreferred: row.dm_first_preferred ?? false,
    secondResponderWorks: row.second_responder_works ?? true,
  };
}

function mapOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    businessId: row.business_id,
    sourceId: row.source_id ?? "",
    originalText: row.original_text,
    postUrl: row.post_url ?? undefined,
    authorName: row.author_name ?? "Unknown",
    detectedTown: row.detected_town ?? "Unknown",
    serviceType: row.service_type ?? "HVAC Service",
    urgency: row.urgency,
    leadScore: row.lead_score,
    sentiment: row.sentiment ?? "unknown",
    intentType: row.intent_type,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapReply(row: ReplyRow): AiReply {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    draftText: row.draft_text,
    approved: row.approved,
    copied: row.copied,
    postedManually: row.posted_manually,
    createdAt: row.created_at,
  };
}

function mapKeyword(row: KeywordRow): TargetKeyword {
  return {
    id: row.id,
    businessId: row.business_id,
    keyword: row.keyword,
    createdAt: row.created_at,
  };
}

function mapConnectedAccount(row: ConnectedAccountRow): ConnectedAccount {
  return {
    id: row.id,
    businessId: row.business_id,
    teamMemberId: row.team_member_id ?? undefined,
    platform: row.platform ?? platformFromProvider(row.provider),
    displayName: row.display_name,
    status: row.status,
    externalAccountId: row.external_account_id ?? undefined,
    allowedBusinessIds: row.allowed_business_ids ?? [],
    connectedGroups: row.connected_groups ?? [],
    allowedGroups: row.allowed_groups ?? [],
    replyStyle: row.reply_style ?? "both",
    scopes: row.scopes ?? [],
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    connectedAt: row.connected_at ?? undefined,
    lastSyncAt: row.last_sync_at ?? undefined,
  };
}

function mapTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    businessId: row.business_id,
    authUserId: row.auth_user_id ?? undefined,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    phone: row.phone ?? undefined,
    facebookDisplayName: row.facebook_display_name ?? undefined,
    active: row.active,
    createdAt: row.created_at,
  };
}

function mapFacebookManualPost(row: FacebookManualPostRow): FacebookManualPost {
  return {
    id: row.id,
    businessId: row.business_id,
    sourceId: row.source_id ?? undefined,
    externalPostId: row.external_post_id ?? undefined,
    postUrl: row.post_url ?? undefined,
    authorName: row.author_name ?? undefined,
    postText: row.post_text,
    commentCount: row.comment_count,
    createdAt: row.created_at,
  };
}

function mapFacebookReplyHistory(
  row: FacebookReplyHistoryRow,
): FacebookReplyHistory {
  return {
    id: row.id,
    businessId: row.business_id,
    manualPostId: row.manual_post_id,
    teamMemberId: row.team_member_id ?? undefined,
    aiReplyId: row.ai_reply_id ?? undefined,
    responseText: row.response_text,
    commentsAgo: row.comments_ago,
    respondedAt: row.responded_at,
    createdAt: row.created_at,
  };
}

function platformFromProvider(provider: Source["type"] | null) {
  if (provider === "facebook_group") {
    return "facebook";
  }

  return provider ?? "other";
}

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    businessId: row.business_id,
    userId: row.user_id ?? undefined,
    action: row.action,
    targetTable: row.target_table ?? undefined,
    targetId: row.target_id ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

function mapReputationMemory(row: ReputationMemoryRow): ReputationMemory {
  return {
    id: row.id,
    businessId: row.business_id,
    memoryType: row.memory_type,
    subject: row.subject,
    sourceId: row.source_id ?? undefined,
    teamMemberId: row.team_member_id ?? undefined,
    opportunityId: row.opportunity_id ?? undefined,
    content: row.content,
    score: row.score,
    evidenceCount: row.evidence_count,
    metadata: row.metadata ?? {},
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompetitorMention(row: CompetitorMentionRow): CompetitorMention {
  return {
    id: row.id,
    businessId: row.business_id,
    opportunityId: row.opportunity_id ?? undefined,
    sourceId: row.source_id ?? undefined,
    competitorName: row.competitor_name,
    town: row.town ?? undefined,
    mentionCount: row.mention_count,
    mentionedBeforeUs: row.mentioned_before_us,
    higherPriority: row.higher_priority,
    createdAt: row.created_at,
  };
}
