do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'businesses'
      and policyname = 'Users can create client businesses'
  ) then
    create policy "Users can create client businesses"
      on public.businesses for insert
      with check (true);
  end if;
end $$;

drop policy if exists "Users can read their business" on public.businesses;

create policy "Users can read client businesses"
  on public.businesses for select
  using (true);
