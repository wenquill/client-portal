-- Migration to fix infinite recursion in users RLS
-- Drops the problematic policy and leaves only direct self-read

drop policy if exists "users_select_same_org" on public.users;
