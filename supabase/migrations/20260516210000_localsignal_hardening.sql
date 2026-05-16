do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'connected_account_status'
  ) then
    create type public.connected_account_status as enum (
      'not_connected',
      'pending_oauth',
      'connected',
      'error'
    );
  end if;
end $$;

alter table public.businesses
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.target_keywords (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  keyword text not null,
  created_at timestamptz not null default now(),
  unique (business_id, keyword)
);

create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  provider public.source_type not null default 'facebook_group',
  display_name text not null,
  status public.connected_account_status not null default 'pending_oauth',
  notes text,
  last_connected_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists target_keywords_business_keyword_idx
  on public.target_keywords (business_id, keyword);

create index if not exists connected_accounts_business_status_idx
  on public.connected_accounts (business_id, status);

create index if not exists audit_logs_business_created_idx
  on public.audit_logs (business_id, created_at desc);

alter table public.target_keywords enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.audit_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'target_keywords'
      and policyname = 'Users can manage target keywords'
  ) then
    create policy "Users can manage target keywords"
      on public.target_keywords for all
      using (business_id = public.current_business_id())
      with check (business_id = public.current_business_id());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'connected_accounts'
      and policyname = 'Users can manage connected account placeholders'
  ) then
    create policy "Users can manage connected account placeholders"
      on public.connected_accounts for all
      using (business_id = public.current_business_id())
      with check (business_id = public.current_business_id());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'Users can read audit logs'
  ) then
    create policy "Users can read audit logs"
      on public.audit_logs for select
      using (business_id = public.current_business_id());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_logs'
      and policyname = 'Users can insert audit logs'
  ) then
    create policy "Users can insert audit logs"
      on public.audit_logs for insert
      with check (business_id = public.current_business_id());
  end if;
end $$;
