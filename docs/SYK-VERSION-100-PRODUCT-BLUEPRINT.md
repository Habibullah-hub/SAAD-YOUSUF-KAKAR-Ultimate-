# SYK Cyber Hub — Version 100 Product Blueprint

Status: architecture and implementation plan; not a claim that every module is already complete.
Owner: SYK Cyber Hub
Deployment model: GitHub Pages + the existing dedicated SYK Supabase project.

## Product direction

Build SYK Cyber Hub as a calm, intelligent digital workspace: one clear starting point, one universal search, consistent navigation, and specialist destinations for each real capability. The homepage should orient and help people act; it should not attempt to display every feature at once.

## Non-negotiable safeguards

- Preserve existing Supabase rows, authentication, storage, policies, Edge Functions, public URLs, and working feature entry points.
- Do not run migrations, change RLS, or alter live data as part of a visual redesign.
- Never place service-role keys or other secrets in browser code.
- Do not invent AI responses, live status, weather, social proof, balances, earnings, subscriptions, or payment functionality.
- Prefer free, static, browser-native capabilities. Any external API, paid service, quota-consuming integration, or storage expansion requires explicit owner approval and a cost/quota review.
- Keep the website usable on Android first, then tablet and desktop; support keyboard, visible focus, reduced motion, and Urdu RTL as well as English LTR.
- Keep existing IDs, anchors, forms, event hooks, and feature scripts stable unless a separately tested migration proves a change is safe.

## Information architecture

1. **Home** — personalized orientation, universal search, quick actions, featured discoveries, continue/recent items where real data exists.
2. **Apps** — app and software directory, verified source links, clear platform and safety metadata.
3. **Browser** — the central discovery/search destination; one search entry point across the platform.
4. **AI Center** — categorized AI services with free/paid status clearly labeled; local prompt helpers must be identified as local tools, not connected AI.
5. **Academy & Documents** — learning paths, courses, reference documents and productivity resources.
6. **Creator Hub** — creator tools, public video discovery and moderated member submissions, preserving current approval rules.
7. **Community** — posts, comments, follows, notifications and moderation using existing database permissions.
8. **Live & Messenger** — distinct live rooms and private messaging, with clear connection/error states.
9. **Islamic Center** — Quran, daily reminders and learning resources with references and respectful presentation.
10. **Discover** — news, jobs, deals and useful global resources, with source/date labeling.
11. **Profile** — member identity, saved items, submissions, preferences and account controls.
12. **Owner Admin** — owner-only controls; never expose admin actions to ordinary members.

## Homepage composition

- Compact sticky identity header with logo, account state, language/theme controls.
- A single universal search with clear scope and accessible keyboard behavior.
- A concise welcome/hero panel with two or three useful actions, not a large decorative empty area.
- A small app-launcher grid for the most-used destinations.
- One or two curated sections (featured discoveries and continue exploring) with "View all" links.
- Optional personalized content only when authenticated data is genuinely available.
- A mobile bottom navigation with Home, Apps, Browser, Community, Profile; desktop uses a wider navigation layout.
- Long catalogs stay on their specialist pages and are progressively disclosed rather than flooding Home.

## Design system

- Premium editorial workspace: warm clean light mode by default, deep navy night mode, restrained blue/teal accents, subtle gradients, rounded but not oversized cards.
- Consistent spacing, type scale, button hierarchy, card states, empty/loading/error states and responsive breakpoints.
- Touch targets of at least 44px where practical; no hover-only interactions.
- Avoid repeated cards, duplicate directories, multiple competing search bars, decorative widgets without live data, and heavy animation.
- Respect saved theme preference and system reduced-motion preference.

## Delivery sequence

### Phase 1 — Stabilize and audit
Inventory pages, scripts, CSS cascade, links, forms, feature IDs, PWA caching, Supabase calls and current CI checks. Remove only proven duplicates and dead presentation references. Do not delete user data.

### Phase 2 — Shared shell
Unify typography, colors, spacing, responsive header/navigation, theme and language controls. Preserve every feature's existing DOM contract.

### Phase 3 — Homepage
Refine hierarchy and reduce overload; make universal search and quick actions the obvious starting point. Keep detailed directories on their own sections/pages.

### Phase 4 — Specialist modules
Apply the same design system to Browser, Apps, AI, Academy, Creator, Community, Live, Messenger, Islamic Center and Discover. Test each module's real interactions rather than styling screenshots alone.

### Phase 5 — Trust, accessibility and performance
Check source labels, outbound links, empty/error/loading states, safe embeds, focus order, contrast, RTL/LTR, reduced motion, mobile layout, caching and page weight.

### Phase 6 — Release
Run static/security checks and relevant CI workflows; review diffs for accidental data/auth changes; merge only passing changes. Verify GitHub Pages deployment and then request owner-side Android checks for behavior that cannot be simulated in CI.

## Release gate

A change is not "live" merely because it is committed or merged. Report separately: branch/PR status, CI status, merge status, Pages deployment status, and real-device status. Never claim the last two without evidence.
