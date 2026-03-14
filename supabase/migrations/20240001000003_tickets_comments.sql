create table public.tickets (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  title       text not null,
  description text,
  status      public.ticket_status not null default 'open',
  priority    public.ticket_priority not null default 'medium',
  assignee_id uuid references public.users (id) on delete set null,
  created_by  uuid not null references public.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index tickets_org_id_idx    on public.tickets (org_id);
create index tickets_status_idx    on public.tickets (status);
create index tickets_priority_idx  on public.tickets (priority);
create index tickets_assignee_idx  on public.tickets (assignee_id);
create index tickets_created_by_idx on public.tickets (created_by);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tickets_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

alter table public.tickets enable row level security;

create policy "tickets_select_org"
  on public.tickets
  for select
  using (
    org_id = (
      select org_id from public.users where id = auth.uid()
    )
  );

create policy "tickets_insert_org"
  on public.tickets
  for insert
  with check (
    org_id = (
      select org_id from public.users where id = auth.uid()
    )
    and created_by = auth.uid()
  );

create policy "tickets_update_tech_admin"
  on public.tickets
  for update
  using (
    org_id = (
      select org_id from public.users where id = auth.uid()
    )
    and (
      select role from public.users where id = auth.uid()
    ) in ('technician', 'admin')
  );

create policy "tickets_delete_admin"
  on public.tickets
  for delete
  using (
    org_id = (
      select org_id from public.users where id = auth.uid()
    )
    and (
      select role from public.users where id = auth.uid()
    ) = 'admin'
  );

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.tickets (id) on delete cascade,
  author_id  uuid not null references public.users (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index comments_ticket_id_idx on public.comments (ticket_id);
create index comments_author_id_idx on public.comments (author_id);

alter table public.comments enable row level security;

create policy "comments_select_org"
  on public.comments
  for select
  using (
    exists (
      select 1 from public.tickets t
      join public.users u on u.id = auth.uid()
      where t.id = comments.ticket_id
        and t.org_id = u.org_id
    )
  );

create policy "comments_insert_org"
  on public.comments
  for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      join public.users u on u.id = auth.uid()
      where t.id = comments.ticket_id
        and t.org_id = u.org_id
    )
  );

create policy "comments_update_own"
  on public.comments
  for update
  using (author_id = auth.uid());

create policy "comments_delete_own_or_admin"
  on public.comments
  for delete
  using (
    author_id = auth.uid()
    or (
      select role from public.users where id = auth.uid()
    ) = 'admin'
  );
