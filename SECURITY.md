# SK Cyber Hub — Security policy

## Security goals

SK Cyber Hub uses defense in depth: database Row Level Security (RLS), least-privilege grants, owner-controlled administrator assignment, safe URL handling, and repeatable static checks. These controls reduce risk; they do not make any internet-facing service impossible to hack.

## Protected assets

- Owner administrator account and role assignment
- Member accounts and private profile data
- Private MOD APK review notes and member reports
- Unpublished resources, import-source approvals, and admin settings
- Future member earnings records and payout-related data

## Non-negotiable rules

1. Never place Supabase `service_role`, secret keys, passwords, or private tokens in frontend code, PWA assets, Android packages, screenshots, or public issues.
2. Every new table containing user/admin data must enable RLS and have explicit policies and grants. UI-only authorization is insufficient.
3. Only the database owner may assign the one administrator role. Browser clients must not receive profile INSERT/UPDATE/DELETE privileges.
4. Do not fetch arbitrary user-submitted URLs from a server. Any future URL preview/import proxy needs SSRF protections, redirect validation, DNS/IP checks, timeouts, and response-size limits.
5. Never display private notes, private posts, reports, unpublished resources, or member financial records to unauthorized users.
6. Earning balances must be backed by verifiable ledger entries and real payable funds. Never create fake balances, guaranteed-income claims, or pretend payouts.
7. Treat third-party APKs, downloads, news, affiliate offers, and member submissions as untrusted until reviewed. Label sponsorships and affiliate links clearly.

## Reporting a vulnerability

Do not publish secrets, exploit details, member personal data, or access tokens in a public issue. Use GitHub's private vulnerability reporting for this repository if enabled, or contact the repository owner privately. Include the affected page/table, impact, and reproducible steps without accessing other users' data.

## Verification status

The repository's static workflow checks inline JavaScript syntax and basic browser-code safety patterns. Static checks are not a penetration test. Database migrations still require review and explicit owner approval; this repository does not automatically apply them. A successful CI run does not prove the production website or Supabase policies are correctly configured.
