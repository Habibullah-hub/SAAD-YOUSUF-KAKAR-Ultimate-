# SK Cyber Hub — Security Remediation Status

Date: 2026-11-05
Scope: Repository source review and code changes. This is not a penetration test or a certification.

## Implemented in the repository

1. **Tailwind production CDN removed.** The homepage now loads a small local compatibility stylesheet containing only the utility classes used by its dialogs and forms. No Tailwind runtime compiler is downloaded at page load.
2. **Supabase JS pinned.** The CDN reference now targets the exact stable version `@supabase/supabase-js@2.119.0`, released 2026-11-04. It is no longer the moving `@2` alias.
3. **Legacy XLSX parser removed from browser imports.** The old `xlsx@0.18.5` script and client-side XLSX parser were removed. Admin bulk import now accepts CSV only, with a 2 MB file limit and a 1,000-row limit. Excel users can use Save As → CSV. This avoids parsing attacker-supplied workbook files with the old client-side package.
4. **Share controls added.** The homepage has a copy-link and native phone-share control with accessible status feedback and a manual-copy fallback. No client-generated referral code or false earning promise is shown.
5. **PWA install assets improved.** The manifest and Apple touch icon use real 192×192 and 512×512 PNG assets; the SVG identity icon remains available for browser favicon use.
6. **Offline static assets allowlisted.** Service worker v8 caches a fixed list of same-origin public CSS/JS and the two PWA icons. It does not cache API calls, authenticated data, query-string URLs or third-party responses.
7. **SK Mail / Messenger collision corrected in source.** Private Messenger continues to use `public.sk_messages` with `conversation_id`. SK Mail now uses `public.sk_inbox_messages`. The frontend and base SQL agree. A one-time compatibility migration can rename a legacy SK Mail table without discarding its rows.
8. **Analytics RPC search path hardened.** `sk_record_site_visit` now uses an empty search path and fully qualified table references.
9. **Android release signing prepared.** Gradle can use an owner-managed persistent release keystore supplied through environment variables. A manual GitHub Actions workflow verifies the resulting APK signature. The automatic public beta-release workflow for rotating debug-signed APKs has been removed. Debug builds remain temporary GitHub Actions artifacts (14-day retention), not public production releases.

## Security items intentionally not claimed as complete

### CSP and SRI

- A strict Content-Security-Policy has **not** been added. The homepage still contains many inline script blocks and inline event handlers. Adding a strict `script-src` policy now would break features; adding `unsafe-inline` would weaken the protection and create a misleading security claim.
- GitHub Pages does not provide a repository-level custom response-header configuration. A meta CSP can cover some directives but cannot replace all response-header protections (for example, `frame-ancestors`).
- Supabase JS is pinned, but Subresource Integrity is not yet configured. Google Translate and LiveKit also load external scripts; LiveKit is version-pinned, while the Google Translate script is dynamically loaded.
- Next safe step: move inline scripts and event handlers into local files, test the complete UI, then add a restrictive CSP through a host that supports security headers and add verified SRI or self-host immutable third-party bundles. Do not invent integrity hashes.

### Android release key

- The repository still has no owner-provided release keystore or GitHub Actions secrets.
- The currently published beta APK is debug-signed and must remain labelled as a testing build.
- Do not create or store the release keystore in the repository or chat. Follow `android/RELEASE-SIGNING-URDU.md`, create a persistent key, back it up, and add the four repository Actions secrets before running the manual release workflow.
- If a new release key is used, an already-installed debug APK may need to be uninstalled before the signed release can be installed. Existing app data on that device may be lost.

## Supabase RLS source review

The SQL files were reviewed as source. The following are the intended protections present in the repository:

- **Profiles and roles:** new Auth users are assigned `member`; only the owner changes the one admin role in SQL; a partial unique index permits at most one admin. Browser profile updates are limited to display name, avatar and bio.
- **Apps and unified resources:** public users can read published resources; writes are restricted by `sk_is_admin()`.
- **Community:** posts are visible according to public/follower/owner rules; member inserts bind author identity to `auth.uid()`; owner/admin moderation is policy-controlled. Saved posts are owner-scoped. Reports are admin-readable/reviewable.
- **Creator ledger:** members can read their own records; only admin policy permits ledger inserts/updates. The ledger must contain real, confirmed partner revenue, not simulated earnings.
- **Suggestions:** authenticated users can submit a pending suggestion as themselves; admin-only policies control reading and review.
- **Private Messenger:** conversation membership controls conversation/message access. The later security-hardening migration validates call participants and call-state transitions; apply it after the Messenger foundation.
- **SK Mail:** sender/recipient policies limit message reads; only the recipient can update the read receipt. The table is now separate from Messenger.
- **Analytics:** admin-only table reads; visit writes go through a validated RPC.
- **Notifications and streaks:** recipients can read their own notifications and update only `read_at`; members can read only their own streak.
- **Safety notes:** app safety review notes are in a separate admin-only table.
- **Live rooms:** live-room metadata and live chat currently have public read policies. Keep that only if public discovery/chat is intended; otherwise narrow those policies before adding private rooms.

### Known privacy/visibility choices

- `sk_follows` currently has a public read policy, so follower relationships are visible. This is a product/privacy choice, not private social-graph storage.
- Public community posts and public live chat are intentionally visible to visitors where their policies allow it.
- Do not describe private Messenger as end-to-end encrypted. The code and deployment guide correctly state that it is not E2EE.

## Live Supabase status — do not confuse with SQL source

The last recorded owner-run, read-only live snapshot is dated 2026-11-03. It confirmed RLS on seven observed public SK tables, one admin and two members, the single-admin index, and the owner-approved account/table privilege remediation. It also found:

- The live `sk_profiles` table still had only four columns; the community-v2 profile upgrade was not confirmed.
- No Storage buckets or `storage.objects` policies were present. Community photo uploads are therefore not ready.
- Auth dashboard settings, MFA, redirect allowlists, rate limits, all migrations and independent anon/member/admin tests were not fully verified.

Therefore this repository update does **not** claim that all migrations have been applied to Supabase or that live RLS has been penetration-tested. Back up the database, inspect its actual columns and migration history, then apply the updated SK Mail repair/base scripts only in the correct SK Cyber Hub project. Never paste a service-role key into browser code.

## Required final owner actions

1. Review the current Supabase schema and apply only the migrations that are missing, in the documented order.
2. Test with three separate sessions: anonymous visitor, ordinary member, and the owner admin. Attempt cross-user profile/message/ledger reads and member attempts to edit apps, roles, suggestions or another user's records; each must be denied.
3. Configure Supabase Auth protections and MFA; confirm the existing admin UUID belongs to the owner without publishing it.
4. Create and securely back up the release keystore; add the four GitHub Actions secrets; run the manual signed-release workflow.
5. Complete CSP/SRI work only after inline scripts are refactored and the chosen free hosting setup can deliver the required security headers.

All repository changes above use free/open-source tooling. No paid plan, paid API, billing upgrade or paid signing service was enabled.
