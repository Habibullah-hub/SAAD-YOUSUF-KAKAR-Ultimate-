-- SK CYBER HUB — isolated Supabase setup
-- Safe scope: creates only sk_profiles, sk_apps and SK-specific functions/policies.
-- Does NOT alter the older public.profiles or public.apps tables.
-- Run this in Supabase SQL Editor for the project whose URL/anon key you will enter
-- in the SK Cyber Hub website. Never paste a service_role key into the website.

begin;

create table if not exists public.sk_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create table if not exists public.sk_apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Apps',
  platform text not null default 'Android',
  version text not null default 'Latest',
  icon_url text,
  download_url text not null,
  description text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sk_profiles enable row level security;
alter table public.sk_apps enable row level security;

create or replace function public.sk_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sk_profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke all on function public.sk_is_admin() from public;
grant execute on function public.sk_is_admin() to anon, authenticated;

create or replace function public.sk_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.sk_profiles (id, email, role)
  values (new.id, new.email, 'member')
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists sk_on_auth_user_created on auth.users;
create trigger sk_on_auth_user_created
after insert on auth.users
for each row execute function public.sk_handle_new_user();

-- Only one administrator may exist at a time. The owner assigns that one role
-- manually in the SQL Editor; browser clients cannot insert/update profiles.
create unique index if not exists sk_profiles_single_admin_idx
  on public.sk_profiles (role)
  where role = 'admin';

-- Backfill existing Auth users as ordinary members; this never grants admin.
insert into public.sk_profiles (id, email, role)
select id, email, 'member'
from auth.users
on conflict (id) do update
  set email = excluded.email;

-- Replace only policies on the new SK tables.
drop policy if exists sk_profiles_read_own_or_admin on public.sk_profiles;
create policy sk_profiles_read_own_or_admin
on public.sk_profiles
for select
to authenticated
using (id = (select auth.uid()) or public.sk_is_admin());

-- Roles are changed only by the owner in the Supabase SQL Editor.
-- Even an authenticated admin cannot promote another account through the browser.
drop policy if exists sk_profiles_admin_manage on public.sk_profiles;

drop policy if exists sk_apps_public_read_published on public.sk_apps;
create policy sk_apps_public_read_published
on public.sk_apps
for select
to anon, authenticated
using (published = true or public.sk_is_admin());

drop policy if exists sk_apps_admin_insert on public.sk_apps;
create policy sk_apps_admin_insert
on public.sk_apps
for insert
to authenticated
with check (public.sk_is_admin());

drop policy if exists sk_apps_admin_update on public.sk_apps;
create policy sk_apps_admin_update
on public.sk_apps
for update
to authenticated
using (public.sk_is_admin())
with check (public.sk_is_admin());

drop policy if exists sk_apps_admin_delete on public.sk_apps;
create policy sk_apps_admin_delete
on public.sk_apps
for delete
to authenticated
using (public.sk_is_admin());

revoke all on public.sk_profiles from anon;
grant select on public.sk_profiles to authenticated;
revoke insert, update, delete on public.sk_profiles from authenticated;
revoke all on public.sk_apps from anon;
grant select on public.sk_apps to anon, authenticated;
grant insert, update, delete on public.sk_apps to authenticated;

commit;

-- IMPORTANT: after creating/signing in with the intended owner account,
-- open Supabase Authentication > Users and copy that user's UUID.
-- Then run this one statement in SQL Editor, replacing the placeholder:
-- update public.sk_profiles set role = 'admin' where id = 'PASTE-OWNER-USER-UUID-HERE';
-- Verify exactly one row was updated. Do not grant admin to other users.
