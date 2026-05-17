create extension if not exists pgcrypto;

create type public.opportunity_status as enum (
  'new',
  'drafted',
  'approved',
  'replied',
  'booked',
  'won',
  'lost',
  'ignored'
);

create type public.autopilot_mode as enum (
  'off',
  'draft_only',
  'approval_required',
  'post_when_connected'
);

create type public.source_type as enum (
  'facebook_group',
  'nextdoor',
  'reddit',
  'manual',
  'other'
);

create type public.connected_account_status as enum (
  'not_connected',
  'pending_oauth',
  'connected',
  'needs_reauth',
  'error'
);

create type public.reputation_memory_type as enum (
  'tone_works',
  'reply_converts',
  'employee_closes',
  'group_dislikes_promo'
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  website text,
  service_area text not null,
  tone_rules text not null default 'Helpful local pro, clear, specific, and never pushy.',
  autopilot_mode public.autopilot_mode not null default 'off',
  services_offered text not null default '',
  emergency_availability text not null default '',
  brands_serviced text not null default '',
  financing_options text not null default '',
  warranty_notes text not null default '',
  preferred_tone text not null default '',
  phrases_to_avoid text not null default '',
  cta_phone_rule text not null default 'usually_include_phone'
    check (cta_phone_rule in (
      'always_include_phone',
      'usually_include_phone',
      'dm_only',
      'never_first_public',
      'tracking_number',
      'employee_phone',
      'no_cta_if_promo_sensitive'
    )),
  tracking_phone text,
  brand_color text not null default '#2563eb',
  created_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  auth_user_id uuid,
  full_name text not null,
  email text not null,
  role text not null default 'dispatcher'
    check (role in ('owner', 'admin', 'dispatcher', 'technician')),
  phone text,
  facebook_display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (business_id, email)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  type public.source_type not null default 'manual',
  url text,
  town text,
  active boolean not null default true,
  promo_sensitivity text not null default 'medium'
    check (promo_sensitivity in ('low', 'medium', 'high')),
  admin_strictness text not null default 'medium'
    check (admin_strictness in ('low', 'medium', 'high')),
  best_reply_style text not null default 'both'
    check (best_reply_style in ('company', 'personal', 'both')),
  phone_safe_in_public boolean not null default true,
  dm_first_preferred boolean not null default false,
  second_responder_works boolean not null default true,
  assigned_team_member_id uuid references public.team_members(id) on delete set null,
  last_checked_at timestamptz,
  check_frequency text,
  notes text
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  original_text text not null,
  post_url text,
  author_name text,
  detected_town text,
  service_type text,
  urgency text not null default 'low' check (urgency in ('low', 'medium', 'high')),
  lead_score integer not null default 0 check (lead_score between 0 and 100),
  sentiment text,
  intent_type text,
  status public.opportunity_status not null default 'new',
  created_at timestamptz not null default now()
);

create table public.ai_replies (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  draft_text text not null,
  approved boolean not null default false,
  copied boolean not null default false,
  posted_manually boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.target_keywords (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  keyword text not null,
  created_at timestamptz not null default now(),
  unique (business_id, keyword)
);

create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  team_member_id uuid references public.team_members(id) on delete set null,
  platform text not null default 'facebook'
    check (platform in ('facebook', 'nextdoor', 'reddit', 'manual', 'other')),
  provider public.source_type not null default 'facebook_group',
  external_account_id text,
  allowed_business_ids uuid[] not null default '{}'::uuid[],
  display_name text not null,
  status public.connected_account_status not null default 'pending_oauth',
  access_token_placeholder text,
  refresh_token_placeholder text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}'::text[],
  connected_groups text[] not null default '{}'::text[],
  allowed_groups text[] not null default '{}'::text[],
  reply_style text not null default 'both'
    check (reply_style in ('company', 'personal', 'both')),
  notes text,
  connected_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.facebook_manual_posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  external_post_id text,
  post_url text,
  author_name text,
  post_text text not null,
  comment_count integer not null default 0 check (comment_count >= 0),
  created_at timestamptz not null default now(),
  unique (business_id, external_post_id),
  unique (business_id, post_url)
);

create table public.facebook_reply_history (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  manual_post_id uuid not null references public.facebook_manual_posts(id) on delete cascade,
  team_member_id uuid references public.team_members(id) on delete set null,
  ai_reply_id uuid references public.ai_replies(id) on delete set null,
  response_text text not null,
  comments_ago integer not null default 0 check (comments_ago >= 0),
  responded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (manual_post_id, team_member_id)
);

create table public.reputation_memories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  memory_type public.reputation_memory_type not null,
  subject text not null,
  source_id uuid references public.sources(id) on delete set null,
  team_member_id uuid references public.team_members(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  content text not null,
  score integer not null default 50 check (score between 0 and 100),
  evidence_count integer not null default 1 check (evidence_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competitor_mentions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  competitor_name text not null,
  town text,
  mention_count integer not null default 1 check (mention_count >= 0),
  mentioned_before_us boolean not null default true,
  higher_priority boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.browser_imports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  source text not null default 'facebook_browser_assist',
  group_name text not null,
  group_url text,
  post_url text,
  poster_name text,
  post_text text not null,
  visible_comments text[] not null default '{}'::text[],
  imported_by_team_member_id uuid references public.team_members(id) on delete set null,
  text_hash text not null,
  duplicate_of uuid references public.browser_imports(id) on delete set null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'saved_as_lead', 'ignored')),
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index opportunities_business_status_idx
  on public.opportunities (business_id, status, created_at desc);

create index opportunities_business_urgency_idx
  on public.opportunities (business_id, urgency, created_at desc);

create index sources_business_active_idx
  on public.sources (business_id, active);

create index ai_replies_opportunity_created_idx
  on public.ai_replies (opportunity_id, created_at desc);

create index team_members_business_active_idx
  on public.team_members (business_id, active, full_name);

create index target_keywords_business_keyword_idx
  on public.target_keywords (business_id, keyword);

create index connected_accounts_business_status_idx
  on public.connected_accounts (business_id, status);

create index connected_accounts_team_member_idx
  on public.connected_accounts (team_member_id, platform);

create index facebook_manual_posts_business_created_idx
  on public.facebook_manual_posts (business_id, created_at desc);

create index facebook_reply_history_business_created_idx
  on public.facebook_reply_history (business_id, created_at desc);

create index reputation_memories_business_type_idx
  on public.reputation_memories (business_id, memory_type, active, score desc);

create index competitor_mentions_business_name_idx
  on public.competitor_mentions (business_id, competitor_name, created_at desc);

create index browser_imports_business_status_idx
  on public.browser_imports (business_id, status, created_at desc);

create index browser_imports_post_url_idx
  on public.browser_imports (business_id, post_url);

create index browser_imports_text_hash_idx
  on public.browser_imports (business_id, text_hash);

create index audit_logs_business_created_idx
  on public.audit_logs (business_id, created_at desc);

alter table public.businesses enable row level security;
alter table public.sources enable row level security;
alter table public.opportunities enable row level security;
alter table public.ai_replies enable row level security;
alter table public.team_members enable row level security;
alter table public.target_keywords enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.facebook_manual_posts enable row level security;
alter table public.facebook_reply_history enable row level security;
alter table public.reputation_memories enable row level security;
alter table public.competitor_mentions enable row level security;
alter table public.browser_imports enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_business_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'business_id', '')::uuid
$$;

create policy "Users can read their business"
  on public.businesses for select
  using (true);

create policy "Users can create client businesses"
  on public.businesses for insert
  with check (true);

create policy "Users can update their business"
  on public.businesses for update
  using (id = public.current_business_id())
  with check (id = public.current_business_id());

create policy "Users can manage sources"
  on public.sources for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage opportunities"
  on public.opportunities for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage replies through opportunities"
  on public.ai_replies for all
  using (
    exists (
      select 1
      from public.opportunities
      where opportunities.id = ai_replies.opportunity_id
        and opportunities.business_id = public.current_business_id()
    )
  )
  with check (
    exists (
      select 1
      from public.opportunities
      where opportunities.id = ai_replies.opportunity_id
        and opportunities.business_id = public.current_business_id()
    )
  );

create policy "Users can manage team members"
  on public.team_members for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage target keywords"
  on public.target_keywords for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage connected account placeholders"
  on public.connected_accounts for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage manual Facebook posts"
  on public.facebook_manual_posts for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage Facebook reply history"
  on public.facebook_reply_history for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage reputation memories"
  on public.reputation_memories for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage competitor mentions"
  on public.competitor_mentions for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage browser imports"
  on public.browser_imports for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can read audit logs"
  on public.audit_logs for select
  using (business_id = public.current_business_id());

create policy "Users can insert audit logs"
  on public.audit_logs for insert
  with check (business_id = public.current_business_id());
