# SK Cyber Hub — Architecture & Phased Implementation Blueprint

**Platform:** GitHub Pages + Supabase Free, Android-first PWA  
**Status:** Architecture and staged delivery plan. This document does not claim every feature is already implemented.

## Non-negotiable principles
- Free-first: no paid APIs, subscriptions, hosting or storage without explicit owner approval.
- Public browser code may contain only the Supabase project URL and publishable/legacy anon key. Never expose service_role or sb_secret keys.
- Supabase RLS is the authorization boundary. Hiding controls in JavaScript is not security.
- Preserve the existing Owner-only Admin role model. No user-editable is_admin field.
- Privacy claims must match browser capabilities. No "zero trace", full DNS visibility, guaranteed anonymity or fake security scores.
- Mobile-first, accessible touch targets, reduced-motion support, low-effects mode and graceful offline behavior.
- No fake balances, guaranteed creator income, fabricated verification or undisclosed affiliate/sponsored content.

## Target architecture
- Static frontend: GitHub Pages, semantic HTML, CSS and modular JavaScript.
- Identity/data: Supabase Auth + PostgreSQL with RLS; Edge Functions only for trusted server-side operations.
- Local-only data: IndexedDB for user-owned offline notes, mini-app records and preferences; localStorage only for small non-sensitive settings.
- Offline shell: existing sw.js explicit same-origin allowlist. Do not cache authenticated API responses, authorization headers, query-string responses or third-party requests.
- Browser UI: SYK Browser is a branded discovery/search interface, not a VPN or replacement browser engine.

## Feature specifications

### SYK Neural Core
- First release is a template-driven local tool builder, not generative AI.
- Safe templates: unit conversion, offline expense log and study/task planner.
- Use DOM APIs and textContent; do not inject user text into innerHTML or execute generated code.
- Persist only user-selected local data in a dedicated IndexedDB database.
- Currency conversion must use a current, disclosed data source; never hardcode a fake live exchange rate. Initial tool should avoid claiming live currency rates.
- QR generation requires a reviewed local QR library or vetted implementation; defer until bundle size and security are reviewed.
- Sandboxed user-authored code is a later phase and must use a restrictive iframe sandbox and message validation.

### SYK Privacy Center
- Display only browser-exposed facts: HTTPS, service worker control, cookie setting, DNT signal and storage estimate.
- Do not call this a DNS tracker: ordinary webpages cannot inspect device-wide DNS queries.
- Permission status may be shown only where Permissions API supports it; never prompt for location/microphone/camera just to score privacy.
- Clear-data action must target only named SYK-owned local keys/databases. Never call localStorage.clear(), sessionStorage.clear() or delete all Cache Storage entries.

### Holographic Cyber-Deck
- Theme tokens: Deep Obsidian #07090F, Neon Cyan #00F0FF, Emerald #00FF66.
- Prefer CSS transforms/opacity and modest blur; avoid continuous expensive WebGL effects on mobile.
- 60 FPS is a performance target on capable devices, not a universal guarantee.
- Provide reduced-motion and low-effects modes.

### Noor-ul-Huda / Islam360
- Arabic: Amiri; Urdu: Noto Nastaliq Urdu; use explicit lang and dir attributes and proper RTL containers.
- Quran Arabic must be copied from a verified source and not edited by AI.
- Separate scripture, translation, Hadith and AI-assisted reflection visually and semantically.
- Cite Surah/ayah and Hadith sources. Never label AI text as Quran or authentic Hadith.
- Offline content must retain its references and translation attribution.

### Offline Vault / P2P
- Cache the public app shell and approved static assets only.
- IndexedDB stores user-owned notes and local mini-app records.
- Sync queue must be idempotent, authenticated and conflict-aware.
- WebRTC P2P is exploratory; signaling and STUN/TURN availability/cost must be evaluated before any promise of free universal connectivity.

### Creator Trust Engine
- Use database-issued moderation states and server-authorized creator verification.
- Upvotes require authenticated user identity and unique (user, submission) constraints.
- Never trust client-supplied counters or role flags.
- Cryptographic attestations are a later phase; signing keys must never ship in frontend code.
- Sponsored/affiliate content must be labeled; earnings shown only when backed by real auditable records.

## Roadmap

### Phase 0 — Security & Foundation (P0)
1. Finish repository-wide secret scan and review all public Supabase key usage.
2. Validate public-key role before browser initialization.
3. Audit RLS and SECURITY DEFINER functions without breaking public read policies.
4. Fix Arabic/Urdu font rendering and Admin Login modal on Android.
5. Add static regression checks and verify PWA cache versioning.

### Phase 1 — Mobile UX & visual system
1. Apply theme tokens to a controlled set of components.
2. Add low-effects mode and reduced-motion behavior.
3. Keep current four-item bottom navigation until information architecture review approves any fifth item.
4. Test 320–430px widths and short-height keyboard layouts.

### Phase 2 — Offline Vault
1. Review current service worker allowlist and offline fallbacks.
2. Add IndexedDB notes and local utility records.
3. Add explicit cache/data management without clearing unrelated app data.
4. Test airplane mode, reconnect, quota exhaustion and update flow.

### Phase 3 — Neural Core
1. Release template-driven unit converter, expense log and planner.
2. Add export/delete controls for local data.
3. Add QR only after selecting a vetted local implementation.
4. Evaluate sandboxed custom code separately.

### Phase 4 — Noor-ul-Huda
1. Verify Quran Arabic and source attribution.
2. Implement language-aware RTL components.
3. Add sourced translations and clearly labeled reflections.
4. Test Arabic/Urdu at 320–430px and offline.

### Phase 5 — Privacy Center
1. Add browser-exposed privacy diagnostics.
2. Explain unsupported DNS/device-wide tracking explicitly.
3. Add scoped local-data clearing.
4. Avoid arbitrary privacy scores and overclaiming protection.

### Phase 6 — Creator Trust Engine
1. Review existing creator tables and owner-admin authorization.
2. Design submissions, moderation and unique upvotes against existing schema.
3. Add auditable verification criteria and disclosures.
4. Explore cryptographic attestations only after key custody design.

### Phase 7 — P2P and advanced AI
1. Prototype WebRTC only after infrastructure/cost review.
2. Evaluate local/on-device AI feasibility on low-cost Android hardware.
3. Do not add paid inference, TURN or hosted dependencies without owner approval.

## SQL safety gate
Do not execute the supplied sample SQL unchanged. It introduces a second profiles/creator_submissions model and makes is_admin a client-editable profile field unless additional restrictions are added. It can conflict with existing sk_profiles and creator tables. First map the current schema, use the existing single-owner admin predicate, deny members any ability to update role/verification columns, and test RLS policies with anon, member and owner sessions. No migration is approved by this blueprint.

## Release acceptance
- Static checks and JavaScript syntax checks pass.
- No secrets or privileged credentials in public files.
- No new table/policy migration without a reviewed rollback.
- Mobile layout tested on Android, including keyboard and RTL text.
- Offline behavior tested with network disabled.
- No false claims about AI generation, DNS visibility, security score, 60 FPS or creator income.
