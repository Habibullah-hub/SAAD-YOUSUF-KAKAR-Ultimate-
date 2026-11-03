-- SK CYBER HUB — ethical social engagement extras
-- Run AFTER SK-CYBER-HUB-SETUP.sql, SK-CYBER-HUB-COMMUNITY.sql,
-- and SK-COMMUNITY-SOCIAL-SETUP.sql in the SK Cyber Hub project only.
-- Adds real notifications and opt-in style participation streak counters.
-- No paid service, fake activity, artificial scarcity, or public personal data.

begin;

create table if not exists public.sk_notifications (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.sk_profiles(id) on delete cascade,
  actor_id uuid references public.sk_profiles(id) on delete set null,
  kind text not null check (kind in ('follow','like','comment','new_post')),
  post_id uuid references public.sk_posts(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 180),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists sk_notifications_recipient_created_idx
  on public.sk_notifications(recipient_id,created_at desc);
create index if not exists sk_notifications_unread_idx
  on public.sk_notifications(recipient_id) where read_at is null;

alter table public.sk_notifications enable row level security;
drop policy if exists sk_notifications_read_own on public.sk_notifications;
create policy sk_notifications_read_own on public.sk_notifications
for select to authenticated using (recipient_id=(select auth.uid()));
drop policy if exists sk_notifications_mark_own_read on public.sk_notifications;
create policy sk_notifications_mark_own_read on public.sk_notifications
for update to authenticated using (recipient_id=(select auth.uid()))
with check (recipient_id=(select auth.uid()));
revoke all on public.sk_notifications from anon,authenticated;
grant select on public.sk_notifications to authenticated;
grant update (read_at) on public.sk_notifications to authenticated;

create table if not exists public.sk_member_streaks (
  user_id uuid primary key references public.sk_profiles(id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= current_streak),
  last_active_date date,
  updated_at timestamptz not null default now()
);
alter table public.sk_member_streaks enable row level security;
drop policy if exists sk_member_streaks_read_own on public.sk_member_streaks;
create policy sk_member_streaks_read_own on public.sk_member_streaks
for select to authenticated using (user_id=(select auth.uid()));
revoke all on public.sk_member_streaks from anon,authenticated;
grant select on public.sk_member_streaks to authenticated;

create or replace function public.sk_emit_social_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid;
  v_recipient uuid;
  v_post uuid;
  v_kind text;
  v_message text;
begin
  if tg_table_name='sk_follows' then
    v_actor := new.follower_id;
    v_recipient := new.following_id;
    v_kind := 'follow';
    v_message := 'Someone started following you.';
    if v_actor<>v_recipient then
      insert into public.sk_notifications(recipient_id,actor_id,kind,message)
      values(v_recipient,v_actor,v_kind,v_message);
    end if;
  elsif tg_table_name='sk_post_likes' then
    v_actor := new.user_id;
    v_post := new.post_id;
    select author_id into v_recipient from public.sk_posts where id=v_post;
    if v_recipient is not null and v_actor<>v_recipient then
      insert into public.sk_notifications(recipient_id,actor_id,kind,post_id,message)
      values(v_recipient,v_actor,'like',v_post,'Someone liked your post.');
    end if;
  elsif tg_table_name='sk_post_comments' then
    v_actor := new.author_id;
    v_post := new.post_id;
    select author_id into v_recipient from public.sk_posts where id=v_post;
    if v_recipient is not null and v_actor<>v_recipient then
      insert into public.sk_notifications(recipient_id,actor_id,kind,post_id,message)
      values(v_recipient,v_actor,'comment',v_post,'Someone commented on your post.');
    end if;
  elsif tg_table_name='sk_posts' then
    if new.status='published' then
      insert into public.sk_notifications(recipient_id,actor_id,kind,post_id,message)
      select f.follower_id,new.author_id,'new_post',new.id,'A creator you follow shared a new post.'
      from public.sk_follows f
      where f.following_id=new.author_id and f.follower_id<>new.author_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists sk_notify_new_follow on public.sk_follows;
create trigger sk_notify_new_follow after insert on public.sk_follows
for each row execute function public.sk_emit_social_notification();
drop trigger if exists sk_notify_new_like on public.sk_post_likes;
create trigger sk_notify_new_like after insert on public.sk_post_likes
for each row execute function public.sk_emit_social_notification();
drop trigger if exists sk_notify_new_comment on public.sk_post_comments;
create trigger sk_notify_new_comment after insert on public.sk_post_comments
for each row execute function public.sk_emit_social_notification();
drop trigger if exists sk_notify_new_post on public.sk_posts;
create trigger sk_notify_new_post after insert on public.sk_posts
for each row execute function public.sk_emit_social_notification();

create or replace function public.sk_touch_member_streak()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_today date := (now() at time zone 'UTC')::date;
begin
  if tg_table_name='sk_posts' then
    v_user := new.author_id;
  elsif tg_table_name='sk_post_comments' then
    v_user := new.author_id;
  elsif tg_table_name='sk_post_likes' then
    v_user := new.user_id;
  end if;
  if v_user is null then return new; end if;

  insert into public.sk_member_streaks(user_id,current_streak,longest_streak,last_active_date,updated_at)
  values(v_user,1,1,v_today,now())
  on conflict(user_id) do update set
    current_streak = case
      when public.sk_member_streaks.last_active_date=v_today then public.sk_member_streaks.current_streak
      when public.sk_member_streaks.last_active_date=v_today-1 then public.sk_member_streaks.current_streak+1
      else 1 end,
    longest_streak = greatest(
      public.sk_member_streaks.longest_streak,
      case
        when public.sk_member_streaks.last_active_date=v_today then public.sk_member_streaks.current_streak
        when public.sk_member_streaks.last_active_date=v_today-1 then public.sk_member_streaks.current_streak+1
        else 1 end
    ),
    last_active_date=v_today,
    updated_at=now();
  return new;
end;
$$;

drop trigger if exists sk_streak_on_post on public.sk_posts;
create trigger sk_streak_on_post after insert on public.sk_posts
for each row when (new.status='published')
execute function public.sk_touch_member_streak();
drop trigger if exists sk_streak_on_comment on public.sk_post_comments;
create trigger sk_streak_on_comment after insert on public.sk_post_comments
for each row when (new.status='published')
execute function public.sk_touch_member_streak();
drop trigger if exists sk_streak_on_like on public.sk_post_likes;
create trigger sk_streak_on_like after insert on public.sk_post_likes
for each row execute function public.sk_touch_member_streak();

create or replace function public.sk_post_engagement_counts(p_post_ids uuid[])
returns table(post_id uuid,like_count bigint,comment_count bigint)
language sql
stable
security definer
set search_path = ''
as $
  select p.id,
    (select count(*) from public.sk_post_likes l where l.post_id=p.id),
    (select count(*) from public.sk_post_comments c where c.post_id=p.id and c.status='published')
  from public.sk_posts p
  where p.id=any(coalesce(p_post_ids,array[]::uuid[]))
    and p.status='published'
    and (
      p.visibility='public'
      or p.author_id=(select auth.uid())
      or public.sk_is_admin()
      or (p.visibility='followers' and exists(
        select 1 from public.sk_follows f
        where f.follower_id=(select auth.uid()) and f.following_id=p.author_id
      ))
    );
$;

create or replace function public.sk_profile_follower_counts(p_profile_ids uuid[])
returns table(profile_id uuid,follower_count bigint)
language sql
stable
security definer
set search_path = ''
as $
  select p.id,(select count(*) from public.sk_follows f where f.following_id=p.id)
  from public.sk_profiles p
  where p.id=any(coalesce(p_profile_ids,array[]::uuid[]));
$;

revoke all on function public.sk_post_engagement_counts(uuid[]) from public;
revoke all on function public.sk_profile_follower_counts(uuid[]) from public;
grant execute on function public.sk_post_engagement_counts(uuid[]) to anon,authenticated;
grant execute on function public.sk_profile_follower_counts(uuid[]) to anon,authenticated;

revoke all on function public.sk_emit_social_notification() from public,anon,authenticated;
revoke all on function public.sk_touch_member_streak() from public,anon,authenticated;

commit;

-- Streaks count genuine community actions (a post, comment, or like) once per UTC day.
-- No loss-warning pressure, paid streak restore, fabricated urgency, or fake counts.
-- Notifications are generated only from real follows, likes, comments and new posts.
