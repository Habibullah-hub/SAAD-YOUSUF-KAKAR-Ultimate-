-- SK CYBER HUB — Unified Resource Catalog (additive migration)
-- Requires public.sk_is_admin() from SK-CYBER-HUB-SETUP.sql.
-- Review before running. This migration has NOT been applied to Supabase.
-- Uses external HTTPS URLs; no Storage bucket or paid storage is required.

begin;

create table if not exists public.sk_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  resource_type text not null check (resource_type in (
    'app','software','ai_tool','web_tool','document','course','game',
    'earning','news_source','creator_tool','service'
  )),
  category text not null default 'General' check (char_length(trim(category)) between 1 and 60),
  platform text not null default 'Web' check (platform in (
    'Android','iPhone/iPad','Windows','Mac','Linux','Web','Multi-platform'
  )),
  pricing text not null default 'unknown' check (pricing in ('free','limited_free','paid','unknown')),
  description text not null default '' check (char_length(description) <= 2000),
  target_url text not null check (target_url ~* '^https://'),
  download_url text check (download_url is null or download_url ~* '^https://'),
  download_mode text not null default 'external_page'
    check (download_mode in ('direct_file','official_page','external_page')),
  source_domain text check (source_domain is null or source_domain ~* '^[a-z0-9.-]+$'),
  source_review_status text not null default 'unverified'
    check (source_review_status in ('unverified','reviewed')),
  icon_url text check (icon_url is null or icon_url ~* '^https://'),
  country_availability text not null default 'Global' check (char_length(country_availability) <= 120),
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  is_affiliate boolean not null default false,
  affiliate_disclosure text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sk_resources_affiliate_disclosure_required
    check (not is_affiliate or char_length(trim(coalesce(affiliate_disclosure,''))) between 8 and 300)
);

create index if not exists sk_resources_public_catalog_idx
  on public.sk_resources (published, resource_type, sort_order, created_at desc);
create index if not exists sk_resources_category_idx
  on public.sk_resources (category, published);
create index if not exists sk_resources_featured_idx
  on public.sk_resources (featured, published, sort_order);
create index if not exists sk_resources_source_review_idx
  on public.sk_resources (source_review_status, published);

create table if not exists public.sk_import_sources (
  id uuid primary key default gen_random_uuid(),
  hostname text not null unique
    check (hostname = lower(hostname) and hostname ~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$'),
  allow_metadata_import boolean not null default false,
  allow_direct_download boolean not null default false,
  review_status text not null default 'unverified'
    check (review_status in ('unverified','approved')),
  admin_notes text check (char_length(admin_notes) <= 1000),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sk_resources enable row level security;
alter table public.sk_import_sources enable row level security;

drop policy if exists sk_resources_public_read on public.sk_resources;
create policy sk_resources_public_read on public.sk_resources
for select to anon, authenticated
using (published = true or public.sk_is_admin());

drop policy if exists sk_resources_admin_insert on public.sk_resources;
create policy sk_resources_admin_insert on public.sk_resources
for insert to authenticated
with check (public.sk_is_admin() and (created_by is null or created_by = (select auth.uid())));

drop policy if exists sk_resources_admin_update on public.sk_resources;
create policy sk_resources_admin_update on public.sk_resources
for update to authenticated
using (public.sk_is_admin())
with check (public.sk_is_admin() and (created_by is null or created_by = (select auth.uid())));

drop policy if exists sk_resources_admin_delete on public.sk_resources;
create policy sk_resources_admin_delete on public.sk_resources
for delete to authenticated
using (public.sk_is_admin());

drop policy if exists sk_import_sources_admin_only on public.sk_import_sources;
create policy sk_import_sources_admin_only on public.sk_import_sources
for all to authenticated
using (public.sk_is_admin())
with check (public.sk_is_admin());

revoke all on public.sk_resources from anon, authenticated;
grant select on public.sk_resources to anon, authenticated;
grant insert, update, delete on public.sk_resources to authenticated;
revoke all on public.sk_import_sources from anon, authenticated;
grant select, insert, update, delete on public.sk_import_sources to authenticated;

create or replace function public.sk_resources_touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.sk_resources_touch_updated_at() from public, anon, authenticated;

drop trigger if exists sk_resources_updated_at on public.sk_resources;
create trigger sk_resources_updated_at before update on public.sk_resources
for each row execute function public.sk_resources_touch_updated_at();

drop trigger if exists sk_import_sources_updated_at on public.sk_import_sources;
create trigger sk_import_sources_updated_at before update on public.sk_import_sources
for each row execute function public.sk_resources_touch_updated_at();

commit;

-- Security notes:
-- * Only admins may manage resources and import-source approvals.
-- * New accounts remain members under the existing auth trigger.
-- * Public users can read published resources only.
-- * Import-source approvals are off by default; never fetch arbitrary URLs. No blocked status is used to disable owner-entered links.
-- * Direct links supplied by the owner are not automatically disabled by scan/review status; use HTTPS and keep source attribution.
-- * Never proxy arbitrary URLs or auto-follow redirects without SSRF protections.
-- * Never put service_role/secret keys in browser code or an APK.
