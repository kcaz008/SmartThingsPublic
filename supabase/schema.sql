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
  'approval_required'
);

create type public.source_type as enum (
  'facebook_group',
  'nextdoor',
  'reddit',
  'manual',
  'other'
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  website text,
  service_area text not null,
  tone_rules text not null default 'Helpful local pro, clear, specific, and never pushy.',
  autopilot_mode public.autopilot_mode not null default 'off'
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  type public.source_type not null default 'manual',
  url text,
  town text,
  active boolean not null default true
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

create table public.approved_platform_connections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  platform text not null,
  external_account_name text not null,
  permission_scope text not null,
  connected_at timestamptz not null default now(),
  active boolean not null default true
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  event_type text not null,
  event_summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.crm_followups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  channel text not null default 'crm' check (channel in ('phone', 'email', 'crm', 'other')),
  summary text not null,
  due_at timestamptz,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.disclosure_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  body text not null,
  active boolean not null default true,
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

create index approved_connections_business_idx
  on public.approved_platform_connections (business_id, active);

create index audit_events_business_created_idx
  on public.audit_events (business_id, created_at desc);

create index crm_followups_business_created_idx
  on public.crm_followups (business_id, created_at desc);

create index disclosure_templates_business_idx
  on public.disclosure_templates (business_id, active);

alter table public.businesses enable row level security;
alter table public.sources enable row level security;
alter table public.opportunities enable row level security;
alter table public.ai_replies enable row level security;
alter table public.approved_platform_connections enable row level security;
alter table public.audit_events enable row level security;
alter table public.crm_followups enable row level security;
alter table public.disclosure_templates enable row level security;

create or replace function public.current_business_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'business_id', '')::uuid
$$;

create policy "Users can read their business"
  on public.businesses for select
  using (id = public.current_business_id());

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

create policy "Users can manage approved platform connections"
  on public.approved_platform_connections for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage audit events"
  on public.audit_events for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage CRM followups"
  on public.crm_followups for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy "Users can manage disclosure templates"
  on public.disclosure_templates for all
  using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());
