-- SK Cyber Hub — Account and table privilege remediation
-- Apply ONLY in the SK Cyber Hub Supabase project.
-- Safe to re-run. Does not create/delete users, posts, files, buckets or data.
-- Back up the database before applying any SQL migration.

begin;

-- A single admin role is enforced at database level.
-- This will fail safely (and roll back) if more than one admin already exists.
create unique index if not exists sk_profiles_single_admin_idx
  on public.sk_profiles (role)
  where role = 'admin';

-- Ordinary browser roles must never have table-level powers to bypass RLS
-- or create/alter triggers/references on SK application tables.
do $sk$
declare
  t record;
begin
  for t in
    select n.nspname as schema_name, c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relname like 'sk\_%' escape '\'
  loop
    execute format(
      'revoke references, trigger, truncate on table %I.%I from anon, authenticated',
      t.schema_name,
      t.table_name
    );
  end loop;
end
$sk$;

-- This function is intended to run only from the auth.users trigger.
-- Trigger execution does not require browser users to have direct EXECUTE.
revoke execute on function public.sk_handle_new_user()
  from public, anon, authenticated;

commit;

-- Intentionally unchanged:
-- * sk_is_admin() EXECUTE remains available for RLS policy evaluation.
-- * Existing SELECT/INSERT/UPDATE/DELETE grants remain governed by RLS.
-- * Storage buckets and storage.objects policies are NOT created or changed.
-- * No paid service, billing, or upgrade is enabled.

-- After running, verify:
-- 1) exactly one admin remains;
-- 2) sk_profiles_single_admin_idx exists;
-- 3) anon/authenticated cannot execute sk_handle_new_user();
-- 4) no anon/authenticated SK table grants include REFERENCES, TRIGGER or TRUNCATE.
