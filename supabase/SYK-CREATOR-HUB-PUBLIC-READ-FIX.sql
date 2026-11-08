-- SYK Creator Hub: repair public read policies without granting anon admin access.
-- Run AFTER SK-CREATOR-HUB.sql, SK-BROWSER-VIDEO-HUB.sql and SYK-ADMIN-FEATURED-VIDEO.sql.
-- This migration only changes Creator Hub RLS policies/function privileges.
-- It does not modify profiles, roles, submissions, videos, or storage objects.

begin;

-- Public visitors may read only approved member videos.
drop policy if exists sk_creator_submissions_public_approved on public.sk_creator_submissions;
drop policy if exists syk_creator_submissions_anon_approved_read on public.sk_creator_submissions;
create policy syk_creator_submissions_anon_approved_read
  on public.sk_creator_submissions
  for select to anon
  using (status = 'approved' and content_type = 'video');

-- Signed-in members can read approved videos and their own submissions.
-- Only the verified owner Admin can read all submissions.
drop policy if exists syk_creator_submissions_authenticated_read on public.sk_creator_submissions;
create policy syk_creator_submissions_authenticated_read
  on public.sk_creator_submissions
  for select to authenticated
  using (
    (status = 'approved' and content_type = 'video')
    or user_id = (select auth.uid())
    or public.sk_is_admin()
  );

-- Public visitors can read enabled creator-channel metadata only.
drop policy if exists sk_creator_channels_public_read on public.sk_creator_channels;
drop policy if exists syk_creator_channels_anon_enabled_read on public.sk_creator_channels;
create policy syk_creator_channels_anon_enabled_read
  on public.sk_creator_channels
  for select to anon
  using (enabled = true);

drop policy if exists syk_creator_channels_authenticated_read on public.sk_creator_channels;
create policy syk_creator_channels_authenticated_read
  on public.sk_creator_channels
  for select to authenticated
  using (enabled = true or public.sk_is_admin());

-- Public visitors can read only published owner videos.
drop policy if exists sk_creator_admin_media_public_read on public.sk_creator_admin_media;
drop policy if exists syk_creator_admin_media_anon_published_read on public.sk_creator_admin_media;
create policy syk_creator_admin_media_anon_published_read
  on public.sk_creator_admin_media
  for select to anon
  using (published = true and media_type = 'video');

drop policy if exists syk_creator_admin_media_authenticated_read on public.sk_creator_admin_media;
create policy syk_creator_admin_media_authenticated_read
  on public.sk_creator_admin_media
  for select to authenticated
  using (published = true or public.sk_is_admin());

-- Keep admin function execution limited to authenticated sessions.
-- RLS policies for anon above do not call this function.
revoke execute on function public.sk_is_admin() from public, anon;
grant execute on function public.sk_is_admin() to authenticated;

commit;

-- Verification:
-- 1) Open browser.html while signed out: only published/approved video rows should load.
-- 2) Sign in as the existing owner Admin: the review queue and featured-video tools should appear.
-- 3) Sign in as a member: only that member's own submissions plus approved videos should be visible.
-- No profile role or existing account is changed by this migration.
