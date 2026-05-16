alter table public.businesses
  add column if not exists cta_phone_rule text not null default 'usually_include_phone'
    check (cta_phone_rule in (
      'always_include_phone',
      'usually_include_phone',
      'dm_only',
      'never_first_public',
      'tracking_number',
      'employee_phone',
      'no_cta_if_promo_sensitive'
    )),
  add column if not exists tracking_phone text;

alter table public.sources
  add column if not exists promo_sensitivity text not null default 'medium'
    check (promo_sensitivity in ('low', 'medium', 'high')),
  add column if not exists admin_strictness text not null default 'medium'
    check (admin_strictness in ('low', 'medium', 'high')),
  add column if not exists best_reply_style text not null default 'both'
    check (best_reply_style in ('company', 'personal', 'both')),
  add column if not exists phone_safe_in_public boolean not null default true,
  add column if not exists dm_first_preferred boolean not null default false,
  add column if not exists second_responder_works boolean not null default true;

alter table public.connected_accounts
  add column if not exists allowed_business_ids uuid[] not null default '{}'::uuid[],
  add column if not exists allowed_groups text[] not null default '{}'::text[],
  add column if not exists reply_style text not null default 'both'
    check (reply_style in ('company', 'personal', 'both'));
