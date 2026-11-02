-- SK CYBER HUB — MOD APK safety metadata for existing SK Apps
-- Additive only. Review first; do not run until the owner explicitly approves.
-- Requires the existing public.sk_apps table from SK-CYBER-HUB-SETUP.sql.

begin;

alter table public.sk_apps
  add column if not exists original_app_url text,
  add column if not exists publisher_name text,
  add column if not exists modifications_summary text,
  add column if not exists requested_permissions_summary text,
  add column if not exists security_scan_status text not null default 'not_scanned',
  add column if not exists security_scan_provider text,
  add column if not exists security_scan_url text,
  add column if not exists security_scan_checked_at date;

alter table public.sk_apps
  drop constraint if exists sk_apps_security_scan_status_check;
alter table public.sk_apps
  add constraint sk_apps_security_scan_status_check
  check (security_scan_status in (
    'not_scanned','unknown','no_detection_reported','detection_reported'
  ));

alter table public.sk_apps
  drop constraint if exists sk_apps_safety_url_https_check;
alter table public.sk_apps
  add constraint sk_apps_safety_url_https_check
  check (
    (original_app_url is null or original_app_url ~* '^https://')
    and (security_scan_url is null or security_scan_url ~* '^https://')
  );

alter table public.sk_apps
  drop constraint if exists sk_apps_safety_text_lengths_check;
alter table public.sk_apps
  add constraint sk_apps_safety_text_lengths_check
  check (
    (publisher_name is null or char_length(publisher_name) <= 160)
    and (modifications_summary is null or char_length(modifications_summary) <= 1200)
    and (requested_permissions_summary is null or char_length(requested_permissions_summary) <= 1200)
    and (security_scan_provider is null or char_length(security_scan_provider) <= 120)
  );

comment on column public.sk_apps.security_scan_status is
  'Admin-entered evidence status only; no status means an APK is guaranteed safe.';
-- Keep private admin notes outside the public-readable sk_apps table.
create table if not exists public.sk_app_safety_admin_notes (
  app_id uuid primary key references public.sk_apps(id) on delete cascade,
  notes text not null check (char_length(notes) <= 1200),
  updated_at timestamptz not null default now()
);

-- Preserve notes from an earlier draft version, then remove the public-table column.
do $
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='sk_apps' and column_name='safety_review_notes'
  ) then
    execute $migrate$
      insert into public.sk_app_safety_admin_notes(app_id, notes)
      select id, safety_review_notes
      from public.sk_apps
      where safety_review_notes is not null and safety_review_notes <> ''
      on conflict (app_id) do update set notes=excluded.notes, updated_at=now()
    $migrate$;
    alter table public.sk_apps drop column safety_review_notes;
  end if;
end $;

alter table public.sk_app_safety_admin_notes enable row level security;
drop policy if exists sk_app_safety_admin_notes_admin_only on public.sk_app_safety_admin_notes;
create policy sk_app_safety_admin_notes_admin_only
on public.sk_app_safety_admin_notes
for all to authenticated
using (public.sk_is_admin())
with check (public.sk_is_admin());

revoke all on public.sk_app_safety_admin_notes from anon, authenticated;
grant select, insert, update, delete on public.sk_app_safety_admin_notes to authenticated;

comment on table public.sk_app_safety_admin_notes is
  'Private owner-admin notes; RLS allows only the SK Cyber Hub admin.';

commit;

-- RLS policies from the original SK setup continue to control access.
-- Do not grant members permission to set safety metadata.
-- A scan status is informational metadata only; it must not automatically hide or disable the owner-supplied external link.
