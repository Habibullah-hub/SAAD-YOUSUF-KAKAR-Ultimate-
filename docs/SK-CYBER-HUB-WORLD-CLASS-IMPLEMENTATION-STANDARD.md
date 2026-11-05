# SK Cyber Hub — World-Class Implementation Standard

Status: Phase 1 implementation baseline  
Repository: `Habibullah-hub/SAAD-YOUSUF-KAKAR-Ultimate-`  
Branch: `implementation/world-class-ux-phase-1`  
Constraint: free-first; no paid service, API, storage, or subscription without explicit approval.

## Product promise

One useful, trustworthy digital hub for apps, AI tools, learning, media creation, work opportunities, news, community, and a personal workspace. Clearly distinguish SK-owned features from third-party services.

## Non-negotiable product rules

1. Preserve existing working features and section IDs during incremental redesigns.
2. One shared backend/database for website and Android; no duplicate content stores.
3. One owner Super Admin. New accounts default to Member. No client-side role escalation.
4. Never claim a feature is live until its backend, permissions, and end-to-end behavior are tested.
5. Never fabricate downloads, ratings, reviews, earnings, verification badges, or user counts.
6. Keep third-party links clearly identified; label sponsored placements and affiliate links.
7. Do not add forced ad delays or disguise advertisements as download buttons.
8. Warn before any paid dependency or action that could incur charges.
9. Support mobile, desktop, keyboard navigation, reduced motion, RTL, and slow connections.
10. Treat privacy, safety, accessibility, and performance as product requirements.

## Homepage information architecture

1. Persistent header: brand, global search entry, language, account, menu.
2. Hero: plain-language promise and one primary action.
3. Quick tasks: Apps, AI Tools, Learning, Creator, Jobs, News.
4. Popular and recently verified resources.
5. Eight top-level destinations:
   - Discover & Apps
   - AI & Smart Tools
   - Learn & Documents
   - Create & Media
   - Work & Earn
   - News & World
   - Community
   - My Workspace
6. Smart Free Finder and meaningful filters.
7. Recommendations with transparent reasons.
8. Continue exploring / saved items for signed-in users.
9. Learning and creator guides.
10. Jobs and opportunity listings with verification dates.
11. News from identifiable publishers.
12. Footer: About, contact, privacy, terms, safety, sitemap.

Existing sections should be mapped into these destinations, not deleted merely to simplify navigation.

## Resource card contract

Every resource card should show, when available and verified: original name/logo, concise purpose, category, supported platform, pricing state (Free / Limited Free / Paid / Unknown), source/official URL, last checked date, version where relevant, safety notes, and a report-broken-link action. Do not invent missing metadata.

## Search contract

- Search across all published resources.
- Suggestions while typing, keyboard support, clear button, loading and empty states.
- Tolerant matching and synonyms where feasible without a paid service.
- Filters for category, platform, price, language, and verified status.
- Urdu/Arabic and English query support; correct RTL/LTR rendering.
- No-results state offers useful alternate terms and category links.
- Ranking prioritizes relevance and trustworthy/current sources, not paid placement.

## Visual system

Retain the established deep navy, mint, and sky-blue identity. Use color consistently; reserve warning/error/success colors for semantic states. Prefer readable system/Inter typography for Latin text and an appropriate Arabic-script font fallback for Urdu/Arabic. Avoid excessive gradients, glow, parallax, autoplay, and decorative motion.

## Motion and accessibility

- Short, purposeful feedback only; never animate essential information.
- Respect `prefers-reduced-motion`.
- Visible keyboard focus, semantic headings, labels, landmarks, and descriptive link names.
- Aim for WCAG 2.2 AA contrast and keyboard access.
- Touch controls should be comfortably usable (target at least 44 CSS px where practical).
- Do not use color alone to communicate status.
- Provide readable Easy Mode and high-contrast behavior.

## Responsive behavior

Mobile: prioritize search, quick tasks, compact cards, simple navigation, safe-area spacing, and low data use.  
Desktop: use available width for filters, multi-column resource cards, and full admin tables.  
All layouts must avoid horizontal overflow and preserve logical focus order.

## Performance budgets and validation targets

Target Core Web Vitals: LCP <= 2.5s, INP < 200ms, CLS < 0.1 at the 75th percentile. These are targets, not claims of current performance. Measure on real mobile devices and slow networks. Defer non-critical scripts, lazy-load below-the-fold media, reserve image dimensions, minimize third-party requests, and avoid unnecessary DOM work.

## Admin and member model

Admin areas must be server-authorized and protected by database policies. Maintain audit records for sensitive changes. Members can manage their own profile, saved resources, suggestions, posts, notifications, privacy, and account deletion, subject to safe authorization rules. Never expose service-role credentials in browser or Android client code.

## Earning integrity

Use only lawful, disclosed monetization: approved affiliate programs, clearly marked sponsorships, compliant ads, verified partnerships, and real products/services. Member commissions must be backed by recorded qualifying events and confirmed revenue. Do not display fictional balances or promise earnings. Payment handling requires a legitimate provider and applicable legal review.

## Android and PWA

Keep the shared web product consistent across browser, installable PWA, and Android shell. Test actual APK installation, back navigation, downloads, file picker, permissions, offline behavior, deep links, and accessibility on representative Android devices. A successful CI build alone is not proof of device correctness.

## Phase gates

### Gate 1 — Baseline and safety
- Confirm current production build and repository state.
- Test every visible navigation target and primary button.
- Verify database RLS, storage policies, admin bootstrap, and member role defaults.
- Test Android APK on a physical device.
- Record known partial/mock features honestly.

### Gate 2 — UX and design
- Reorganize homepage without removing existing capabilities.
- Standardize resource cards and category pages.
- Improve global search, filters, empty states, and onboarding.
- Validate mobile, desktop, RTL, keyboard, and reduced-motion behavior.

### Gate 3 — Functional completeness
- Connect each feature to its real backend or label it as a prototype.
- Complete secure community media, messaging, and live-service integration only when free and feasible.
- Add member workspace and owner-only admin controls.
- Test end-to-end with separate owner and member accounts.

### Gate 4 — Growth and revenue
- Publish useful original resource pages and tutorials.
- Add sitemap, metadata, canonical URLs, and broken-link checks.
- Introduce transparent monetization only after approval and compliance checks.
- Monitor real performance and user feedback.

## Phase 1 code change

The linked `assets/sk-world-class-experience-v1.css` received an additive accessibility and mobile usability layer: clearer focus rings, minimum touch target sizing, more readable Easy Mode, reduced-motion handling, hover-only desktop lift effects, and print rules. Existing section IDs and feature scripts were not intentionally changed.

## Definition of done

A feature is complete only when its UI, backend authorization, error/loading/empty states, mobile behavior, accessibility, and end-to-end test all pass. A source-code presence or successful build is not sufficient.
