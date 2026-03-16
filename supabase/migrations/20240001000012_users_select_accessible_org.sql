-- Allow users to read profile rows for members of organizations they can access.
-- This lets assignee/creator names resolve in ticket lists and detail views.

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_select_same_org" on public.users;

create policy "users_select_accessible_org"
  on public.users
  for select
  using (public.current_user_can_access_org(org_id));
