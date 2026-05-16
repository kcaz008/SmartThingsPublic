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
  vertical text not null default 'hvac',
  service_area text not null,
  phone text,
  website text,
  tone text not null default 'Helpful local pro, clear, specific, and never pushy.',
  autopilot_mode public.autopilot_mode not null default 'off',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  type public.source_type not null default 'manual',
  url text,
  neighborhood text,
  active boolean not null default true,
  lead_score integer not null default 50 check (lead_score between 0 and 100),
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  title text not null,
  author_name text,
  neighborhood text,
  post_text text not null,
  status public.opportunity_status not null default 'new',
  urgency text not null default 'low' check (urgency in ('low', 'medium', 'high', 'emergency')),
  confidence numeric(4, 3) not null default 0 check (confidence >= 0 and confidence <= 1),
  estimated_value integer not null default 0,
  tags text[] not null default '{}',
  ai_analysis jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now(),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_replies (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  body text not null,
  tone text not null default 'neighborly',
  status text not null default 'draft' check (status in ('draft', 'approved', 'copied')),
  model text not null,
  prompt_version text not null default 'mvp_v1',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index opportunities_business_status_idx
  on public.opportunities (business_id, status, detected_at desc);

create index opportunities_business_urgency_idx
  on public.opportunities (business_id, urgency, detected_at desc);

create index ai_replies_opportunity_created_idx
  on public.ai_replies (opportunity_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger sources_set_updated_at
  before update on public.sources
  for each row execute function public.set_updated_at();

create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

create trigger ai_replies_set_updated_at
  before update on public.ai_replies
  for each row execute function public.set_updated_at();

alter table public.businesses enable row level security;
alter table public.users enable row level security;
alter table public.sources enable row level security;
alter table public.opportunities enable row level security;
alter table public.ai_replies enable row level security;

create or replace function public.current_business_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select business_id
  from public.users
  where auth_user_id = auth.uid()
  limit 1
$$;

create policy "Users can read their business"
  on public.businesses for select
  using (id = public.current_business_id());

create policy "Users can update their business"
  on public.businesses for update
  using (id = public.current_business_id())
  with check (id = public.current_business_id());

create policy "Users can read teammates"
  on public.users for select
  using (business_id = public.current_business_id());

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
