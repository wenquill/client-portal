insert into public.organizations (id, name, slug)
values (
  '00000000-0000-0000-0000-000000000001',
  'Demo Organization',
  'demo'
)
on conflict (slug) do nothing;

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

  insert into public.users (id, org_id, role, full_name, avatar_url)
  values (
    new.id,
    v_org_id,
    v_role,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.email
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
