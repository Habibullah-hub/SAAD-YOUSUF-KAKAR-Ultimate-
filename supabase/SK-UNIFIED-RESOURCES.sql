-- SK CYBER HUB — Unified Resource Catalog (additive migration)
-- Purpose: one admin-managed catalog for apps, software, documents, AI tools,
-- web tools, games, earning opportunities, creator tools and news sources.
-- This migration creates only SK-prefixed objects. It does not alter sk_apps
-- or any tables belonging to the older Yousuf Kakar Free Apps project.
--
-- Prerequisite: run supabase/SK-CYBER-HUB-SETUP.sql first so public.sk_is_admin()
-- exists. Review this file before running it in Supabase SQL Editor.
-- No Storage bucket is required: resources use HTTPS provider URLs.

begin;

create table if not exists public.sk_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  resource_type text not null check (
    resource_type in (
      'app', 'software', 'ai_tool', 'web_tool', 'document',
      'course', 'game', 'earning', 'news_source', 'creator_tool', 'service'
    )
  ),
  category text not null default 'General'
    check (char_length(trim(category)) between 1 and 60),
  platform text not null default 'Web'
    check (platform in ('Android', 'iPhone/iPad', 'Windows', 'Mac', 'Linux', 'Web', 'Multi-platform')),
  pricing text not null default 'unknown'
    check (pricing in ('free', 'limited_free', 'paid', 'unknown')),
  description text not null default ''
    check (char_length(description) <= 2000),
  target_url text not null check (target_url ~* '^https://'),
  icon_url text check (icon_url is null or icon_url ~* '^https://'),
  country_availability text not null default 'Global'
    check (char_length(country_availability) <= 120),
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  is_affiliate boolean not null default false,
  affiliate_disclosure text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sk_resources_affiliate_disclosure_required
    check (not is_affiliate or char_length(trim(coalesce(affiliate_disclosure, ''))) between 8 and 300)
);

create index if not exists sk_resources_public_catalog_idx
  on public.sk_resources (published, resource_type, sort_order, created_at desc);
create index if not exists sk_resources_category_idx
  on public.sk_resources (category, published);
create index if not exists sk_resources_featured_idx
  on public.sk_resources (featured, published, sort_order);

alter table public.sk_resources enable row level security;

drop policy if exists sk_resources_public_read on public.sk_resources;
create policy sk_resources_public_read
on public.sk_resources
for select
to anon, authenticated
using (published = true or public.sk_is_admin());

drop policy if exists sk_resources_admin_insert on public.sk_resources;
create policy sk_resources_admin_insert
on public.sk_resources
for insert
to authenticated
with check (
  public.sk_is_admin()
  and (created_by is null or created_by = (select auth.uid()))
);

drop policy if exists sk_resources_admin_update on public.sk_resources;
create policy sk_resources_admin_update
on public.sk_resources
for update
to authenticated
using (public.sk_is_admin())
with check (
  public.sk_is_admin()
  and (created_by is null or created_by = (select auth.uid()))
);

drop policy if exists sk_resources_admin_delete on public.sk_resources;
create policy sk_resources_admin_delete
on public.sk_resources
for delete
to authenticated
using (public.sk_is_admin());

revoke all on public.sk_resources from anon, authenticated;
grant select on public.sk_resources to anon, authenticated;
grant insert, update, delete on public.sk_resources to authenticated;

create or replace function public.sk_resources_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sk_resources_updated_at on public.sk_resources;
create trigger sk_resources_updated_at
before update on public.sk_resources
for each row execute function public.sk_resources_touch_updated_at();

commit;

-- Security notes:
-- 1. Public visitors can read published entries only.
-- 2. Only accounts whose sk_profiles.role is admin can add/edit/delete entries.
-- 3. New signups remain ordinary members via the existing SK auth trigger.
-- 4. Only HTTPS destination/icon URLs are accepted.
-- 5. Affiliate entries require a visible disclosure string.
-- 6. Do not store service_role/secret keys or uploaded files in this catalog.
-- 7. This file is a proposed migration; it has NOT been run against your database.
