# SK Creator Hub — setup and owner workflow

## What is included
- Homepage section for the owner's official YouTube, TikTok and Facebook channel/page links.
- Separate Trending now, More approved videos, and Approved member channels views.
- Click-to-play embeds for supported YouTube, TikTok and Facebook public video URLs. Playback does not autoplay.
- Logged-in members can submit one public channel/page or video URL at a time.
- New submissions remain private and pending until the single SK Admin approves them.
- Admin can approve normally, approve as Trending, or reject.
- Admin review queue refreshes through Supabase Realtime when the migration adds the submissions table to the standard `supabase_realtime` publication.
- PWA shell cache v11 includes the new local Creator Hub assets.

## Required one-time database setup
1. Open the **SK Cyber Hub** Supabase project (not the separate legacy Yousuf Kakar Free Apps project).
2. Open SQL Editor.
3. Review and run `supabase/SK-CREATOR-HUB.sql` once.
4. Do not paste a service-role/secret key into the website. The migration uses existing `sk_is_admin()` and existing member authentication.
5. If the migration reports that the Realtime publication is unavailable or the table was not added, the normal page still supports manual **Refresh requests**; check Supabase Realtime publication settings before expecting instant queue updates.

## Add the owner's official channels
1. Sign in to SK Cyber Hub with the existing owner Admin account.
2. Open the homepage and scroll to **SK Creator Hub**.
3. In **Owner Admin · Review & Channel Settings**, paste your official YouTube channel/page, TikTok profile and Facebook page URLs.
4. Press **Save my channel links**. Leave a field empty to remove that platform link.
5. Only the links saved by the Admin appear in the Official channels row.

## Approve member submissions
1. The member must create an account or log in first.
2. They choose Video or Channel/Page, choose the matching platform, enter a title and public HTTPS URL, and submit.
3. The submission is private while pending. It is not visible in the public feed.
4. The owner Admin receives an in-site pending-queue alert while logged in (Realtime when available); the queue can also be refreshed manually.
5. Choose **Approve as Trending**, **Approve as regular**, or **Reject**. Approved channels appear in the member-channel area; approved videos appear in the video feed.

## Honest limits
- Trending here is owner-curated priority, not a claimed real-time worldwide ranking. Real platform view/like metrics require approved official platform APIs and their credentials/quotas. This build does not scrape private endpoints or invent view counts.
- Video playback uses official platform embed endpoints and starts only after a visitor presses Play. A platform or individual creator can disable embedding; those links retain an **Open on platform** option.
- A successful GitHub commit does not prove that GitHub Pages deployment or the live Supabase migration has completed. Test after deployment and after running the SQL migration.
