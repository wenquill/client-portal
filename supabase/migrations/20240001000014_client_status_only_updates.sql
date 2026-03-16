-- Allow clients to update tickets in accessible organizations,
-- but enforce that clients may only change the status field.

drop policy if exists "tickets_update_client_status" on public.tickets;
create policy "tickets_update_client_status"
  on public.tickets
  for update
  using (
    (
      select role from public.users where id = auth.uid()
    ) = 'client'
    and public.current_user_can_access_org(org_id)
  )
  with check (
    (
      select role from public.users where id = auth.uid()
    ) = 'client'
    and public.current_user_can_access_org(org_id)
  );

create or replace function public.enforce_client_ticket_status_only_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  select role into v_role
  from public.users
  where id = auth.uid();

  if v_role = 'client' then
    if new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.priority is distinct from old.priority
      or new.assignee_id is distinct from old.assignee_id
      or new.created_by is distinct from old.created_by
      or new.org_id is distinct from old.org_id
      or new.created_at is distinct from old.created_at
      or new.id is distinct from old.id
    then
      raise exception 'Clients can only update ticket status';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_client_ticket_status_only_update on public.tickets;
create trigger enforce_client_ticket_status_only_update
  before update on public.tickets
  for each row
  execute function public.enforce_client_ticket_status_only_update();