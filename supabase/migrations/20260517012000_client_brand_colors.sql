alter table public.businesses
  add column if not exists brand_color text not null default '#2563eb';
