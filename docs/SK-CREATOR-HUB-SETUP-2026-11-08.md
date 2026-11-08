# SK Creator Hub — setup and owner workflow

## Live database status — 8 November 2026
The migration `sk_creator_hub_owner_channels_review_queue` has been applied to the SK Cyber Hub Supabase project. The three Creator Hub tables exist, RLS is enabled, and the submissions table is in the `supabase_realtime` publication. Platform/host constraints have also been validated.

## What is included
- Homepage section for the owner's official YouTube, TikTok and Facebook channel/page links.
- Owner official channel links and an optional featured YouTube video player appear first, directly below the homepage header search.
- Approved member videos and member channels appear beneath the owner's content.
- A private Registered Members panel is available only to the Owner Admin.
- Click-to-play embeds for supported YouTube, TikTok and Facebook public video URLs.
- Logged-in members can submit a public channel/page or video URL.
- New submissions remain private and pending until the single SK Admin approves them.
- Admin can approve normally, approve as Trending, or reject.
- Admin review queue supports Realtime notifications and manual **Refresh requests**.

## Owner workflow
1. Open the live SK Cyber Hub homepage and sign in with the existing owner Admin account.
2. Scroll to **SK Creator Hub** → **Owner Admin · Review & Channel Settings**.
3. Paste your official YouTube channel, TikTok profile and Facebook page URLs.
4. For inline playback, also paste one specific YouTube video URL in **Featured YouTube video URL (direct play)**. A channel URL is a channel page, not a single playable video.
5. Press **Save my channel links**. Leave a platform field empty to remove that link.
6. New member requests appear in **Member approval queue**. Use **Refresh requests** if needed.
7. Choose **Approve**, **Approve as Trending**, or **Reject**. Only approved links become public.
8. Open **Registered Members** to see member email addresses and registration dates. The query is restricted to the Admin role and the existing `sk_profiles` RLS policy.

## Member workflow
1. A member must log in first.
2. Choose Video or Channel/Page, select the matching platform, enter a title and public HTTPS URL, then submit.
3. Pending links remain private. After Admin approval, videos appear in the public video feed and channels appear under Member channels.

## Security and honest limits
- RLS ensures members can submit only as themselves and cannot approve, reject, promote, or edit their own submissions.
- Only the existing Admin role can manage official channel links or review submissions. No role is self-upgradable.
- Trending means Admin-curated priority, not a claimed real-time worldwide ranking. Real platform metrics require official APIs and their permissions/quotas.
- Video embeds start only after a visitor presses Play. Some creators/platforms disable embedding; the original-platform link remains available.
- The featured-video field was added to `sk_creator_channels`; only a valid YouTube video URL is embedded. YouTube may block embedding for individual videos.
- The registered-members list reads only `sk_profiles` rows with role `member`; its existing RLS policy restricts reads to the profile owner or Admin.
- Database changes are verified. The live browser workflow still needs a real owner/member sign-in test; do not treat a successful SQL migration as proof that every browser UI action has been manually tested.
