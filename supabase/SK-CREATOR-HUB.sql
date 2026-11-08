-- SK Cyber Hub — owner channels and permission-based creator video submissions
-- Run once in the SK Cyber Hub Supabase project after SK-CYBER-HUB-SETUP.sql.
-- Members can submit links only after login. Nothing is public until the single Admin approves it.
begin;

create table if not exists public.sk_creator_channels (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('youtube','tiktok','facebook')),
  title text not null check (char_length(trim(title)) between 1 and 100),
  channel_url text not null check (channel_url ~* '^https://'),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(platform)
);

create table if not exists public.sk_creator_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('video','channel')),
  platform text not null check (platform in ('youtube','tiktok','facebook')),
  title text not null check (char_length(trim(title)) between 2 and 120),
  url text not null check (url ~* '^https://'),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_trending boolean not null default false,
  trend_order integer not null default 1000 check (trend_order between 1 and 10000),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists sk_creator_submissions_public_idx
  on public.sk_creator_submissions(is_trending desc,trend_order asc,created_at desc)
  where status='approved';
create index if not exists sk_creator_submissions_review_idx
  on public.sk_creator_submissions(status,created_at desc);

-- Enforce platform/host matching in the database as well as in the browser.
-- NOT VALID keeps pre-existing rows untouched while checking all new or changed rows.
do $constraints$
begin
  if not exists (select 1 from pg_constraint where conname='sk_creator_channels_platform_host_check' and conrelid='public.sk_creator_channels'::regclass) then
    alter table public.sk_creator_channels add constraint sk_creator_channels_platform_host_check check (
      (platform='youtube' and channel_url ~* '^https://([a-z0-9-]+[.])*(youtube[.]com|youtu[.]be)([:/]|$)') or
      (platform='tiktok' and channel_url ~* '^https://([a-z0-9-]+[.])*tiktok[.]com([:/]|$)') or
      (platform='facebook' and channel_url ~* '^https://([a-z0-9-]+[.])*(facebook[.]com|fb[.]watch)([:/]|$)')
    ) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='sk_creator_submissions_platform_host_check' and conrelid='public.sk_creator_submissions'::regclass) then
    alter table public.sk_creator_submissions add constraint sk_creator_submissions_platform_host_check check (
      (platform='youtube' and url ~* '^https://([a-z0-9-]+[.])*(youtube[.]com|youtu[.]be)([:/]|$)') or
      (platform='tiktok' and url ~* '^https://([a-z0-9-]+[.])*tiktok[.]com([:/]|$)') or
      (platform='facebook' and url ~* '^https://([a-z0-9-]+[.])*(facebook[.]com|fb[.]watch)([:/]|$)')
    ) not valid;
  end if;
end;
$constraints$;

create table if not exists public.sk_creator_admin_alerts (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.sk_creator_submissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  seen_at timestamptz
);
create index if not exists sk_creator_admin_alerts_unseen_idx
  on public.sk_creator_admin_alerts(created_at desc) where seen_at is null;

alter table public.sk_creator_channels enable row level security;
alter table public.sk_creator_submissions enable row level security;
alter table public.sk_creator_admin_alerts enable row level security;

drop policy if exists sk_creator_channels_public_read on public.sk_creator_channels;
create policy sk_creator_channels_public_read on public.sk_creator_channels
for select to anon,authenticated using (enabled or public.sk_is_admin());
drop policy if exists sk_creator_channels_admin_manage on public.sk_creator_channels;
create policy sk_creator_channels_admin_manage on public.sk_creator_channels
for all to authenticated using (public.sk_is_admin()) with check (public.sk_is_admin());

drop policy if exists sk_creator_submissions_public_approved on public.sk_creator_submissions;
create policy sk_creator_submissions_public_approved on public.sk_creator_submissions
for select to anon,authenticated using (status='approved' or public.sk_is_admin());
drop policy if exists sk_creator_submissions_member_insert on public.sk_creator_submissions;
create policy sk_creator_submissions_member_insert on public.sk_creator_submissions
for insert to authenticated with check (
  user_id=(select auth.uid()) and status='pending' and is_trending=false
);
drop policy if exists sk_creator_submissions_admin_update on public.sk_creator_submissions;
create policy sk_creator_submissions_admin_update on public.sk_creator_submissions
for update to authenticated using (public.sk_is_admin()) with check (public.sk_is_admin());

drop policy if exists sk_creator_alerts_admin_read on public.sk_creator_admin_alerts;
create policy sk_creator_alerts_admin_read on public.sk_creator_admin_alerts
for select to authenticated using (public.sk_is_admin());
drop policy if exists sk_creator_alerts_admin_update on public.sk_creator_admin_alerts;
create policy sk_creator_alerts_admin_update on public.sk_creator_admin_alerts
for update to authenticated using (public.sk_is_admin()) with check (public.sk_is_admin());

revoke all on public.sk_creator_channels from anon,authenticated;
revoke all on public.sk_creator_submissions from anon,authenticated;
revoke all on public.sk_creator_admin_alerts from anon,authenticated;
grant select on public.sk_creator_channels to anon,authenticated;
grant insert,update,delete on public.sk_creator_channels to authenticated;
grant select,insert,update on public.sk_creator_submissions to authenticated;
grant select on public.sk_creator_submissions to anon;
grant select,update on public.sk_creator_admin_alerts to authenticated;
-- No direct sequence privileges are granted to browser clients.

create or replace function public.sk_creator_submission_alert()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if new.status='pending' then
    insert into public.sk_creator_admin_alerts(submission_id) values(new.id);
  end if;
  return new;
end;
$$;
revoke all on function public.sk_creator_submission_alert() from public,anon,authenticated;
drop trigger if exists sk_creator_submission_alert_trigger on public.sk_creator_submissions;
create trigger sk_creator_submission_alert_trigger
after insert on public.sk_creator_submissions
for each row execute function public.sk_creator_submission_alert();

-- Enable database-change notifications for the owner approval queue when the
-- standard Supabase Realtime publication is available.
do $
begin
  if exists (select 1 from pg_publication where pubname='supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname='supabase_realtime' and schemaname='public' and tablename='sk_creator_submissions'
     ) then
    alter publication supabase_realtime add table public.sk_creator_submissions;
  end if;
end $;

commit;
