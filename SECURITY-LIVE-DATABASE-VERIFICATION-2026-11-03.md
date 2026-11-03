# SK Cyber Hub — Live database verification snapshot

Date: 2026-11-03  
Project: SK Cyber Hub Supabase project  
Method: Read-only SQL queries run by the owner in Supabase SQL Editor, plus owner-approved remediation commands. This is a limited live configuration snapshot, not a penetration test or independent audit.

## Confirmed live results

- Profile counts: 1 admin and 2 members.
- RLS is enabled on all seven observed public SK tables: `sk_apps`, `sk_post_comments`, `sk_post_likes`, `sk_post_reports`, `sk_posts`, `sk_profiles`, and `sk_site_analytics`.
- The observed `sk_profiles` SELECT policy allows an authenticated user to read their own profile, or an admin to read profiles.
- After remediation, `authenticated` has only table-level SELECT on `sk_profiles`.
- After remediation, `sk_apps` grants are anon SELECT and authenticated SELECT/INSERT/UPDATE/DELETE; the observed RLS policies restrict writes to `sk_is_admin()` and public reads to published apps.
- No `REFERENCES`, `TRIGGER`, or `TRUNCATE` grants were returned for any observed `sk_%` public table after remediation.
- The partial unique index `sk_profiles_single_admin_idx` exists on `sk_profiles(role)` where role = 'admin'.
- The `auth.users` trigger `sk_on_auth_user_created` is enabled and invokes `sk_handle_new_user()`.
- The live definition of `sk_handle_new_user()` inserts new profiles with role `member` and on conflict updates only email.
- Direct EXECUTE on `sk_handle_new_user()` is false for `anon` and `authenticated`, and true for `postgres` and `service_role`.
- `sk_is_admin()` is SECURITY DEFINER and checks the current auth UID against `sk_profiles.role = 'admin'`.

## Storage status observed

- RLS is enabled on the eight observed `storage` tables.
- No rows were returned from `storage.buckets`.
- No policies were returned for `storage.objects` or the `storage` schema.
- The current project therefore has no configured Storage bucket or object policies. Community image uploads are not ready.
- Do not create a public bucket as a workaround. Review and apply the repository's private-bucket migration separately before enabling uploads.
- Do not revoke Supabase Storage's broad internal schema grants blindly. RLS and Storage's supported bucket/object policies must be configured together.

## Still not verified

- Supabase Auth dashboard settings: email confirmation, provider settings, redirect allowlist, CAPTCHA/abuse protection, MFA, session settings and rate limits.
- Whether the one existing admin profile belongs to the intended owner Auth UUID (do not expose the UUID in public logs).
- Full column-level profile update behavior and all live schema/migration versions.
- Storage bucket creation and private object policies.
- Backups, recovery, quota alerts, GitHub account MFA, repository collaborators and branch protection.
- Browser/API tests with independent anon, member and admin sessions.

## Important

This snapshot does not certify the platform as fully secure, unhackable or independently audited. Continue with dashboard configuration and controlled tests using separate accounts. No paid plan or billing change is authorized by this document.
