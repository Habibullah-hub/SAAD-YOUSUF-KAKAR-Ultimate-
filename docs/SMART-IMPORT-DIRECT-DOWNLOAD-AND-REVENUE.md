# SK Cyber Hub — One-click Import, Video, Suggestions and Revenue Plan

**Status:** implementation is in draft PR #2. It is not deployed and no Supabase migration has been applied.

## 1. Admin one-click link import
- Admin pastes one complete HTTP(S) link into the quick-add field.
- One click inserts it into the existing `sk_apps` catalog.
- The site generates a title from the domain, a favicon URL and a short basic description.
- The admin may edit category, platform, title, icon, description and URL afterward.
- The exact owner-supplied external link remains the destination. MOD APK links are not automatically blocked by scan status.
- This first version does not scrape full webpage metadata and does not promise that every provider's download URL is permanent.

## 2. Member suggestions
Members can submit an app, website, AI tool, software/document, news item, sponsored offer or another idea. Suggestions are saved as pending and are not published automatically. The admin review queue supports approve/reject.

Run `supabase/SK-MEMBER-SUGGESTIONS.sql` once after the base SK setup SQL. It creates an isolated SK table and RLS policies: members can submit only for their own account; only the admin can read and review the queue.

## 3. News-related videos
Each news result has a related-video popup with search shortcuts for YouTube, Dailymotion, Vimeo, TikTok and Facebook. A visitor can paste a direct supported video URL and play it inside the site when that platform permits embedding. Some platforms block third-party embedding; those videos must be opened on their original platform. No paid video API is enabled.

## 4. Sponsored content and news
- Sponsored products/offers must be clearly labelled.
- Affiliate links require a visible disclosure and a real partner arrangement.
- News claims should be attributed to the source and dated; allegations must not be presented as established fact.
- AI trading, health and earning claims must not be presented as guaranteed outcomes.

## 5. Revenue principles
Possible future income sources include approved advertising, disclosed affiliate commissions, direct sponsorships and real partner revenue shares. Do not promise earnings for browsing, clicks, downloads, data usage or referrals unless a verified partner program actually pays. Member balances must reflect settled, auditable funds only.

## 6. Free-first technical limits
- No paid APIs, subscriptions, storage or credits are activated without the owner's approval.
- Do not put Supabase service-role keys in browser code or an Android package.
- Do not scrape arbitrary websites or proxy user-supplied URLs through an unrestricted backend.
- The website and future installable PWA should share the same Supabase backend. A later Android wrapper should use that same backend rather than creating separate accounts/data.

## 7. Deployment state
PR #2 remains a draft. The website is not live with these changes. The base setup SQL, member-suggestions migration and any other migration must be reviewed and run in the intended SK Cyber Hub Supabase project before testing the related features.
