alter table public.organization_signup_requests
  add column if not exists decision_notes text,
  add column if not exists reviewed_by uuid references public.users (id) on delete set null,
  add column if not exists reviewed_at timestamptz;

create index if not exists organization_signup_requests_status_created_idx
  on public.organization_signup_requests (status, created_at desc);

alter table public.organization_signup_requests enable row level security;

drop policy if exists "org_signup_requests_select_admin" on public.organization_signup_requests;
create policy "org_signup_requests_select_admin"
  on public.organization_signup_requests
  for select
  using (
    auth.uid() is not null
    and (
      select role from public.users where id = auth.uid()
    ) = 'admin'
  );

drop policy if exists "org_signup_requests_update_admin" on public.organization_signup_requests;
create policy "org_signup_requests_update_admin"
  on public.organization_signup_requests
  for update
  using (
    auth.uid() is not null
    and (
      select role from public.users where id = auth.uid()
    ) = 'admin'
  )
  with check (
    auth.uid() is not null
    and (
      select role from public.users where id = auth.uid()
    ) = 'admin'
  );
