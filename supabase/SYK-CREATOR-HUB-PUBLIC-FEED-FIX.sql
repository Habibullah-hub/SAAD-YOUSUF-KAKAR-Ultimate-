-- SYK Creator Hub public feed and Admin visibility repair
-- Run AFTER SK-CREATOR-HUB.sql, SK-BROWSER-VIDEO-HUB.sql and SYK-ADMIN-FEATURED-VIDEO.sql.
-- Safe additive policy repair: does not alter sk_profiles, users, or existing member data.
begin;

-- The RLS helper is only needed by authenticated Admin policy checks.
-- Public visitors must not need EXECUTE permission merely to read published rows.
revoke all on function public.sk_is_admin() from public, anon;
grant execute on function public.sk_is_admin() to authenticated;

-- Approved member videos: public visitors see approved rows only;
-- members see their own submissions; the single Admin sees all submissions.
drop policy if exists sk_creator_submissions_public_approved on public.sk_creator_submissions;
drop policy if exists sk_creator_submissions_member_own_read on public.sk_creator_submissions;
drop policy if exists sk_creator_submissions_admin_read on public.sk_creator_submissions;

create policy sk_creator_submissions_public_approved
on public.sk_creator_submissions for select to anon, authenticated
using (status = 'approved');

create policy sk_creator_submissions_member_own_read
on public.sk_creator_submissions for select to authenticated
using (user_id = (select auth.uid()));

create policy sk_creator_submissions_admin_read
on public.sk_creator_submissions for select to authenticated
using (public.sk_is_admin());

-- Published owner media is public; unpublished media is visible only to Admin.
drop policy if exists sk_creator_admin_media_public_read on public.sk_creator_admin_media;
drop policy if exists sk_creator_admin_media_admin_read on public.sk_creator_admin_media;

create policy sk_creator_admin_media_public_read
on public.sk_creator_admin_media for select to anon, authenticated
using (published = true);

create policy sk_creator_admin_media_admin_read
on public.sk_creator_admin_media for select to authenticated
using (public.sk_is_admin());

grant select on public.sk_creator_submissions to anon, authenticated;
grant select on public.sk_creator_admin_media to anon, authenticated;
grant insert, update, delete on public.sk_creator_admin_media to authenticated;

commit;

-- Expected behavior:
-- 1) Guest: sees approved member videos and published owner videos only.
-- 2) Member: can also see their own pending/rejected submissions.
-- 3) Owner Admin: can see all submissions and manage owner media.
-- 4) No public role can approve videos or execute sk_is_admin().
