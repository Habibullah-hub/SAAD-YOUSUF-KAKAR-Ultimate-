-- SYK Browser: owner-controlled feed and member publishing permission gate
-- Review this migration before applying it to the live Supabase project.
begin;

alter table public.sk_creator_submissions
  add column if not exists category text not null default 'General',
  add column if not exists language text not null default 'Any';

create table if not exists public.sk_creator_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_message text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists sk_creator_access_requests_user_idx
  on public.sk_creator_access_requests(user_id, created_at desc);
create unique index if not exists sk_creator_access_requests_one_active_idx
  on public.sk_creator_access_requests(user_id)
  where status in ('pending','approved');
create index if not exists sk_creator_access_requests_pending_idx
  on public.sk_creator_access_requests(created_at desc) where status='pending';

create table if not exists public.sk_video_feed_settings (
  singleton boolean primary key default true check (singleton),
  source_order text[] not null default array['owner','youtube','tiktok','members']::text[],
  topic text not null default 'All',
  language text not null default 'Any',
  show_member_videos boolean not null default true,
  blocked_categories text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint sk_video_feed_source_order_check check (
    source_order <@ array['owner','youtube','tiktok','members']::text[]
  )
);
insert into public.sk_video_feed_settings(singleton)
values (true) on conflict (singleton) do nothing;

alter table public.sk_creator_access_requests enable row level security;
alter table public.sk_video_feed_settings enable row level security;

drop policy if exists sk_creator_access_requests_member_read on public.sk_creator_access_requests;
create policy sk_creator_access_requests_member_read
on public.sk_creator_access_requests for select to authenticated
using (user_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_creator_access_requests_member_insert on public.sk_creator_access_requests;
create policy sk_creator_access_requests_member_insert
on public.sk_creator_access_requests for insert to authenticated
with check (
  user_id=(select auth.uid())
  and status='pending'
  and status='pending'
);

drop policy if exists sk_creator_access_requests_admin_update on public.sk_creator_access_requests;
create policy sk_creator_access_requests_admin_update
on public.sk_creator_access_requests for update to authenticated
using (public.sk_is_admin()) with check (public.sk_is_admin());

drop policy if exists sk_video_feed_settings_public_read on public.sk_video_feed_settings;
create policy sk_video_feed_settings_public_read
on public.sk_video_feed_settings for select to anon, authenticated using (true);

drop policy if exists sk_video_feed_settings_admin_update on public.sk_video_feed_settings;
create policy sk_video_feed_settings_admin_update
on public.sk_video_feed_settings for update to authenticated
using (public.sk_is_admin()) with check (public.sk_is_admin());

revoke all on public.sk_creator_access_requests from anon, authenticated;
grant select, insert on public.sk_creator_access_requests to authenticated;
grant update on public.sk_creator_access_requests to authenticated;

revoke all on public.sk_video_feed_settings from anon, authenticated;
grant select on public.sk_video_feed_settings to anon, authenticated;
grant update on public.sk_video_feed_settings to authenticated;

-- A member cannot submit a video until the Owner Admin has approved publishing access.
create or replace function public.sk_require_creator_access()
returns trigger
language plpgsql
security definer
set search_path=''
as $fn$
begin
  if not public.sk_is_admin() and not exists (
    select 1
    from public.sk_creator_access_requests r
    where r.user_id=new.user_id
      and r.status='approved'
  ) then
    raise exception 'Creator access must be approved by the Owner Admin before submitting a video';
  end if;
  return new;
end;
$fn$;

revoke all on function public.sk_require_creator_access() from public, anon, authenticated;
drop trigger if exists sk_require_creator_access_before_submission on public.sk_creator_submissions;
create trigger sk_require_creator_access_before_submission
before insert on public.sk_creator_submissions
for each row execute function public.sk_require_creator_access();

commit;
