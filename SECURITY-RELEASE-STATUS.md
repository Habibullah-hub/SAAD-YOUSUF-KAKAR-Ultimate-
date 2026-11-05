# SK Cyber Hub — security and release status

Last repository review: 2026-11-05.

## What is already improved in source

- The production Tailwind Play CDN reference has been replaced with the local, project-scoped compatibility stylesheet at `assets/sk-tailwind-compat.css`.
- Supabase JS is pinned to an exact version in `index.html` (currently 2.118.0). The floating `@2` alias is not used.
- The old SheetJS 0.18.5 CDN is removed. Bulk import now uses CSV, and the template download is CSV. Save Excel workbooks as CSV before importing.
- Share controls use one external script, `assets/sk-share.js`, with Clipboard API and a checked fallback. There is no fake referral balance or locally generated referral code.
- PWA manifest includes 192px and 512px PNG icons. The service worker uses a same-origin allowlist for public CSS/JS and icons, and bypasses query-string, authorization-bearing, API, and third-party requests.
- A server-side call-status transition guard is supplied in `supabase/SK-MESSENGER-CALL-STATUS-HARDENING.sql`.
- Static CI checks verify the pinned dependency, local utility CSS, share script, PNG icons, and separate Messenger/Mail table names.

## Supabase migration order and caution

This repository review is static. It does **not** connect to the owner's live Supabase project and cannot prove that a migration has been run or that the live RLS state matches these files.

Before running SQL, take a database backup/export. Do not paste all SQL files at once.

1. Apply the existing profile/community foundation migrations in the order stated in their file headers.
2. Apply `SK-MESSENGER-CALLS-FOUNDATION.sql` after `SK-COMMUNITY-SOCIAL-SETUP.sql`.
3. If the older SK Mail table was previously created as `public.sk_messages` with `recipient_email` and no `conversation_id`, run `SK-PLATFORM-MESSAGING-REPAIR.sql` once. It renames that legacy inbox to `public.sk_inbox_messages` and preserves its rows. If both legacy and replacement tables already exist, the script deliberately stops; inspect and reconcile manually.
4. For a clean/new project, or after the repair when needed, run `SK-PLATFORM-MESSAGING.sql`. SK Mail uses `public.sk_inbox_messages`; private Messenger uses `public.sk_messages`.
5. Run `SK-SECURITY-HARDENING-2026-11.sql` after the Messenger foundation; it validates call identity and allowed state transitions.
6. Apply the remaining feature migrations only when their prerequisites in the file headers are met.

Never remove RLS or grant broad access to make an error disappear. Test with two ordinary accounts and one admin account: verify each member can read only their own profile, messages, creator records and private conversations; verify a non-admin cannot add/edit/delete directory resources or administer members; verify anonymous users cannot read private tables.

## Known security limitations — do not mark these complete yet

- GitHub Pages does not provide arbitrary custom HTTP response headers for this static site. A strict CSP meta policy is not safely deployable yet because the current homepage still contains inline scripts/handlers and uses third-party integrations. Adding a guessed policy could break login, translation, LiveKit, or existing controls. Refactor inline code first, then deploy and test a CSP. A meta CSP is not equivalent to a server-set response header.
- SRI hashes have not been added. Do not invent integrity hashes. Supabase JS and LiveKit are version-pinned; the Google Translate script is dynamically loaded by Google's integration. For stronger supply-chain protection, vendor a reviewed, license-compatible copy locally or compute SRI from the exact immutable bytes and verify all runtime dependencies.
- The Android CI build is a **debug/test APK**, not a production release. The automatic debug-APK-to-public-release workflow has been removed so future runner-generated debug keys are not presented as an update-safe release. A manual workflow now exists at `.github/workflows/android-release.yml`; it requires the owner to create and safely back up one persistent release keystore, then configure the GitHub Actions secrets `SK_RELEASE_KEYSTORE_BASE64`, `SK_RELEASE_STORE_PASSWORD`, `SK_RELEASE_KEY_ALIAS`, and `SK_RELEASE_KEY_PASSWORD`. Never commit the keystore or passwords. Until those secrets exist, a signed production APK cannot be built.
- Referral rewards are not active. A true referral system requires authenticated, server-side attribution, unique database constraints, abuse controls and verified reward rules. A code in localStorage is not proof of a referral and must never trigger a payout.
- Offline support is a public shell/cache improvement, not full offline functionality. Authenticated/private data and API responses are intentionally not cached.

## Free-only note

The changes above use repository files and GitHub Actions. No paid service or paid API has been added. GitHub Actions usage is subject to the account/repository's current free quota and policies.
