# SK Cyber Hub — Next-Generation Digital Ecosystem
## Master Architecture Specification & Priority Roadmap

**Project:** SK Cyber Hub / Saad Yousuf Kakar Ultimate  
**Hosting baseline:** GitHub Pages + Supabase Free  
**Primary device:** Android mobile  
**Design direction:** Deep Obsidian Cyberpunk, accessible Neon Glass, lightweight touch interactions  
**Status:** Architecture proposal only; no feature in this document is represented as implemented.

---

## 1. Product principles

1. **Free-first, transparent operation:** No paid API, subscription, hosting, storage, or quota is required for the initial release. Free-tier limits must be displayed honestly. Never promise unlimited service.
2. **Mobile-first:** Design and test on narrow Android viewports before desktop. Keep core tasks usable on low-memory devices and slower connections.
3. **Privacy by default:** Collect the minimum data. No hidden tracking, IP retention, precise location collection, or background bandwidth sharing.
4. **Open standards:** Prefer PWA, Web APIs, IndexedDB, Service Workers, WebCrypto, WebRTC, JSON and portable formats.
5. **Progressive enhancement:** Core content and tools must still work when WebGL, advanced animation, network access, or optional browser APIs are unavailable.
6. **Owner-controlled security:** One authorized owner-admin; no client-side admin promotion; all privileged actions enforced by Supabase RLS and trusted server-side code.
7. **Honest product language:** Do not claim “zero trace”, “quantum protection”, guaranteed 60 FPS, guaranteed income, or unlimited AI. Explain actual protections and limitations.

## 2. Proposed platform architecture

### Client layer — GitHub Pages
- Responsive web application and PWA shell.
- Shared design tokens, accessible components and language-aware layout.
- SYK Browser experience, catalogues, community UI, Creator Hub, account and utilities.
- Client-side mini-app templates; never execute arbitrary generated code.
- Service Worker for versioned static assets and explicitly selected offline resources.

### Data and identity layer — Supabase
- Supabase Auth for identity.
- Existing tables and RLS remain the source of authorization truth.
- Postgres for catalogues, creator submissions, votes, user settings and approved content.
- Storage only for explicitly uploaded and approved media, subject to free quota.
- Edge Functions for operations that require trusted secrets, validation, rate limiting or server-side signatures.
- Never expose service_role or sb_secret keys in HTML, JavaScript, source maps, browser storage or public Git history.

### Local device layer
- IndexedDB for user-approved offline notes, mini-app settings and cached data.
- Cache Storage for versioned static shell assets.
- WebCrypto for local encryption and integrity checks where appropriate.
- No silent peer-to-peer relay, hidden uploads, or background sharing.

### Optional peer layer
- WebRTC data channels for direct peer sessions when users explicitly start them.
- Supabase may provide signaling and session authorization.
- A free STUN service may help connection discovery but cannot guarantee connectivity. TURN relay may require a separate service and is not part of the guaranteed-free baseline.
- P2P must be opt-in, visible, stoppable, and must disclose what data is shared.

---

## 3. Six vision features

### 3.1 SYK Neural Core — AI-powered instant mini-app generator

**Purpose:** Let users create small utilities such as calculators, converters, checklists, timers, planners and simple trackers.

**Free-first implementation:**
- Start with a curated library of safe mini-app templates and configurable blocks.
- A rule-based builder assistant can map plain-language requests to a known template and settings locally.
- Store user-created configurations in IndexedDB; optionally sync them to Supabase when logged in and when the user opts in.
- Export a portable JSON configuration or installable PWA shortcut where supported.
- Add an optional future AI adapter only if a genuinely free, reliable, privacy-respecting provider is available. Do not make paid API access a dependency.

**Security rules:**
- Do not generate and execute arbitrary JavaScript or HTML from user prompts.
- Render only allowlisted components and validated JSON schemas.
- Sanitize labels and text; enforce size limits.
- Keep user data private by default; provide export and delete controls.

**MVP acceptance criteria:**
- At least five templates work offline after first load.
- Users can customize, save, rename, duplicate and delete their tools.
- Generated tools work without an AI API.
- Clear label: “Template-powered builder; AI features may be optional.”

### 3.2 Zero-Trace Quantum Cloak — privacy and telemetry dashboard

**Rename/positioning:** Keep the codename for the concept, but describe the actual feature as **SYK Privacy & Security Dashboard**. Do not promise “zero trace” or quantum-grade protection.

**What a normal website can actually do:**
- Show the privacy settings and data practices of SK Cyber Hub.
- Show locally stored SK Hub data and offer clear/delete/export controls.
- Provide a checklist for HTTPS, secure context, browser permissions and supported security headers where observable.
- Explain known third-party resources loaded by the app.
- Offer a user-triggered privacy check and clear result explanations.

**Important technical limitation:**
- A normal webpage cannot inspect the device’s full DNS history, act as a local DNS firewall, or see all network traffic from other apps. Browser sandboxing prevents this.
- Do not claim to block system-wide trackers or guarantee anonymity.
- A limited local “tracker exposure” view may report only third-party domains that the page itself knows it loads; it is not a full network monitor.

**MVP acceptance criteria:**
- A transparent dashboard with “checked”, “not available to webpage”, and “needs manual review” states.
- No collection of browsing history or IP addresses.
- No background monitoring or invasive fingerprinting.
- Every check explains its scope and limitations.

### 3.3 Holographic Cyber-Deck — lightweight 3D touch-responsive UI

**Visual system:**
- Deep Obsidian: #07090F
- Neon Cyan: #00F0FF
- Emerald Green: #00FF66
- Supporting text: high-contrast near-white and muted slate.
- Use neon as an accent, not as the main text color.

**Implementation:**
- Prefer CSS transforms, gradients, subtle glow, border highlights and layered glass surfaces.
- Use transform and opacity for animation; avoid repeated layout-triggering effects.
- Use WebGL only for optional hero/ambient elements, lazy-load it, and provide a static CSS fallback.
- Touch tilt must be subtle and must not interfere with scrolling or taps.
- Respect prefers-reduced-motion, battery/performance constraints and low-end Android.
- Avoid large particle fields and continuous animation when the section is off-screen.

**Performance truth:** 60 FPS is a target, not a guarantee. Measure on real Android devices and automatically reduce effects when frame performance is poor.

**MVP acceptance criteria:**
- Core navigation and cards work with effects disabled.
- No horizontal overflow at 320px width.
- Reduced-motion mode removes non-essential movement.
- Animations use short, consistent durations and do not delay interaction.

### 3.4 Islam360 AI Companion — Noor-ul-Huda

**Purpose:** A respectful Islamic companion for daily Quranic insights, duas and context-aware reflections.

**Typography and layout:**
- Arabic/Quran: Amiri.
- Urdu: Noto Nastaliq Urdu.
- Explicit lang and dir attributes per content block.
- Correct Unicode Arabic shaping; never split or manually reshape Arabic letters.
- Mixed Arabic, Urdu, English and numerals must use isolated direction-aware spans where necessary.

**Free-first implementation:**
- Begin with a curated, reviewed content library containing exact Arabic text, translation, source and references.
- Daily insight selection can work locally/offline from approved content.
- “AI companion” reflections should initially be rule-based and clearly labeled as reflections, not religious rulings.
- Do not invent Quran verses, hadith, translations, references or fatwas.
- Any future AI integration must be optional, source-grounded, reviewed and must disclose provider/privacy limitations.

**MVP acceptance criteria:**
- Correct Arabic and Urdu rendering on Android Chrome.
- Each Quranic quotation includes verified surah/ayah reference.
- Clear distinction between Quran text, translation, commentary and generated reflection.
- Offline access to a small approved daily-content pack.

### 3.5 SYK P2P Mesh & Offline Vault

**Purpose:** Make selected tools and user-approved content useful when the internet is unavailable, with optional direct peer sharing.

**Offline baseline:**
- Service Worker caches the app shell and versioned static assets.
- IndexedDB stores user-approved notes, mini-app configurations and offline preferences.
- Provide visible offline status, storage usage where supported, export and delete controls.
- Cache only content that is safe and permitted to store; respect copyright and publisher restrictions.
- Add cache versioning, quota handling, migration and recovery paths.

**Optional P2P phase:**
- WebRTC data channels for explicit user-to-user sharing.
- Supabase signaling with authentication, short-lived room tokens, validation and rate limits.
- Show peer identity/session details and a clear stop/disconnect action.
- No automatic relay of other users’ data or hidden bandwidth sharing.
- Do not promise P2P works on every network. Symmetric NAT/firewall conditions may require TURN; a free TURN service is not guaranteed.

**MVP acceptance criteria:**
- Selected mini-apps and saved notes work offline after being opened/saved once.
- Users can export their vault.
- P2P is not enabled until consent, abuse controls, security review and connection limitations are documented.

### 3.6 Creator Monetization Trust Engine

**Purpose:** Build trust around creator identity, approved content and open-source contributions without misleading financial claims.

**Initial system:**
- Verified creator badge awarded only by the owner/admin after documented checks.
- Separate badges for “Identity reviewed”, “Content approved” and “Open-source contribution verified”.
- Upvotes are community feedback, not proof of quality, safety or income.
- Display transparent rules, eligibility, moderation and appeal process.
- Keep creator earnings out of the initial MVP unless a lawful, funded, auditable payment process exists.

**Cryptographic integrity option:**
- Use SHA-256 hashes for published release artifacts or contribution snapshots.
- A trusted server-side process may sign attestations; never place signing private keys in frontend code.
- Store the claim, artifact hash, timestamp, issuer and verification status.
- A hash proves content integrity relative to a known hash; it does not prove identity, safety, ownership or endorsement by itself.

**Anti-abuse controls:**
- Authenticated voting, one vote per eligible account per item, rate limits and report/moderation tools.
- RLS enforced in Supabase.
- No purchased votes, fake counters, fabricated income or guaranteed earning claims.

---

## 4. Cross-cutting requirements

### Security
- Keep service_role and all secret keys server-side only.
- Audit RLS policies before changing function permissions.
- Validate every Edge Function input; add shared rate limits for public endpoints.
- Use least-privilege access and owner-only administrative actions.
- Do not put secrets in GitHub Actions logs, client bundles or source maps.

### Accessibility and localization
- Keyboard and screen-reader support.
- Visible focus states and sufficient contrast.
- Urdu, Arabic and English; correct RTL/LTR per component.
- Text resizing without clipping.
- Reduced motion and non-WebGL fallback.

### Performance
- Mobile-first CSS; lazy-load optional modules.
- Avoid shipping WebGL or AI code in the initial critical path.
- Compress images and use responsive sizes.
- Cache static assets with safe versioning.
- Measure Core Web Vitals and real Android interaction performance.

### Data governance
- Country-level analytics only if needed; do not retain IP or precise location.
- Give users clear controls to export and delete their own saved data.
- Publish a privacy notice explaining what is stored locally and in Supabase.
- Never use user devices as hidden compute, storage or bandwidth resources.

---

## 5. Priority roadmap

### P0 — Existing critical safety work
1. Complete repository-wide scan for exposed secrets; remediate only after confirming findings.
2. Complete Urdu/Arabic font and RTL verification across Home, Browser and Islam360.
3. Verify Admin Login modal on real Android viewport and keyboard.
4. Review RLS and SECURITY DEFINER function permissions without weakening existing public features.
5. Keep P0 code changes in review PRs until tests pass; no unreviewed production deployment.

### P1 — Foundations for the new ecosystem
1. Confirm sitemap and route structure: Home /, Browser /browser, Apps /apps, AI Tools /ai-tools, Learning /learning, Creator /creator, News /news, Community /community, Opportunities /opportunities, Account /account.
2. Establish shared design tokens and responsive component system.
3. Establish language/RTL typography components.
4. Build a reliable PWA shell, offline status and cache lifecycle.
5. Add privacy dashboard MVP with honest scope and no DNS/zero-trace claims.

### P2 — Useful free-first features
1. Neural Core template-based mini-app builder.
2. Offline Vault for saved notes and mini-app settings.
3. Noor-ul-Huda curated daily insight and verified reference library.
4. Holographic Cyber-Deck CSS effects with performance fallback.
5. Creator Trust Engine badges, votes and moderation rules.

### P3 — Advanced optional capabilities
1. WebRTC P2P sharing after threat model and consent UX.
2. Server-verified cryptographic contribution attestations.
3. Optional AI provider integration only after cost, privacy, quota and fallback review.
4. Optional WebGL hero effects only if Android performance remains acceptable.

---

## 6. Free-tier and operational reality

The design goal is **zero mandatory cost**, not an unlimited-capacity guarantee. GitHub Pages, Supabase Free, browser storage, public font delivery and free network services have usage limits, policy constraints and availability risks.

Before enabling any feature, document:
- Which service it uses.
- Whether it is truly free at the expected usage.
- Its quota and rate limits.
- What happens when the quota is exhausted.
- Whether data can be exported.
- Whether a paid fallback is being suggested (never enable it without owner approval).

The initial product must remain usable without paid AI, paid TURN, paid storage or paid hosting.

---

## 7. Definition of done for every phase

A feature is not “complete” merely because its UI appears. It must:
1. Work on Android at 320px, 360px, 390px and 430px widths.
2. Have loading, empty, error, offline and success states.
3. Have authorization and RLS reviewed where user data is involved.
4. Avoid client-side secrets and unsafe arbitrary code execution.
5. Have a free-tier quota/failure plan.
6. Respect accessibility, localization and reduced-motion preferences.
7. Include a manual test checklist and a rollback path.
8. Be reported as implemented only after verification.

**Owner approval gates:** No database migration, permission change, secret rotation, paid service, PR merge or production deployment without explicit owner approval.

**North-star outcome:** A beautiful, useful, privacy-respecting, open-standards digital platform that remains genuinely usable on Android and has no mandatory paid dependency.
