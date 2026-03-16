drop policy if exists "tickets_insert_org" on public.tickets;

create policy "tickets_insert_org"
  on public.tickets
  for insert
  with check (
    public.current_user_can_access_org(org_id)
    and created_by = auth.uid()
    and (
      select role from public.users where id = auth.uid()
    ) in ('technician', 'admin')
  );
