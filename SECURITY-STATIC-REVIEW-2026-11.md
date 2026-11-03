# SK Cyber Hub — Static Security Review

Review date: 2026-11-03
Scope: selected default-branch files in this repository, including the account/community SQL, community media migration, messenger/call SQL, live-room SQL, LiveKit token endpoint, and the four community/messenger/live/creator browser scripts.

## Changes committed in this review
- Added supabase/SK-SECURITY-HARDENING-2026-11.sql. It strengthens call creation checks so both people must be the two members of a direct conversation, the caller must be the signed-in account, and the call must begin in the ringing state.
- The same migration prevents invalid call status transitions, prevents a finished call from being reopened, and restricts accept/decline/missed transitions to the invited member.
- Added SECURITY-OWNER-CHECKLIST.md for GitHub, Supabase and LiveKit operational security.
- Added the hardening migration as step 7 in supabase/SK-FREE-FIRST-DEPLOYMENT-GUIDE.md.

## Positive controls observed in source
- New SK profiles are created with role=member. The base schema has a partial unique index allowing at most one admin role.
- Browser clients cannot insert, update or delete SK profile role fields through the base table grants; profile edits are column-limited.
- Community media bucket is private. Object read policy checks whether the related post is visible to the requesting viewer. The browser requests signed URLs for displayed images.
- Messenger tables have RLS and participant checks. The browser scripts use textContent/createElement for message and post text rather than injecting member text as HTML.
- LiveKit API secret is read from server-side Supabase Edge Function environment secrets; the browser receives a short-lived participant token.
- Selected browser scripts for community, messenger, live and creator monetization passed JavaScript parse/syntax checks during this review.
- A targeted scan found three innerHTML assignments in index.html. Each assignment uses a fixed, hard-coded HTML string (a clear-search icon and static status markup); no member-controlled content was found in those three assignments.
- The targeted scan found no service-role credential assignment or private-key marker in the selected files.

## Important limitations and unresolved work
- This was a static source review, not a penetration test, formal audit, database execution or live browser test.
- The SQL migrations have not been executed or verified against the live Supabase database in this review.
- Supabase Auth MFA, email confirmation, redirect allowlist, CAPTCHA/abuse protection, database backups, quota alerts and owner/admin UUID were not verified in the Supabase dashboard.
- GitHub repository visibility, collaborators, branch protection, secret scanning, Actions settings and owner MFA were not verified or changed in account settings.
- LiveKit project, free-plan quota, Edge Function deployment and secrets were not verified in the provider dashboards.
- GitHub Pages response security headers, WAF/DDoS protection and server-side rate limiting cannot be established by these static files alone.
- Messenger is not end-to-end encrypted. WebRTC has no TURN relay, so some mobile networks may fail. No call recording is configured.
- No ad network, payment processor or creator payout system is configured.

## Deployment order
Run the database migrations in the order documented in supabase/SK-FREE-FIRST-DEPLOYMENT-GUIDE.md, including the new security hardening migration as step 7. Back up the database before applying migrations. Test with two independent member accounts before enabling public use.

Do not call the site unhackable, fully secure or independently audited. The correct status is: security controls and an additional database hardening migration have been committed; dashboard configuration and live verification remain outstanding.