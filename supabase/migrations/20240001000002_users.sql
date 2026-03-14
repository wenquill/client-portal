create table public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  org_id      uuid not null references public.organizations (id) on delete cascade,
  role        public.user_role not null default 'client',
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create index users_org_id_idx on public.users (org_id);

alter table public.users enable row level security;

create policy "users_select_same_org"
  on public.users
  for select
  using (
    org_id = (
      select org_id from public.users where id = auth.uid()
    )
  );

create policy "users_update_own"
  on public.users
  for update
  using (id = auth.uid());

create policy "users_update_admin"
  on public.users
  for update
  using (
    org_id = (
      select org_id from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, org_id, role, full_name, avatar_url)
  values (
    new.id,
    (new.raw_user_meta_data->>'org_id')::uuid,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- Organizations RLS policies (added here because they reference public.users)
-- ---------------------------------------------------------------

-- Users can only read their own organization
create policy "org_select"
  on public.organizations
  for select
  using (
    id = (
      select org_id from public.users where id = auth.uid()
    )
  );

-- Only admins can update their organization
create policy "org_update_admin"
  on public.organizations
  for update
  using (
    id = (
      select org_id from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
