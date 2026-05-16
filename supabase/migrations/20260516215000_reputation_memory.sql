do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'reputation_memory_type'
  ) then
    create type public.reputation_memory_type as enum (
      'tone_works',
      'reply_converts',
      'employee_closes',
      'group_dislikes_promo'
    );
  end if;
end $$;

create table if not exists public.reputation_memories (
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

create index if not exists reputation_memories_business_type_idx
  on public.reputation_memories (business_id, memory_type, active, score desc);

alter table public.reputation_memories enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'reputation_memories'
      and policyname = 'Users can manage reputation memories'
  ) then
    create policy "Users can manage reputation memories"
      on public.reputation_memories for all
      using (business_id = public.current_business_id())
      with check (business_id = public.current_business_id());
  end if;
end $$;
