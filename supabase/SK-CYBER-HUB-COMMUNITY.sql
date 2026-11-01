-- SK CYBER HUB — Social / Community extension
-- Run AFTER SK-CYBER-HUB-SETUP.sql in the SK Cyber Hub Supabase project.
-- Creates only SK-prefixed tables. Does not touch the older website's tables.
begin;

create table if not exists public.sk_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 800),
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now()
);

create table if not exists public.sk_post_likes (
  post_id uuid not null references public.sk_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id,user_id)
);

create table if not exists public.sk_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.sk_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.sk_post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.sk_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 300),
  created_at timestamptz not null default now(),
  unique (post_id,reporter_id)
);

create index if not exists sk_posts_created_at_idx on public.sk_posts (created_at desc);
create index if not exists sk_posts_user_id_idx on public.sk_posts (user_id);
create index if not exists sk_post_comments_post_created_idx on public.sk_post_comments (post_id,created_at);
create index if not exists sk_post_reports_created_idx on public.sk_post_reports (created_at desc);

alter table public.sk_posts enable row level security;
alter table public.sk_post_likes enable row level security;
alter table public.sk_post_comments enable row level security;
alter table public.sk_post_reports enable row level security;

drop policy if exists sk_posts_read_public_or_owner on public.sk_posts;
create policy sk_posts_read_public_or_owner on public.sk_posts
for select to anon, authenticated
using (visibility = 'public' or user_id = (select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_posts_member_insert on public.sk_posts;
create policy sk_posts_member_insert on public.sk_posts
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.sk_profiles p where p.id = (select auth.uid()) and p.role in ('member','admin'))
);

drop policy if exists sk_posts_owner_or_admin_update on public.sk_posts;
create policy sk_posts_owner_or_admin_update on public.sk_posts
for update to authenticated
using (user_id = (select auth.uid()) or public.sk_is_admin())
with check (user_id = (select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_posts_owner_or_admin_delete on public.sk_posts;
create policy sk_posts_owner_or_admin_delete on public.sk_posts
for delete to authenticated
using (user_id = (select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_post_likes_read on public.sk_post_likes;
create policy sk_post_likes_read on public.sk_post_likes
for select to anon, authenticated using (true);

drop policy if exists sk_post_likes_insert_own on public.sk_post_likes;
create policy sk_post_likes_insert_own on public.sk_post_likes
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists sk_post_likes_delete_own on public.sk_post_likes;
create policy sk_post_likes_delete_own on public.sk_post_likes
for delete to authenticated
using (user_id = (select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_post_comments_read_public on public.sk_post_comments;
create policy sk_post_comments_read_public on public.sk_post_comments
for select to anon, authenticated
using (
  exists (select 1 from public.sk_posts p where p.id = post_id and
    (p.visibility = 'public' or p.user_id = (select auth.uid()) or public.sk_is_admin()))
);

drop policy if exists sk_post_comments_insert_own on public.sk_post_comments;
create policy sk_post_comments_insert_own on public.sk_post_comments
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (select 1 from public.sk_posts p where p.id = post_id and p.visibility = 'public')
);

drop policy if exists sk_post_comments_delete_own on public.sk_post_comments;
create policy sk_post_comments_delete_own on public.sk_post_comments
for delete to authenticated
using (user_id = (select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_post_reports_insert_own on public.sk_post_reports;
create policy sk_post_reports_insert_own on public.sk_post_reports
for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and exists (select 1 from public.sk_posts p where p.id = post_id and p.visibility = 'public')
);

drop policy if exists sk_post_reports_admin_read on public.sk_post_reports;
create policy sk_post_reports_admin_read on public.sk_post_reports
for select to authenticated using (public.sk_is_admin());

revoke all on public.sk_posts, public.sk_post_likes, public.sk_post_comments, public.sk_post_reports from anon, authenticated;
grant select on public.sk_posts, public.sk_post_likes, public.sk_post_comments to anon, authenticated;
grant insert, update, delete on public.sk_posts to authenticated;
grant insert, delete on public.sk_post_likes to authenticated;
grant insert, delete on public.sk_post_comments to authenticated;
grant insert, select on public.sk_post_reports to authenticated;

commit;
