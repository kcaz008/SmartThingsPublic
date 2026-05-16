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
  Opportunity,
  Source,
  TargetKeyword,
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
  provider: ConnectedAccount["provider"];
  display_name: string;
  status: ConnectedAccount["status"];
  notes: string | null;
  created_at: string;
  last_connected_at: string | null;
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
      "id,business_id,provider,display_name,status,notes,created_at,last_connected_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .returns<ConnectedAccountRow[]>();

  if (error || !data) {
    return [];
  }

  return data.map(mapConnectedAccount);
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
    provider: row.provider,
    displayName: row.display_name,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    lastConnectedAt: row.last_connected_at ?? undefined,
  };
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
