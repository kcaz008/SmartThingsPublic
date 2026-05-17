alter type public.connected_account_status add value if not exists 'needs_reauth';

create table if not exists public.team_members (
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

alter table public.connected_accounts
  add column if not exists team_member_id uuid references public.team_members(id) on delete set null,
  add column if not exists platform text not null default 'facebook'
    check (platform in ('facebook', 'nextdoor', 'reddit', 'manual', 'other')),
  add column if not exists external_account_id text,
  add column if not exists access_token_placeholder text,
  add column if not exists refresh_token_placeholder text,
  add column if not exists token_expires_at timestamptz,
  add column if not exists scopes text[] not null default '{}'::text[],
  add column if not exists connected_groups text[] not null default '{}'::text[],
  add column if not exists connected_at timestamptz,
  add column if not exists last_sync_at timestamptz;

update public.connected_accounts
set connected_at = coalesce(connected_at, last_connected_at)
where connected_at is null
  and last_connected_at is not null;

create table if not exists public.facebook_manual_posts (
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

create table if not exists public.facebook_reply_history (
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

create index if not exists team_members_business_active_idx
  on public.team_members (business_id, active, full_name);

create index if not exists connected_accounts_team_member_idx
  on public.connected_accounts (team_member_id, platform);

create index if not exists facebook_manual_posts_business_created_idx
  on public.facebook_manual_posts (business_id, created_at desc);

create index if not exists facebook_reply_history_business_created_idx
  on public.facebook_reply_history (business_id, created_at desc);

alter table public.team_members enable row level security;
alter table public.facebook_manual_posts enable row level security;
alter table public.facebook_reply_history enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'team_members'
      and policyname = 'Users can manage team members'
  ) then
    create policy "Users can manage team members"
      on public.team_members for all
      using (business_id = public.current_business_id())
      with check (business_id = public.current_business_id());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'facebook_manual_posts'
      and policyname = 'Users can manage manual Facebook posts'
  ) then
    create policy "Users can manage manual Facebook posts"
      on public.facebook_manual_posts for all
      using (business_id = public.current_business_id())
      with check (business_id = public.current_business_id());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'facebook_reply_history'
      and policyname = 'Users can manage Facebook reply history'
  ) then
    create policy "Users can manage Facebook reply history"
      on public.facebook_reply_history for all
      using (business_id = public.current_business_id())
      with check (business_id = public.current_business_id());
  end if;
end $$;
