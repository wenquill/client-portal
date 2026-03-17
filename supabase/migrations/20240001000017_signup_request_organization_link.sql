alter table public.organization_signup_requests
  add column if not exists organization_id uuid references public.organizations (id) on delete set null;

create index if not exists organization_signup_requests_organization_id_idx
  on public.organization_signup_requests (organization_id);
