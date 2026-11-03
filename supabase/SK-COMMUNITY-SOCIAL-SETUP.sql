-- SK CYBER HUB — Community v2 compatibility migration
-- Run AFTER SK-CYBER-HUB-SETUP.sql AND the earlier SK-CYBER-HUB-COMMUNITY.sql.
-- Migrates the original user_id-based community tables without deleting member content.
-- No paid services, service keys, or external storage accounts are required by this SQL.

begin;

alter table public.sk_profiles
  add column if not exists display_name text not null default 'Member',
  add column if not exists avatar_url text,
  add column if not exists bio text not null default '',
  add column if not exists updated_at timestamptz not null default now();

update public.sk_profiles p
set display_name = coalesce(
  nullif(left(trim(u.raw_user_meta_data->>'first_name'),40),''),
  nullif(split_part(u.email,'@',1),''),
  'Member'
)
from auth.users u
where u.id=p.id and (p.display_name='Member' or p.display_name='');

-- New registrations remain ordinary members. Never promote from browser metadata.
create or replace function public.sk_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.sk_profiles (id,email,role,display_name)
  values (
    new.id,new.email,'member',
    coalesce(nullif(left(trim(new.raw_user_meta_data->>'first_name'),40),''),nullif(split_part(new.email,'@',1),''),'Member')
  )
  on conflict (id) do update set email=excluded.email;
  return new;
end;
$$;

-- Upgrade the original community tables in place.
alter table public.sk_posts
  add column if not exists author_id uuid references public.sk_profiles(id) on delete cascade,
  add column if not exists media_path text,
  add column if not exists media_alt text,
  add column if not exists video_url text,
  add column if not exists status text not null default 'published',
  add column if not exists updated_at timestamptz not null default now();

update public.sk_posts set author_id=user_id where author_id is null;
alter table public.sk_posts alter column body set default '';
alter table public.sk_posts drop constraint if exists sk_posts_body_check;
alter table public.sk_posts drop constraint if exists sk_posts_visibility_check;
alter table public.sk_posts add constraint sk_posts_body_length_v2 check (char_length(coalesce(body,'')) <= 2000);
alter table public.sk_posts add constraint sk_posts_visibility_v2 check (visibility in ('public','private','followers'));
alter table public.sk_posts add constraint sk_posts_status_v2 check (status in ('published','hidden','removed'));
alter table public.sk_posts alter column author_id set not null;

alter table public.sk_post_comments
  add column if not exists author_id uuid references public.sk_profiles(id) on delete cascade,
  add column if not exists status text not null default 'published';
update public.sk_post_comments set author_id=user_id where author_id is null;
alter table public.sk_post_comments drop constraint if exists sk_post_comments_body_check;
alter table public.sk_post_comments add constraint sk_post_comments_body_length_v2 check (char_length(trim(body)) between 1 and 800);
alter table public.sk_post_comments add constraint sk_post_comments_status_v2 check (status in ('published','hidden','removed'));
alter table public.sk_post_comments alter column author_id set not null;

alter table public.sk_post_reports add column if not exists details text not null default '';

create table if not exists public.sk_follows (
  follower_id uuid not null references public.sk_profiles(id) on delete cascade,
  following_id uuid not null references public.sk_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id,following_id),
  constraint sk_no_self_follow check (follower_id <> following_id)
);

create table if not exists public.sk_saved_posts (
  user_id uuid not null references public.sk_profiles(id) on delete cascade,
  post_id uuid not null references public.sk_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id,post_id)
);

create index if not exists sk_posts_feed_v2_idx on public.sk_posts(status,visibility,created_at desc);
create index if not exists sk_posts_author_v2_idx on public.sk_posts(author_id,created_at desc);
create index if not exists sk_comments_post_v2_idx on public.sk_post_comments(post_id,created_at asc);
create index if not exists sk_follows_following_v2_idx on public.sk_follows(following_id);

-- Compatibility triggers keep the old user_id column and new author_id column in sync.
create or replace function public.sk_sync_community_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name='sk_posts' then
    new.author_id := coalesce(new.author_id,new.user_id);
    new.user_id := coalesce(new.user_id,new.author_id);
  else
    new.author_id := coalesce(new.author_id,new.user_id);
    new.user_id := coalesce(new.user_id,new.author_id);
  end if;
  if new.author_id is null or new.user_id is null or new.author_id <> new.user_id then
    raise exception 'Community author must match the signed-in account.';
  end if;
  return new;
end;
$$;

drop trigger if exists a_sk_posts_sync_author on public.sk_posts;
create trigger a_sk_posts_sync_author before insert or update on public.sk_posts
for each row execute function public.sk_sync_community_author();

drop trigger if exists a_sk_comments_sync_author on public.sk_post_comments;
create trigger a_sk_comments_sync_author before insert or update on public.sk_post_comments
for each row execute function public.sk_sync_community_author();

create or replace function public.sk_profile_touch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.display_name := left(coalesce(nullif(trim(new.display_name),''),'Member'),40);
  new.bio := left(coalesce(new.bio,''),160);
  return new;
end;
$$;
drop trigger if exists sk_profile_touch_trigger on public.sk_profiles;
create trigger sk_profile_touch_trigger before update on public.sk_profiles
for each row execute function public.sk_profile_touch();

-- Reject empty posts and rate-limit new posts. Sync trigger runs first alphabetically.
create or replace function public.sk_guard_post_rate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare recent_count integer;
begin
  if length(trim(coalesce(new.body,'')))=0 and new.media_path is null and new.video_url is null then
    raise exception 'Write a message or attach a photo/video link before posting.';
  end if;
  if new.author_id <> auth.uid() and not public.sk_is_admin() then
    raise exception 'You can only publish as your own account.';
  end if;
  select count(*) into recent_count from public.sk_posts
    where author_id=new.author_id and created_at > now()-interval '1 hour';
  if recent_count >= 8 and not public.sk_is_admin() then
    raise exception 'Posting limit reached. Please try again later.';
  end if;
  return new;
end;
$$;
drop trigger if exists sk_posts_rate_guard on public.sk_posts;
create trigger sk_posts_rate_guard before insert on public.sk_posts
for each row execute function public.sk_guard_post_rate();

-- Public profile projection never exposes email or role.
create or replace view public.sk_public_profiles as
select id,display_name,avatar_url,bio,created_at from public.sk_profiles;
grant select on public.sk_public_profiles to anon,authenticated;

-- Replace policies from the older community SQL; permissive policies combine with OR.
alter table public.sk_posts enable row level security;
alter table public.sk_post_likes enable row level security;
alter table public.sk_post_comments enable row level security;
alter table public.sk_post_reports enable row level security;
alter table public.sk_follows enable row level security;
alter table public.sk_saved_posts enable row level security;
alter table public.sk_profiles enable row level security;

drop policy if exists sk_posts_read_public_or_owner on public.sk_posts;
drop policy if exists sk_posts_member_insert on public.sk_posts;
drop policy if exists sk_posts_owner_or_admin_update on public.sk_posts;
drop policy if exists sk_posts_owner_or_admin_delete on public.sk_posts;
drop policy if exists sk_posts_read_visible on public.sk_posts;
drop policy if exists sk_posts_insert_self on public.sk_posts;
drop policy if exists sk_posts_update_owner_or_admin on public.sk_posts;
drop policy if exists sk_posts_delete_owner_or_admin on public.sk_posts;
create policy sk_posts_read_visible on public.sk_posts for select to anon,authenticated
using (
  (status='published' and visibility='public')
  or author_id=(select auth.uid())
  or public.sk_is_admin()
  or (status='published' and visibility='followers' and exists(
    select 1 from public.sk_follows f where f.follower_id=(select auth.uid()) and f.following_id=author_id
  ))
);
create policy sk_posts_insert_self on public.sk_posts for insert to authenticated
with check (author_id=(select auth.uid()) and user_id=(select auth.uid()) and status='published');
create policy sk_posts_update_owner_or_admin on public.sk_posts for update to authenticated
using (author_id=(select auth.uid()) or public.sk_is_admin())
with check (author_id=(select auth.uid()) or public.sk_is_admin());
create policy sk_posts_delete_owner_or_admin on public.sk_posts for delete to authenticated
using (author_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_post_likes_read on public.sk_post_likes;
drop policy if exists sk_post_likes_insert_own on public.sk_post_likes;
drop policy if exists sk_post_likes_delete_own on public.sk_post_likes;
drop policy if exists sk_likes_read_visible on public.sk_post_likes;
drop policy if exists sk_likes_insert_self on public.sk_post_likes;
drop policy if exists sk_likes_delete_self on public.sk_post_likes;
create policy sk_likes_read_visible on public.sk_post_likes for select to anon,authenticated
using (exists(select 1 from public.sk_posts p where p.id=post_id and (
  (p.status='published' and p.visibility='public') or p.author_id=(select auth.uid())
  or public.sk_is_admin() or exists(select 1 from public.sk_follows f where f.follower_id=(select auth.uid()) and f.following_id=p.author_id)
)));
create policy sk_likes_insert_self on public.sk_post_likes for insert to authenticated
with check (user_id=(select auth.uid()) and exists(select 1 from public.sk_posts p where p.id=post_id and p.status='published'));
create policy sk_likes_delete_self on public.sk_post_likes for delete to authenticated
using (user_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_post_comments_read_public on public.sk_post_comments;
drop policy if exists sk_post_comments_insert_own on public.sk_post_comments;
drop policy if exists sk_post_comments_delete_own on public.sk_post_comments;
drop policy if exists sk_comments_read_visible on public.sk_post_comments;
drop policy if exists sk_comments_insert_self on public.sk_post_comments;
drop policy if exists sk_comments_delete_self_or_admin on public.sk_post_comments;
create policy sk_comments_read_visible on public.sk_post_comments for select to anon,authenticated
using (status='published' and exists(select 1 from public.sk_posts p where p.id=post_id and (
  (p.status='published' and p.visibility='public') or p.author_id=(select auth.uid())
  or public.sk_is_admin() or exists(select 1 from public.sk_follows f where f.follower_id=(select auth.uid()) and f.following_id=p.author_id)
)));
create policy sk_comments_insert_self on public.sk_post_comments for insert to authenticated
with check (author_id=(select auth.uid()) and user_id=(select auth.uid()) and exists(select 1 from public.sk_posts p where p.id=post_id and p.status='published'));
create policy sk_comments_delete_self_or_admin on public.sk_post_comments for delete to authenticated
using (author_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_follows_read on public.sk_follows;
drop policy if exists sk_follows_insert_self on public.sk_follows;
drop policy if exists sk_follows_delete_self on public.sk_follows;
create policy sk_follows_read on public.sk_follows for select to anon,authenticated using (true);
create policy sk_follows_insert_self on public.sk_follows for insert to authenticated
with check (follower_id=(select auth.uid()) and follower_id<>following_id);
create policy sk_follows_delete_self on public.sk_follows for delete to authenticated
using (follower_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_saved_posts_read_self on public.sk_saved_posts;
drop policy if exists sk_saved_posts_insert_self on public.sk_saved_posts;
drop policy if exists sk_saved_posts_delete_self on public.sk_saved_posts;
create policy sk_saved_posts_read_self on public.sk_saved_posts for select to authenticated using (user_id=(select auth.uid()));
create policy sk_saved_posts_insert_self on public.sk_saved_posts for insert to authenticated with check (user_id=(select auth.uid()));
create policy sk_saved_posts_delete_self on public.sk_saved_posts for delete to authenticated using (user_id=(select auth.uid()));

drop policy if exists sk_post_reports_insert_own on public.sk_post_reports;
drop policy if exists sk_post_reports_admin_read on public.sk_post_reports;
drop policy if exists sk_post_reports_admin_update on public.sk_post_reports;
drop policy if exists sk_reports_insert_self on public.sk_post_reports;
drop policy if exists sk_reports_read_admin on public.sk_post_reports;
create policy sk_reports_insert_self on public.sk_post_reports for insert to authenticated
with check (reporter_id=(select auth.uid()) and exists(select 1 from public.sk_posts p where p.id=post_id and p.status='published'));
create policy sk_reports_read_admin on public.sk_post_reports for select to authenticated using (public.sk_is_admin());
create policy sk_reports_update_admin on public.sk_post_reports for update to authenticated using (public.sk_is_admin()) with check (public.sk_is_admin());

drop policy if exists sk_profiles_update_self on public.sk_profiles;
create policy sk_profiles_update_self on public.sk_profiles for update to authenticated
using (id=(select auth.uid()) or public.sk_is_admin())
with check ((id=(select auth.uid()) and role='member') or public.sk_is_admin());

grant update (display_name,avatar_url,bio) on public.sk_profiles to authenticated;
grant select on public.sk_posts,public.sk_post_likes,public.sk_post_comments,public.sk_follows to anon,authenticated;
grant insert,update,delete on public.sk_posts to authenticated;
grant select,insert,delete on public.sk_post_likes to authenticated;
grant select,insert,delete on public.sk_post_comments to authenticated;
grant select,insert,delete on public.sk_follows to authenticated;
grant select,insert,delete on public.sk_saved_posts to authenticated;
grant insert,select,update on public.sk_post_reports to authenticated;

-- Shared public photo bucket. Each member is restricted to their own UID folder.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('sk-community-media','sk-community-media',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.sk_limit_community_user_storage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare folder_owner text; used_bytes bigint; new_bytes bigint;
begin
  if new.bucket_id <> 'sk-community-media' then return new; end if;
  folder_owner := (storage.foldername(new.name))[1];
  if folder_owner is null or folder_owner <> (select auth.uid())::text then
    raise exception 'Community uploads must be stored in your own member folder.';
  end if;
  new_bytes := coalesce((new.metadata->>'size')::bigint,0);
  select coalesce(sum(coalesce((metadata->>'size')::bigint,0)),0) into used_bytes
  from storage.objects where bucket_id='sk-community-media'
    and (storage.foldername(name))[1]=folder_owner and name<>new.name;
  if used_bytes+new_bytes>52428800 then
    raise exception 'Your community photo storage limit is 50 MB. Delete an old photo before uploading more.';
  end if;
  return new;
end;
$$;
drop trigger if exists sk_community_user_storage_limit on storage.objects;
create trigger sk_community_user_storage_limit before insert or update on storage.objects
for each row execute function public.sk_limit_community_user_storage();

drop policy if exists sk_community_media_public_read on storage.objects;
drop policy if exists sk_community_media_read_visible on storage.objects;
create policy sk_community_media_read_visible on storage.objects for select to anon,authenticated
using (
  bucket_id='sk-community-media'
  and exists(
    select 1 from public.sk_posts p
    where p.media_path=name
      and p.status='published'
      and (
        p.visibility='public'
        or p.author_id=(select auth.uid())
        or (p.visibility='followers' and exists(
          select 1 from public.sk_follows f
          where f.follower_id=(select auth.uid()) and f.following_id=p.author_id
        ))
      )
  )
);
drop policy if exists sk_community_media_insert_own on storage.objects;
drop policy if exists sk_community_media_update_own on storage.objects;
drop policy if exists sk_community_media_delete_own on storage.objects;
create policy sk_community_media_public_read on storage.objects for select to anon,authenticated
using (bucket_id='sk-community-media');
create policy sk_community_media_insert_own on storage.objects for insert to authenticated
with check (bucket_id='sk-community-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy sk_community_media_update_own on storage.objects for update to authenticated
using (bucket_id='sk-community-media' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='sk-community-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy sk_community_media_delete_own on storage.objects for delete to authenticated
using (bucket_id='sk-community-media' and (storage.foldername(name))[1]=(select auth.uid())::text);

commit;

-- This is a shared platform bucket, not the owner's personal Drive or phone.
-- Each member has a UID folder; all members still share the project's free quota.
-- The bucket is private. Signed URLs are issued only when the related post is visible to the current viewer. Do not upload highly sensitive images.
-- Videos remain external links in v2; direct video uploads are intentionally disabled.
-- Never enable paid billing or upgrades without the owner's explicit approval.
