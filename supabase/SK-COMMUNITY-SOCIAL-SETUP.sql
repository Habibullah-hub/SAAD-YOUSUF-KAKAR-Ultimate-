-- SK CYBER HUB — Social Network extension (run AFTER SK-CYBER-HUB-SETUP.sql)
-- Adds member profiles, public posts, photo sharing, comments, likes, follows,
-- saved posts, reports and private-per-user upload ownership.
-- Uses only SK-prefixed objects. Never uses the older Yousuf Kakar project.
-- Public post photos are intentionally public so guests can view public posts.
-- Do not upload private/sensitive images. Each member can only upload/delete
-- objects inside their own UID folder. Video uploads are disabled in v1;
-- members may share supported public video URLs instead.

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

-- New registrations inherit the optional first name as their initial public name.
create or replace function public.sk_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  insert into public.sk_profiles (id,email,role,display_name)
  values (
    new.id,
    new.email,
    'member',
    coalesce(nullif(left(trim(new.raw_user_meta_data->>'first_name'),40),''),nullif(split_part(new.email,'@',1),''),'Member')
  )
  on conflict (id) do update set email=excluded.email;
  return new;
end;
$;

create table if not exists public.sk_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.sk_profiles(id) on delete cascade,
  body text not null default '',
  media_path text,
  media_alt text,
  video_url text,
  visibility text not null default 'public' check (visibility in ('public','followers')),
  status text not null default 'published' check (status in ('published','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sk_posts_body_length check (char_length(body) <= 2000),
  constraint sk_posts_alt_length check (char_length(coalesce(media_alt,'')) <= 180)
);

create table if not exists public.sk_post_likes (
  post_id uuid not null references public.sk_posts(id) on delete cascade,
  user_id uuid not null references public.sk_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id,user_id)
);

create table if not exists public.sk_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.sk_posts(id) on delete cascade,
  author_id uuid not null references public.sk_profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 800),
  status text not null default 'published' check (status in ('published','hidden','removed')),
  created_at timestamptz not null default now()
);

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

create table if not exists public.sk_post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.sk_posts(id) on delete cascade,
  reporter_id uuid not null references public.sk_profiles(id) on delete cascade,
  reason text not null check (reason in ('spam','harassment','hate','nudity','copyright','scam','other')),
  details text not null default '',
  created_at timestamptz not null default now(),
  unique (post_id,reporter_id)
);

create index if not exists sk_posts_feed_idx on public.sk_posts(status,visibility,created_at desc);
create index if not exists sk_posts_author_idx on public.sk_posts(author_id,created_at desc);
create index if not exists sk_comments_post_idx on public.sk_post_comments(post_id,created_at asc);
create index if not exists sk_likes_post_idx on public.sk_post_likes(post_id);
create index if not exists sk_follows_following_idx on public.sk_follows(following_id);

-- A safe, read-only public profile projection: email and role are never exposed.
create or replace view public.sk_public_profiles as
select id, display_name, avatar_url, bio, created_at
from public.sk_profiles;
grant select on public.sk_public_profiles to anon, authenticated;

-- Keep public display names in sync with the editable member profile.
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

-- Basic anti-spam: limit members to 8 posts per hour; never silently publish empty posts.
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

alter table public.sk_posts enable row level security;
alter table public.sk_post_likes enable row level security;
alter table public.sk_post_comments enable row level security;
alter table public.sk_follows enable row level security;
alter table public.sk_saved_posts enable row level security;
alter table public.sk_post_reports enable row level security;

-- Public posts can be read by everyone; follower-only posts by approved followers.
drop policy if exists sk_posts_read_visible on public.sk_posts;
create policy sk_posts_read_visible on public.sk_posts for select to anon, authenticated
using (
  (status='published' and visibility='public')
  or author_id=(select auth.uid())
  or public.sk_is_admin()
  or (
    status='published' and visibility='followers'
    and exists (select 1 from public.sk_follows f
      where f.follower_id=(select auth.uid()) and f.following_id=author_id)
  )
);
drop policy if exists sk_posts_insert_self on public.sk_posts;
create policy sk_posts_insert_self on public.sk_posts for insert to authenticated
with check (author_id=(select auth.uid()) and status='published');
drop policy if exists sk_posts_update_owner_or_admin on public.sk_posts;
create policy sk_posts_update_owner_or_admin on public.sk_posts for update to authenticated
using (author_id=(select auth.uid()) or public.sk_is_admin())
with check (author_id=(select auth.uid()) or public.sk_is_admin());
drop policy if exists sk_posts_delete_owner_or_admin on public.sk_posts;
create policy sk_posts_delete_owner_or_admin on public.sk_posts for delete to authenticated
using (author_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_likes_read_visible on public.sk_post_likes;
create policy sk_likes_read_visible on public.sk_post_likes for select to anon, authenticated
using (exists(select 1 from public.sk_posts p where p.id=post_id and (
  (p.status='published' and p.visibility='public') or p.author_id=(select auth.uid())
  or public.sk_is_admin() or exists(select 1 from public.sk_follows f where f.follower_id=(select auth.uid()) and f.following_id=p.author_id)
)));
drop policy if exists sk_likes_insert_self on public.sk_post_likes;
create policy sk_likes_insert_self on public.sk_post_likes for insert to authenticated
with check (user_id=(select auth.uid()));
drop policy if exists sk_likes_delete_self on public.sk_post_likes;
create policy sk_likes_delete_self on public.sk_post_likes for delete to authenticated
using (user_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_comments_read_visible on public.sk_post_comments;
create policy sk_comments_read_visible on public.sk_post_comments for select to anon, authenticated
using (status='published' and exists(select 1 from public.sk_posts p where p.id=post_id and (
  (p.status='published' and p.visibility='public') or p.author_id=(select auth.uid())
  or public.sk_is_admin() or exists(select 1 from public.sk_follows f where f.follower_id=(select auth.uid()) and f.following_id=p.author_id)
)));
drop policy if exists sk_comments_insert_self on public.sk_post_comments;
create policy sk_comments_insert_self on public.sk_post_comments for insert to authenticated
with check (author_id=(select auth.uid()) and exists(select 1 from public.sk_posts p where p.id=post_id and p.status='published'));
drop policy if exists sk_comments_delete_self_or_admin on public.sk_post_comments;
create policy sk_comments_delete_self_or_admin on public.sk_post_comments for delete to authenticated
using (author_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_follows_read on public.sk_follows;
create policy sk_follows_read on public.sk_follows for select to anon, authenticated using (true);
drop policy if exists sk_follows_insert_self on public.sk_follows;
create policy sk_follows_insert_self on public.sk_follows for insert to authenticated
with check (follower_id=(select auth.uid()) and follower_id<>following_id);
drop policy if exists sk_follows_delete_self on public.sk_follows;
create policy sk_follows_delete_self on public.sk_follows for delete to authenticated
using (follower_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_saved_posts_read_self on public.sk_saved_posts;
create policy sk_saved_posts_read_self on public.sk_saved_posts for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists sk_saved_posts_insert_self on public.sk_saved_posts;
create policy sk_saved_posts_insert_self on public.sk_saved_posts for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists sk_saved_posts_delete_self on public.sk_saved_posts;
create policy sk_saved_posts_delete_self on public.sk_saved_posts for delete to authenticated using (user_id=(select auth.uid()));

drop policy if exists sk_reports_insert_self on public.sk_post_reports;
create policy sk_reports_insert_self on public.sk_post_reports for insert to authenticated with check (reporter_id=(select auth.uid()));
drop policy if exists sk_reports_read_admin on public.sk_post_reports;
create policy sk_reports_read_admin on public.sk_post_reports for select to authenticated using (public.sk_is_admin());

-- Only the safe profile columns can be changed by a signed-in member.
drop policy if exists sk_profiles_update_self on public.sk_profiles;
create policy sk_profiles_update_self on public.sk_profiles for update to authenticated
using (id=(select auth.uid()))
with check (id=(select auth.uid()) and role='member');
grant update (display_name, avatar_url, bio) on public.sk_profiles to authenticated;

grant select on public.sk_posts, public.sk_post_likes, public.sk_post_comments, public.sk_follows to anon, authenticated;
grant insert, update, delete on public.sk_posts to authenticated;
grant select, insert, delete on public.sk_post_likes to authenticated;
grant select, insert, delete on public.sk_post_comments to authenticated;
grant select, insert, delete on public.sk_follows to authenticated;
grant select, insert, delete on public.sk_saved_posts to authenticated;
grant insert, select on public.sk_post_reports to authenticated;

-- Image-only public media bucket. Each user owns their own UID folder.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('sk-community-media','sk-community-media',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public=true,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

-- Per-member storage cap: 50 MB total inside each member's own folder.
create or replace function public.sk_limit_community_user_storage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
declare
  folder_owner text;
  used_bytes bigint;
  new_bytes bigint;
begin
  if new.bucket_id <> 'sk-community-media' then return new; end if;
  folder_owner := (storage.foldername(new.name))[1];
  if folder_owner is null or folder_owner <> (select auth.uid())::text then
    raise exception 'Community uploads must be stored in your own member folder.';
  end if;
  new_bytes := coalesce((new.metadata->>'size')::bigint,0);
  select coalesce(sum(coalesce((metadata->>'size')::bigint,0)),0)
    into used_bytes
    from storage.objects
    where bucket_id='sk-community-media'
      and (storage.foldername(name))[1]=folder_owner
      and name <> new.name;
  if used_bytes + new_bytes > 52428800 then
    raise exception 'Your community photo storage limit is 50 MB. Delete an old photo before uploading more.';
  end if;
  return new;
end;
$;
drop trigger if exists sk_community_user_storage_limit on storage.objects;
create trigger sk_community_user_storage_limit before insert on storage.objects
for each row execute function public.sk_limit_community_user_storage();

drop policy if exists sk_community_media_public_read on storage.objects;
create policy sk_community_media_public_read on storage.objects
for select to anon, authenticated using (bucket_id='sk-community-media');

drop policy if exists sk_community_media_insert_own on storage.objects;
create policy sk_community_media_insert_own on storage.objects
for insert to authenticated with check (
  bucket_id='sk-community-media' and (storage.foldername(name))[1]=(select auth.uid())::text
);
drop policy if exists sk_community_media_update_own on storage.objects;
create policy sk_community_media_update_own on storage.objects
for update to authenticated using (
  bucket_id='sk-community-media' and (storage.foldername(name))[1]=(select auth.uid())::text
) with check (
  bucket_id='sk-community-media' and (storage.foldername(name))[1]=(select auth.uid())::text
);
drop policy if exists sk_community_media_delete_own on storage.objects;
create policy sk_community_media_delete_own on storage.objects
for delete to authenticated using (
  bucket_id='sk-community-media' and (storage.foldername(name))[1]=(select auth.uid())::text
);

commit;

-- IMPORTANT:
-- 1) This SQL creates a shared platform storage bucket (not a personal Drive).
-- 2) Each member gets a separate UID folder and cannot overwrite/delete another member's files.
-- 3) Public post photos are publicly viewable. Do not upload private documents or sensitive photos.
-- 4) V1 allows images only (JPEG/PNG/WebP, max 8 MB). Videos are shared by external link for now.
-- 5) Supabase Free currently lists 1 GB storage and 5 GB egress; monitor quotas and do not upgrade
--    or add billing without the owner's explicit approval.
