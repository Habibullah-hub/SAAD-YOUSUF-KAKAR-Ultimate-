# SK Cyber Hub — Ultimate Sovereign Digital OS
**Official architecture & implementation blueprint**  
**Repository:** `Habibullah-hub/SAAD-YOUSUF-KAKAR-Ultimate-`  
**Live site:** https://habibullah-hub.github.io/SAAD-YOUSUF-KAKAR-Ultimate-/  
**Platform:** GitHub Pages + Supabase Free Tier + Android-first PWA  
**Status:** Target architecture and staged roadmap. This document distinguishes shipped code from planned capabilities.

## 1. Mission and non-negotiable rules
Build a mobile-first, low-cost, trusted digital workspace that brings search, learning, tools, media discovery, community and creator services into one consistent SK-branded interface.

- Free-first: no paid APIs, subscriptions, hosting, storage or credits without explicit owner approval.
- GitHub Pages is static hosting. It cannot run a private server, proxy arbitrary websites, scrape the web reliably, or conceal API credentials.
- Supabase Free is shared backend, not unlimited storage, bandwidth, database or compute. Design quotas, retention and graceful degradation.
- Public browser code may contain only publishable/legacy anon keys. Never expose service_role or secret keys.
- RLS is the authorization boundary. UI hiding is not security. Preserve one owner-only Admin; members cannot edit role, moderation, verification or financial fields.
- No fake balances, guaranteed earnings, fabricated badges, dark patterns, undisclosed sponsorships or hidden bandwidth use.
- Privacy language must match browser capabilities. No "zero trace", device-wide DNS inspection, VPN/anonymity or universal security guarantees.
- Do not bypass publisher iframe restrictions, DRM, paywalls, CORS, robots rules or platform terms. No forced navigation lock; preserve user choice and publisher attribution.
- Mobile-first, accessible touch targets, reduced-motion support, data saver, keyboard/RTL support and graceful offline behavior.

## 2. Platform architecture
### Frontend and delivery
- GitHub Pages: static HTML/CSS/vanilla JS, versioned assets, no server-side execution.
- Android: installable PWA first; optional Android WebView wrapper later, using the same HTTPS origin and Supabase project.
- Service worker: cache explicit same-origin public shell/assets only. Never cache authenticated API responses, auth headers, private media or query-specific search responses.
- IndexedDB: offline notes, user-selected saved resources, tool records, habit logs and local code snippets. Provide export and scoped deletion.
- External content: render safe metadata cards and attempt an isolated reader iframe only when the publisher allows embedding. Always show source/attribution and a clear "Open original publisher" fallback.

### Backend
- Supabase Auth: identity/session; Postgres: existing `sk_*` tables; RLS on every exposed table; Storage only for approved public/user media with policies.
- Edge Functions for trusted server-side operations, validation, rate limits and secrets. GitHub Pages must never hold privileged keys.
- Keep existing schema and owner predicate. Do not create a parallel `profiles` or creator schema without a schema map and migration review.
- Any sync is opt-in, authenticated, idempotent, conflict-aware and quota-aware. Offline local use must still work without login.

### Data classification
| Class | Examples | Storage |
|---|---|---|
| Public | published catalog, public approved posts | Supabase with public-read RLS |
| Private user | drafts, notes, habits, saved items | IndexedDB by default; optional owner-scoped sync |
| Sensitive | auth tokens, moderation/admin decisions | Supabase Auth / restricted DB; never local plaintext exports by default |
| Telemetry | aggregate page/country counts | minimal aggregate data; no raw IP or precise location |

## 3. Search, reader and media policy
### SYK Universal Search
- Phase 1 starts with branded search shell, local catalog/video search and a provider adapter interface.
- Global web search requires a permitted search API or publisher/provider embed. GitHub Pages alone cannot securely proxy arbitrary search engines. If no free compliant API is available, show honest provider links as optional fallbacks.
- Never claim the whole internet is indexed by SK. Do not scrape search results from client-side HTML or evade bot protections.

### Sovereign In-App Reader
- A branded top header and bottom dock frame reader content. Search query and approved HTTPS URL can be presented in the shell.
- Use iframe sandbox with minimum permissions; do not allow top navigation, popups, downloads or arbitrary scripts beyond what a selected provider requires.
- Many sites send `X-Frame-Options` or CSP `frame-ancestors`; they will refuse embedding. This cannot be overridden from a static frontend. Offer original publisher link when blocked.
- Reader UI is a branded wrapper, not a content proxy or browser engine. Third-party cookies/login, cross-origin DOM inspection and downloads may not work.
- Validate URL scheme (HTTPS only), reject credentials, dangerous schemes and same-origin URLs (to avoid weakening the parent origin), use `referrerPolicy=no-referrer`, and show source domain.

### SYK Media Player
- First support own approved Creator Hub videos and direct media sources with clear rights.
- YouTube/other platforms must use their official embed/player rules where allowed. DRM-protected, private, age-gated or blocked media cannot be wrapped into a custom universal player.
- Do not download, rehost or strip attribution from third-party media.

## 4. Visual design system — Holographic Cyber-Deck
- Deep Obsidian `#07090F`; Neon Cyan `#00F0FF`; Emerald `#00FF66`; Accent Purple `#9D4EDD`; Neon Pink `#FF007F`.
- Glass surfaces: restrained transparency, thin borders, legible contrast, low blur on mobile.
- Use transform/opacity micro-interactions; avoid perpetual animations and expensive WebGL on low-end phones.
- 60 FPS is a target on capable hardware, never a guarantee. Add Low Effects / Battery Saver and respect `prefers-reduced-motion`.
- Android bottom dock: five destinations maximum, labels + icons, safe-area inset, 44px minimum controls. Confirm information architecture before adding items to every page.
- Typography: Inter/ system for Latin UI; Amiri for Arabic; Noto Nastaliq Urdu for Urdu. Explicit `lang` and `dir` per content region.

## 5. Module specifications and status
### A. SYK Neural Core — local mini-app generator
- Current prototype: template-driven unit converter, expense log and study/task planner using IndexedDB. This is deterministic templates, not generative AI.
- Next: QR generation using a reviewed local library; import/export; optional authenticated sync; quota/error handling.
- Never execute generated strings with `eval` or `new Function`. User code sandbox is a separate module.

### B. Zero-Trace Quantum Cloak — Privacy & Security Center
- Rename user-facing claims to "Privacy Center" or "Browser Privacy Check"; "Zero-Trace" is a brand metaphor, not a factual guarantee.
- Show HTTPS, service-worker controller, DNT signal, cookie setting and storage estimate only when exposed by browser APIs.
- Scoped purge removes only named SK-owned keys/databases. Do not clear unrelated app data or all Cache Storage.
- No device-wide DNS, installed-app, system tracker or full malware inspection.

### C. Holographic Cyber-Deck
- Theme tokens above, responsive glass cards, low effects, reduced motion, contrast and touch-target checks.
- Avoid full-screen particles/WebGL by default; profile on real Android hardware.

### D. Islam360 AI Companion — Noor-ul-Huda
- Use verified Quran Arabic source and preserve exact text; include surah/ayah references and translation attribution.
- Hadith must show collection, book/chapter and grading/source where available; never invent authenticity.
- Separate Quran, translation, Hadith, scholarly notes and AI-generated reflection visually. AI text must never be presented as scripture or fatwa.
- Amiri Arabic and Noto Nastaliq Urdu; explicit RTL containers and line-height; test Arabic shaping on Android.
- Offline saves retain source, translation, version and attribution. Daily insights require editorial review or reliable citations.

### E. SYK P2P Mesh & Offline Vault
- Service worker: explicit static asset allowlist; network-first or stale-while-revalidate per asset type; safe fallback; no private API caching.
- IndexedDB offline vault: notes, saved articles where rights permit, tools, habits and drafts.
- "P2P Mesh" is experimental: WebRTC needs signaling and often STUN/TURN; free reliable global relay is not guaranteed. Do not promise internet sharing or hidden bandwidth use.

### F. Creator Monetization Trust Engine
- Creator verification is an admin-reviewed status with published criteria and audit history.
- Upvotes require authenticated identity, unique (user, submission) constraint and server-side authorization; counters are derived, never client trusted.
- Contribution history must respect privacy and moderation. Public history should not expose private drafts or personal data.
- Earnings only from auditable transactions with clear gross/net, fees, payout conditions and disclosures. No fake balance or income promise.

### G. Universal Code & Script Studio
- Local snippet editor with syntax highlighting only if lightweight; HTML preview in sandboxed iframe. No arbitrary code execution in main page.
- Python cannot run natively in ordinary browser JS without a runtime; defer or use an explicitly downloaded/local runtime after size, license and performance review. No remote execution by default.
- Save locally in IndexedDB; export/import text. Warn before running unknown snippets.

### H. Global Resource & Asset Locker
- Curated directory of assets with license, source, file type, dimensions, file size and attribution.
- Do not mirror copyrighted assets without permission. Prefer original, CC0, permissive-license or user-owned assets.
- Large binaries may exceed GitHub repo/Pages or Supabase Free limits; use links/metadata first, not unbounded uploads.

### I. Smart Habit & Productivity Tracker
- Offline-first routines, goals and progress analytics stored locally; opt-in sync only.
- No sensitive health inference; export/delete controls and clear data retention.

### J. Multilingual Voice Command Navigator
- Web Speech API availability and Urdu/Arabic quality vary by Android browser and installed speech services.
- Ask for microphone permission only after user action; show typed fallback. Voice data handling depends on browser/device service and must be disclosed.
- Supported locales are feature-detected, not guaranteed.

### K. Community Vault & Knowledge Exchange
- Reuse current community schema where possible. RLS: public read only for approved content; owner-scoped create/update/delete; moderators only via server-authorized roles.
- Rate limits, report/appeal flow, spam prevention, output escaping and attachment size/type checks.
- No public member role escalation; no trust in client-supplied author, role or counters.

## 6. Phased delivery roadmap
### Phase 0 — Security & Foundation
1. Repository secret scan and public-key review; no service_role.
2. Map existing Supabase tables, policies, functions and storage before schema changes.
3. Preserve single owner Admin and audit SECURITY DEFINER grants without breaking public read.
4. Android RTL/modal typography and PWA update/cache tests.
5. Static checks and CI.

### Phase 1 — Sovereign Browser Shell + Design System (current first delivery)
1. Branded reader overlay with persistent header/footer, HTTPS URL validation, iframe sandbox and publisher fallback.
2. Route search submissions into the in-app reader shell; do not claim all search providers permit embedding.
3. Apply cyber-deck theme tokens to the browser shell; five-item browser dock only, with accessible labels.
4. Add low-effects/reduced-motion styles and safe-area support.
5. Test blocked iframe, valid HTTPS, invalid URL, keyboard/Escape, small Android viewport and no-JS fallback.
6. Keep original publisher link visible; never bypass CSP/X-Frame-Options.

### Phase 2 — Search & Media adapters
1. Local SK catalog search and approved Creator Hub search.
2. Provider adapters only for permitted free APIs/official embeds; disclose provider and limitations.
3. SYK player for own approved videos and official embeds.
4. Query privacy: avoid logging full queries to analytics; no query caching in service worker.

### Phase 3 — Offline Vault & PWA
1. Audit cache allowlist; separate immutable static assets from HTML navigation.
2. Add IndexedDB notes/saved resources and export/delete.
3. Test airplane mode, reconnect, quota exhaustion, app updates and multi-tab behavior.

### Phase 4 — Neural Core & Code Studio
1. Complete template tools, QR with vetted library, import/export.
2. Local code snippets with sandboxed preview and strict message origin checks.
3. Python runtime is optional and deferred pending device/storage feasibility.

### Phase 5 — Noor-ul-Huda / Islam360
1. Verify Quran and Hadith source datasets and licenses.
2. Correct Arabic/Urdu typography and RTL across every component.
3. Daily cited insight, offline saves and clear AI-reflection labeling.

### Phase 6 — Privacy, Habits & Voice
1. Honest browser privacy telemetry and scoped data controls.
2. Offline habit planner.
3. Feature-detected voice navigation with manual fallback.

### Phase 7 — Creator Trust & Community Vault
1. Map existing tables and policies; no duplicate schema.
2. Design auditable verification, unique votes, moderation and reports.
3. Add contribution history, safe media and anti-spam limits.

### Phase 8 — P2P research and scale
1. Prototype WebRTC only with explicit user consent and no hidden bandwidth.
2. Evaluate free limits, signaling, relay needs, device battery and privacy.
3. No paid inference, relay or storage without owner approval.

## 7. Phase 1 implementation notes
- Files: `assets/sk-sovereign-reader.js`, `assets/sk-sovereign-reader.css`, `browser.html`, `sw.js`.
- Reader overlay accepts HTTPS URLs only, rejects embedded credentials and non-HTTPS schemes, sets `referrerPolicy=no-referrer`, and uses a sandboxed iframe.
- Search providers can block framing; the fallback opens the publisher directly only when the user chooses it.
- The browser dock is five items on the browser page; the rest of the platform navigation is not globally changed.
- No backend migration, new API key, paid dependency or Supabase change is required for Phase 1.

## 8. Release gates
- CI static checks and JS syntax checks pass.
- Android test on real 320–430px viewport, short height and keyboard open.
- Reader: valid HTTPS, invalid URL, iframe blocked, publisher fallback and Escape/close.
- No secrets, service_role, arbitrary code execution or unsafe HTML injection.
- Offline shell contains only approved same-origin assets; no auth/API/private responses cached.
- Arabic/Urdu shaping and RTL visually reviewed.
- Any untested behavior is labelled unverified; do not claim deployment or device validation until confirmed.

## 9. Supabase change-control gate
No SQL in this blueprint is approved for execution. Before any schema/RLS change: inspect current `sk_*` schema, test anon/member/owner sessions, review SECURITY DEFINER grants, include rollback, run advisors and verify with test queries. Never let members update role, verification, approval, balance or moderation fields.