alter table public.sources
  add column if not exists assigned_team_member_id uuid references public.team_members(id) on delete set null,
  add column if not exists last_checked_at timestamptz,
  add column if not exists check_frequency text,
  add column if not exists notes text;

create table if not exists public.browser_imports (
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

create index if not exists browser_imports_business_status_idx
  on public.browser_imports (business_id, status, created_at desc);

create index if not exists browser_imports_post_url_idx
  on public.browser_imports (business_id, post_url);

create index if not exists browser_imports_text_hash_idx
  on public.browser_imports (business_id, text_hash);

alter table public.browser_imports enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'browser_imports'
      and policyname = 'Users can manage browser imports'
  ) then
    create policy "Users can manage browser imports"
      on public.browser_imports for all
      using (business_id = public.current_business_id())
      with check (business_id = public.current_business_id());
  end if;
end $$;
