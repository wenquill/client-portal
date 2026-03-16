alter table public.users
  add column if not exists has_password boolean not null default false;

update public.users u
set has_password = (
  au.encrypted_password is not null
  and au.encrypted_password <> ''
)
from auth.users au
where au.id = u.id;

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
    select id into v_org_id from public.organizations where slug = 'demo' limit 1;
  end if;

  begin
    v_role := (new.raw_user_meta_data->>'role')::public.user_role;
  exception when invalid_text_representation then
    v_role := 'client';
  end;
  if v_role is null then
    v_role := 'client';
  end if;

  insert into public.users (id, org_id, role, full_name, avatar_url, has_password)
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
    (new.encrypted_password is not null and new.encrypted_password <> '')
  )
  on conflict (id) do update
  set has_password = excluded.has_password;

  return new;
end;
$$;