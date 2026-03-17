create table if not exists public.organization_signup_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  company_slug text,
  contact_name text not null,
  contact_email text not null,
  website text,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint organization_signup_requests_status_check
    check (status in ('pending', 'reviewing', 'approved', 'rejected'))
);

create index if not exists organization_signup_requests_created_at_idx
  on public.organization_signup_requests (created_at desc);

create index if not exists organization_signup_requests_contact_email_idx
  on public.organization_signup_requests (contact_email);

alter table public.organization_signup_requests enable row level security;

drop policy if exists "org_signup_requests_insert_public" on public.organization_signup_requests;
create policy "org_signup_requests_insert_public"
  on public.organization_signup_requests
  for insert
  with check (true);
