create table public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  logo_url   text,
  created_at timestamptz not null default now()
);

-- RLS policies that reference public.users are added in 20240001000002_users.sql
alter table public.organizations enable row level security;
