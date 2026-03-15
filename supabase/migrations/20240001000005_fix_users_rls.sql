create policy "users_select_own"
  on public.users
  for select
  using (id = auth.uid());
