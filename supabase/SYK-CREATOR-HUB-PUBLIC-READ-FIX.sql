-- SYK Creator Hub: repair public read policies without granting anon admin access.
-- Run AFTER SK-CREATOR-HUB.sql, SK-BROWSER-VIDEO-HUB.sql and SYK-ADMIN-FEATURED-VIDEO.sql.
-- Only Creator Hub RLS policies/function privileges are changed.

begin;
drop policy if exists sk_creator_submissions_public_approved on public.sk_creator_submissions;
drop policy if exists syk_creator_submissions_anon_approved_read on public.sk_creator_submissions;
create policy syk_creator_submissions_anon_approved_read on public.sk_creator_submissions for select to anon
using (status='approved' and content_type='video');
drop policy if exists syk_creator_submissions_authenticated_read on public.sk_creator_submissions;
create policy syk_creator_submissions_authenticated_read on public.sk_creator_submissions for select to authenticated
using ((status='approved' and content_type='video') or user_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_creator_channels_public_read on public.sk_creator_channels;
drop policy if exists syk_creator_channels_anon_enabled_read on public.sk_creator_channels;
create policy syk_creator_channels_anon_enabled_read on public.sk_creator_channels for select to anon using (enabled=true);
drop policy if exists syk_creator_channels_authenticated_read on public.sk_creator_channels;
create policy syk_creator_channels_authenticated_read on public.sk_creator_channels for select to authenticated
using (enabled=true or public.sk_is_admin());

drop policy if exists sk_creator_admin_media_public_read on public.sk_creator_admin_media;
drop policy if exists syk_creator_admin_media_anon_published_read on public.sk_creator_admin_media;
create policy syk_creator_admin_media_anon_published_read on public.sk_creator_admin_media for select to anon
using (published=true and media_type='video');
drop policy if exists syk_creator_admin_media_authenticated_read on public.sk_creator_admin_media;
create policy syk_creator_admin_media_authenticated_read on public.sk_creator_admin_media for select to authenticated
using (published=true or public.sk_is_admin());

revoke execute on function public.sk_is_admin() from public,anon;
grant execute on function public.sk_is_admin() to authenticated;
commit;

-- No sk_profiles, roles, existing accounts, video rows or storage files are altered.
-- Test signed-out public viewing, owner Admin review access, and member-only own submissions.
