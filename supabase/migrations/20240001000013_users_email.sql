alter table public.users
  add column if not exists email text;

update public.users u
set email = a.email
from auth.users a
where a.id = u.id
  and (u.email is null or u.email = '');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_role   public.user_role;
begin
  v_org_id := (new.raw_user_meta_data->>'org_id')::uuid;

  if v_org_id is null then
    return new;
  end if;

  begin
    v_role := (new.raw_user_meta_data->>'role')::public.user_role;
  exception when invalid_text_representation then
    v_role := 'client';
  end;

  if v_role is null then
    v_role := 'client';
  end if;

  insert into public.users (id, org_id, role, full_name, avatar_url, has_password, email)
  values (
    new.id,
    v_org_id,
    v_role,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.email
    ),
    new.raw_user_meta_data->>'avatar_url',
    (new.encrypted_password is not null and new.encrypted_password <> ''),
    new.email
  )
  on conflict (id) do update
  set
    org_id = excluded.org_id,
    role = excluded.role,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    has_password = excluded.has_password,
    email = coalesce(excluded.email, public.users.email);

  return new;
end;
$$;