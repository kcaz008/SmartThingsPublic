import { createSupabaseServerClient } from "@/lib/supabase";
import {
  aiReplies as sampleReplies,
  currentBusiness as sampleBusiness,
  opportunities as sampleOpportunities,
  sources as sampleSources,
} from "@/lib/sample-data";
import type {
  AiReply,
  AuditLog,
  Business,
  ConnectedAccount,
  FacebookManualPost,
  FacebookReplyHistory,
  Opportunity,
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
};

type SourceRow = {
  id: string;
  business_id: string;
  name: string;
  type: Source["type"];
  url: string | null;
  town: string | null;
  active: boolean;
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
  display_name: string;
  status: ConnectedAccount["status"];
  connected_groups: string[] | null;
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

export async function getBusiness(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return sampleBusiness;
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,service_area,tone_rules,phone,website,autopilot_mode")
    .eq("id", businessId)
    .single<BusinessRow>();

  if (error || !data) {
    return sampleBusiness;
  }

  return mapBusiness(data);
}

export async function listSources(businessId: string | null) {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !businessId) {
    return sampleSources;
  }

  const { data, error } = await supabase
    .from("sources")
    .select("id,business_id,name,type,url,town,active")
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
    return sampleOpportunities;
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
      (opportunity) => opportunity.id === opportunityId,
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
    return sampleSources.find((source) => source.id === sourceId);
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
    return [] satisfies TargetKeyword[];
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
      "id,business_id,team_member_id,platform,provider,external_account_id,display_name,status,connected_groups,scopes,notes,created_at,connected_at,last_sync_at",
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
    return [] satisfies TeamMember[];
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

function mapBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    serviceArea: row.service_area,
    toneRules: row.tone_rules,
    phone: row.phone ?? "",
    website: row.website ?? "",
    autopilotMode: row.autopilot_mode,
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
    connectedGroups: row.connected_groups ?? [],
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
