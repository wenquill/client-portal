create table if not exists public.admin_organizations (
  user_id uuid not null references public.users (id) on delete cascade,
  org_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, org_id)
);

create index if not exists admin_organizations_org_id_idx
  on public.admin_organizations (org_id);

insert into public.admin_organizations (user_id, org_id)
select id, org_id
from public.users
where role = 'admin'
on conflict (user_id, org_id) do nothing;

alter table public.admin_organizations enable row level security;

create policy "admin_orgs_select_own"
  on public.admin_organizations
  for select
  using (user_id = auth.uid());

create or replace function public.current_user_can_access_org(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and (
        u.org_id = target_org_id
        or (
          u.role = 'admin'
          and exists (
            select 1
            from public.admin_organizations ao
            where ao.user_id = u.id
              and ao.org_id = target_org_id
          )
        )
      )
  );
$$;

grant execute on function public.current_user_can_access_org(uuid) to authenticated;

drop policy if exists "org_select" on public.organizations;
create policy "org_select"
  on public.organizations
  for select
  using (public.current_user_can_access_org(id));

drop policy if exists "org_update_admin" on public.organizations;
create policy "org_update_admin"
  on public.organizations
  for update
  using (
    public.current_user_can_access_org(id)
    and (
      select role from public.users where id = auth.uid()
    ) = 'admin'
  );

drop policy if exists "tickets_select_org" on public.tickets;
create policy "tickets_select_org"
  on public.tickets
  for select
  using (public.current_user_can_access_org(org_id));

drop policy if exists "tickets_insert_org" on public.tickets;
create policy "tickets_insert_org"
  on public.tickets
  for insert
  with check (
    public.current_user_can_access_org(org_id)
    and created_by = auth.uid()
  );

drop policy if exists "tickets_update_tech_admin" on public.tickets;
create policy "tickets_update_tech_admin"
  on public.tickets
  for update
  using (
    (
      (
        select role from public.users where id = auth.uid()
      ) = 'technician'
      and org_id = (
        select org_id from public.users where id = auth.uid()
      )
    )
    or (
      (
        select role from public.users where id = auth.uid()
      ) = 'admin'
      and public.current_user_can_access_org(org_id)
    )
  )
  with check (
    (
      (
        select role from public.users where id = auth.uid()
      ) = 'technician'
      and org_id = (
        select org_id from public.users where id = auth.uid()
      )
    )
    or (
      (
        select role from public.users where id = auth.uid()
      ) = 'admin'
      and public.current_user_can_access_org(org_id)
    )
  );

drop policy if exists "tickets_delete_admin" on public.tickets;
create policy "tickets_delete_admin"
  on public.tickets
  for delete
  using (
    (
      select role from public.users where id = auth.uid()
    ) = 'admin'
    and public.current_user_can_access_org(org_id)
  );

drop policy if exists "comments_select_org" on public.comments;
create policy "comments_select_org"
  on public.comments
  for select
  using (
    exists (
      select 1
      from public.tickets t
      where t.id = comments.ticket_id
        and public.current_user_can_access_org(t.org_id)
    )
  );

drop policy if exists "comments_insert_org" on public.comments;
create policy "comments_insert_org"
  on public.comments
  for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.tickets t
      where t.id = comments.ticket_id
        and public.current_user_can_access_org(t.org_id)
    )
  );

drop policy if exists "comments_delete_own_or_admin" on public.comments;
create policy "comments_delete_own_or_admin"
  on public.comments
  for delete
  using (
    author_id = auth.uid()
    or (
      (
        select role from public.users where id = auth.uid()
      ) = 'admin'
      and exists (
        select 1
        from public.tickets t
        where t.id = comments.ticket_id
          and public.current_user_can_access_org(t.org_id)
      )
    )
  );
