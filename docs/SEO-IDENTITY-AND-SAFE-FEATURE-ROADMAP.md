# SK Cyber Hub — SEO identity and safe feature roadmap

Date: 8 November 2026
Scope: additive homepage SEO metadata and implementation decisions based on the current repository.
Hosting/backend changes are deliberately not performed by this change.

## Current repository reality

The homepage already has a title, description, canonical URL, robots meta, favicon reference, WebSite/Organization JSON-LD, a root `robots.txt`, and `sitemap.xml`. The project also already contains:
- SK directory search and a separate SK Browser/web-search experience.
- World News discovery with publisher links and source attribution.
- Private member messaging and direct WebRTC audio/video calls.
- A LiveKit-powered live-room interface and token Edge Function integration.
- A member-submitted video review workflow and owner-controlled publishing.
- A PWA manifest and a restrictive public-shell service worker.

These existing features must be improved rather than duplicated. Their presence in source is not proof that every backend secret, external provider, database migration, or end-to-end workflow is currently configured.

## SEO identity changes

The homepage now references the existing 192px PNG as a browser/Apple icon, keeps the SVG favicon as a fallback, uses the existing 512px PNG for social preview and Organization logo, adds Open Graph/Twitter image metadata, and declares both dark and light color schemes. JSON-LD describes the actual public site and organization; no fabricated social profile URLs are included.

The canonical URL remains the current GitHub Pages project URL:
`https://habibullah-hub.github.io/SAAD-YOUSUF-KAKAR-Ultimate-/`

This is intentional until a different hostname is actually deployed. Do not change canonical, sitemap, robots, Open Graph URL, JSON-LD IDs, or PWA scope/start URL to a guessed Cloudflare hostname.

## Hosting limitation and recommended migration

GitHub Pages project sites live below a shared `github.io` hostname in a repository subdirectory. Google site-name and favicon identity are hostname-level signals, so a project subdirectory cannot guarantee an independent site name/favicon in Google.

Recommended zero-domain-cost option for a separate hostname: Cloudflare Pages on an available `*.pages.dev` subdomain. This repository is not automatically moved or deployed by this change. The owner must create the Pages project and confirm the actual assigned hostname first. Then update all canonical, sitemap, robots, JSON-LD, Open Graph, Twitter, manifest scope/start URL, and internal absolute URLs together, and test before asking search engines to recrawl. A custom domain is optional and may cost money.

## Search and news decision

Do not add a second search product or duplicate news panel. The repository already has SK directory search, browser search, and a World News experience. A later enhancement may add database-backed FTS only after confirming the actual published-content schema and RLS. It must never search private profiles, tickets, messages, audit submissions, or drafts.

RSS ingestion is not assumed to exist merely because the News UI exists. If added later, use a fixed admin-approved feed allowlist, server-side fetch, URL/redirect validation, XML parsing, deduplication, source attribution, headline/date/original-link display, and feed-specific terms review. Do not fetch visitor-supplied URLs or copy full articles/images without permission.

## Chat, live, and consultation decision

The repository already contains private member messaging and direct WebRTC calls, plus a LiveKit-powered live-room flow. Do not add an anonymous public chat or a second Jitsi implementation on top of these systems without a separate threat model, schema/RLS review, retention policy, CAPTCHA and rate-limit plan. Visitor-to-owner support can begin as a simple, rate-limited contact/audit request workflow.

LiveKit is not automatically a free unlimited service. Confirm the current account quota and required secrets before enabling a live room. Keep provider secrets in Supabase Edge Function secrets, never in HTML/JavaScript. If the owner wants YouTube Live instead, add an owner-only video-ID setting and privacy-friendly click-to-load embed as a separate reviewed feature; never accept arbitrary iframe HTML.

Video consultation can initially use an owner-approved booking request and a private, manually shared meeting link. Do not embed meet.jit.si as an assumed supported production iframe. Never publish private meeting room URLs.

## Security and privacy gates

- No `service_role` or provider secret in frontend code.
- Keep audit reports, tickets, member messages, and pending video submissions private.
- Enforce owner/Admin privileges through database/server authorization, not UI visibility alone.
- Require AAL2 for sensitive Admin actions where the existing auth/MFA setup supports it.
- Validate uploaded file size, type, ownership, and storage path.
- Rate-limit public forms and verify CAPTCHA server-side.
- Do not cache authenticated/API responses in the service worker.
- Give visitors a clear privacy notice before collecting chat, consultation, or contact data.
- Set a documented retention period and deletion process before adding visitor messaging.
- No fake reviews, statistics, user counts, live attack maps, income claims, or demo content presented as real.

## Manual owner checklist after a future hostname migration

1. Confirm the new Pages hostname actually opens over HTTPS.
2. Confirm homepage, favicon PNG/SVG, 192px/512px icons, robots.txt and sitemap.xml return successfully.
3. Check canonical and every absolute URL points to the new hostname.
4. Run Google Rich Results Test / Schema Markup Validator on the homepage.
5. Add the new property to Google Search Console and Bing Webmaster Tools.
6. Submit sitemap.xml and inspect the homepage URL.
7. Re-test mobile navigation, search, Urdu/RTL, PWA install/update, and offline public shell.
8. Verify that admin, member, private message, live-room and audit flows still use the existing intended Supabase project.
9. Do not merge or deploy backend migrations without a separate backup, RLS review and explicit owner approval.

## Performance and accessibility

Targets remain LCP <= 2.5s, INP < 200ms, CLS < 0.1 at the 75th percentile. They are targets, not measured results. Keep motion subtle, respect `prefers-reduced-motion`, reserve image dimensions, lazy-load below-the-fold media, keep touch controls comfortable, and preserve visible keyboard focus and readable Urdu/Arabic RTL behavior.
