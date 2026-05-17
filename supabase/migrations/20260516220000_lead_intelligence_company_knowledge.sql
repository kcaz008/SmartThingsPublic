alter table public.businesses
  add column if not exists services_offered text not null default '',
  add column if not exists emergency_availability text not null default '',
  add column if not exists brands_serviced text not null default '',
  add column if not exists financing_options text not null default '',
  add column if not exists warranty_notes text not null default '',
  add column if not exists preferred_tone text not null default '',
  add column if not exists phrases_to_avoid text not null default '';

create table if not exists public.competitor_mentions (
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

create index if not exists competitor_mentions_business_name_idx
  on public.competitor_mentions (business_id, competitor_name, created_at desc);

alter table public.competitor_mentions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'competitor_mentions'
      and policyname = 'Users can manage competitor mentions'
  ) then
    create policy "Users can manage competitor mentions"
      on public.competitor_mentions for all
      using (business_id = public.current_business_id())
      with check (business_id = public.current_business_id());
  end if;
end $$;
