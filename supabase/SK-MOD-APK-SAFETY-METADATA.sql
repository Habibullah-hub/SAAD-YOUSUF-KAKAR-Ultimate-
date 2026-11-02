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
  add column if not exists security_scan_checked_at date,
  add column if not exists safety_review_notes text;

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
    and (safety_review_notes is null or char_length(safety_review_notes) <= 1200)
  );

comment on column public.sk_apps.security_scan_status is
  'Admin-entered evidence status only; no status means an APK is guaranteed safe.';
comment on column public.sk_apps.safety_review_notes is
  'Private admin review notes. Do not store secrets or personal data.';

commit;

-- RLS policies from the original SK setup continue to control access.
-- Do not grant members permission to set safety metadata.
-- A detection_reported listing is hidden from the download action in the website UI.
