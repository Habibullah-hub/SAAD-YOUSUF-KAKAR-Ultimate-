-- SK Cyber Hub: privacy-conscious country-level visitor analytics
-- Run this file once in the SK Cyber Hub Supabase SQL Editor.
-- This creates only the SK-prefixed analytics table and function.

begin;

create table if not exists public.sk_site_analytics (
  visit_date date not null default ((now() at time zone 'utc')::date),
  country_code text not null,
  country_name text not null,
  page_path text not null,
  views bigint not null default 0 check (views >= 0),
  primary key (visit_date, country_code, page_path)
);

alter table public.sk_site_analytics enable row level security;

drop policy if exists sk_site_analytics_admin_read on public.sk_site_analytics;
create policy sk_site_analytics_admin_read
on public.sk_site_analytics
for select
to authenticated
using (public.sk_is_admin());

revoke all on public.sk_site_analytics from anon, authenticated;
grant select on public.sk_site_analytics to authenticated;

create or replace function public.sk_record_site_visit(
  p_country_code text,
  p_country_name text,
  p_page_path text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_code text := upper(coalesce(p_country_code, ''));
  clean_name text := left(trim(coalesce(p_country_name, '')), 80);
  clean_path text := left(trim(coalesce(p_page_path, '/')), 120);
begin
  if clean_code !~ '^[A-Z]{2}$' then
    raise exception 'Invalid country code';
  end if;
  if clean_name = '' then
    clean_name := 'Unknown';
  end if;
  if clean_path = '' or left(clean_path, 1) <> '/' or position('?' in clean_path) > 0 then
    clean_path := '/';
  end if;

  insert into public.sk_site_analytics
    (visit_date, country_code, country_name, page_path, views)
  values
    ((now() at time zone 'utc')::date, clean_code, clean_name, clean_path, 1)
  on conflict (visit_date, country_code, page_path)
  do update set
    views = public.sk_site_analytics.views + 1,
    country_name = excluded.country_name;
end;
$$;

revoke all on function public.sk_record_site_visit(text, text, text) from public;
grant execute on function public.sk_record_site_visit(text, text, text) to anon, authenticated;

commit;
