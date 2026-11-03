# SK Cyber Hub — Owner Security Checklist

This is an operational checklist for the repository owner. It is intentionally free-first. Completing code changes alone does not mean that the hosted service has been secured or penetration-tested.

## Do these before inviting the public

### GitHub account and repository
- Turn on GitHub two-factor authentication (2FA) for the owner account.
- Keep this repository private while reviewing the source and Supabase configuration, if the chosen GitHub Pages hosting arrangement permits it. GitHub Pages on a private repository may require a paid plan; do not pay just to do this. If the repository must remain public, never commit credentials, private user exports, service-role keys, API secrets, recovery codes or .env files.
- Review repository collaborators and GitHub App installations. Remove access that is not needed. Keep the connected coding app restricted to this repository.
- Enable available secret scanning / push protection if offered at no cost for this repository. Check the repository Security tab; availability depends on GitHub plan and repository visibility.
- Protect the default branch from force pushes and deletion where repository settings permit it. Require review/checks only if they can be satisfied without paid services or extra maintainers.
- Review Actions workflows before enabling them. Do not run untrusted pull-request code with secrets.

### Supabase project
- Confirm the project URL and anon/public key in the website belong to the SK Cyber Hub project, not the older Yousuf Kakar Free Apps project.
- Never expose the service_role key, database password, JWT secret or provider API secret in HTML, JavaScript, public GitHub files or screenshots.
- Use a unique strong password and enable MFA for the Supabase owner account where available.
- Keep Row Level Security enabled on every table exposed through the Data API. Review every policy after each schema change; permissive policies combine with OR.
- Confirm that new accounts receive member, and verify that only the owner's exact Auth UUID has role=admin.
- Keep the community media bucket private. Do not make it public to fix broken image previews.
- Set Auth email confirmation and abuse protection/CAPTCHA where supported and appropriate. Configure allowed redirect URLs to the exact deployed SK Cyber Hub origin.
- Make a backup/export before running migrations that alter existing tables. Never paste SQL into the older project's SQL editor by mistake.
- Review database, storage, bandwidth and Edge Function quotas. Do not enable paid billing or auto-upgrades.

### LiveKit
- Store LiveKit credentials only in Supabase Edge Function secrets.
- Never put LIVEKIT_API_SECRET in browser JavaScript or GitHub Pages.
- Use only the free Build plan for the pilot. If a quota is reached, pause live sessions; do not upgrade or add billing without explicit approval.
- Test with two separate member accounts. Confirm that viewers cannot publish and non-hosts cannot receive host publish permissions.

## Current implementation boundaries
- The repository has SQL foundations for accounts, community, private messages, calls, live rooms and creator revenue records.
- The call-state hardening migration adds server-side checks so calls cannot be reopened after ending and only the invited member can accept or decline.
- Messenger is not end-to-end encrypted. Do not describe it as WhatsApp-equivalent security.
- WebRTC calls have no TURN relay; some mobile networks will fail to connect.
- LiveKit is not deployed merely because its source file exists. The Supabase SQL and Edge Function secrets/deployment must be completed.
- No ad network, payment processor, payout rail, WAF or DDoS protection is configured by these files.
- GitHub Pages does not provide a configurable server-side firewall or arbitrary HTTP security headers for this static site. A meta CSP is not a substitute for a properly configured response header.

## Verification checklist
- [ ] Confirm the deployed website loads over HTTPS.
- [ ] Test sign-up: new member gets member, not admin.
- [ ] Test two member accounts: one cannot read the other's private conversation.
- [ ] Test private/followers-only photo visibility from a logged-out browser and an unrelated account.
- [ ] Test that a member cannot edit another member's profile, post, comment or media.
- [ ] Test that a non-host live viewer cannot publish.
- [ ] Test call transitions: ringing → accepted → ended; a finished call cannot be reopened.
- [ ] Check browser console and network responses on Android and desktop.
- [ ] Confirm no secrets appear in Git history, built assets, browser source or logs.
- [ ] Confirm quota exhaustion fails safely without paid billing.

Do not advertise the service as unhackable or 100% secure. Use security controls implemented; ongoing testing required until an independent security review is completed.