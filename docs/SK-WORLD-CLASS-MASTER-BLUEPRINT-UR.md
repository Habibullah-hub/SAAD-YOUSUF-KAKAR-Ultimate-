# SK Cyber Hub — World-Class Master Experience Blueprint

**Research date:** 5 November 2026  
**Product:** Saad Yousuf Kakar Ultimate / SK Cyber Hub  
**Audience:** beginner and advanced users, Urdu/Arabic/Pashto/English speakers, Android, iPhone/iPad, desktop and browser users.  
**Cost principle:** free-first. No paid API, storage, subscription, domain, ad spend, billing, or upgrade without separate owner approval.

## Research integrity

No person or AI can honestly claim to have read every book, every internet comment, every AI tool, or every user's feedback. This blueprint combines the repository's existing research synthesis with current primary standards and public UX research: W3C WCAG 2.2, Google Core Web Vitals and Search Central, Android accessibility/app quality, Apple Human Interface Guidelines, Nielsen Norman Group usability heuristics, Baymard mobile/search research, plain-language guidance, and a limited qualitative sample of public community feedback. Paid Baymard reports are not reproduced or treated as freely read. User comments are signals, not representative global statistics.

## Product thesis — what makes SK unique

Build a **trusted, task-first digital workbench**: one simple starting point where a person can find a verified app, learn a skill, create original content, use a tool, understand news, save resources and connect safely. Do not clone WhatsApp, Chrome, ChatGPT, Gmail or TikTok. Give users a consistent SK layer and hand them to official providers when a third-party account or service is needed.

The unique advantage should be trust + simplicity + local-language access + curated usefulness + honest free-tier information—not neon effects or an unrealistic claim that SK replaces every app.

## 1. Information architecture — the exact top-level structure

### Mobile primary navigation
Use five persistent, labelled destinations:
1. **Home** — personal starting point and quick tasks.
2. **Explore** — all categories and curated collections.
3. **Search** — global search, filters and history.
4. **Community** — SK Pulse; guest preview, sign-in only for member actions.
5. **Profile** — saved items, recent activity, language, appearance, accessibility, privacy and account.

Do not put 15–20 tiny icons in a bottom bar. Each destination must have an icon plus a visible text label. Keep touch regions at least 48dp on Android and 44pt on iOS; comply with WCAG 2.2 target-size minimum and spacing.

### Desktop / wide tablet
- Left persistent navigation rail/sidebar with Home, Explore, Search, Community and Profile.
- Top bar with SK identity, global search, language, theme, help and account.
- Main content in a restrained 12-column grid; cards align consistently.
- Admin tools appear only to the authorized owner and never inside public navigation.

### Explore taxonomy
Group the existing 38 sections into 8 clear collections:
1. **Apps & Software:** Android apps, iOS apps, desktop software, official stores, vetted APK resources.
2. **AI & Creator:** AI tools, free finder, prompts, creator studio, video/audio/image tools.
3. **Learn & Documents:** courses, books, documents, coding, languages.
4. **Tools & Productivity:** PDF, converters, QR, utilities, security/privacy.
5. **Games & Entertainment:** browser games, game stores, media player tools.
6. **News & Trends:** world news, technology, trend radar, source directory.
7. **Community & Communication:** SK Pulse, messaging, live rooms (only when backend is ready).
8. **Work & Opportunities:** jobs, scholarships, legitimate earning resources, deals/freebies.

Keep the underlying catalog types distinct. Do not duplicate the same resource in several hand-maintained lists; use tags/collections that point to one canonical resource record.

## 2. Home page — exact order and purpose

1. **Compact header:** SK logo/name, language, theme, profile. On scroll it compresses; it must not cover focused elements.
2. **Hero:** one short promise: “Find tools. Learn skills. Create more. — All in one trusted hub.” Avoid giant marketing paragraphs.
3. **One global search field:** placeholder such as “Search apps, AI tools, courses, games, jobs…” with clear submit, voice input only where supported, and a visible keyboard/search action.
4. **Six task shortcuts:** Find an App; Create a Video; Learn Something; Find a Tool; Read World News; Find Opportunities. These are verb-led, understandable even to a first-time user.
5. **Continue where you left off:** optional local recent items; easy clear control; no account required.
6. **Featured and verified resources:** only a small number; each has source, last-checked date and honest free/paid label.
7. **Browse categories:** 8 collection cards with icon + plain-language title + one-line description.
8. **Trending / useful this week:** only if the topic has a real source, date and reason; no fake trending counts.
9. **Community preview:** a small sample of public posts; no forced sign-up popup.
10. **Trust strip:** official links, privacy-first choices, free-first disclosure, report broken link.
11. **Footer:** About, Privacy, Disclosure, Contact/support route, Accessibility, Terms, source correction/report.

Do not put every catalog card on Home. Home should orient and start tasks, not become an endless directory.

## 3. Beginner mode and Advanced mode

### Beginner / Easy Mode (default-friendly)
- Plain-language labels, not unexplained technical jargon.
- Every icon-only action gets a text label or accessible name.
- One primary action per card/screen; secondary actions are quieter.
- Step-by-step flows with examples and safe defaults.
- “What is this?” help in simple Urdu/English; explain terms like APK, AI credits, affiliate and private link.
- Guest users can explore and search without forced login.
- Short forms; do not ask for information that is not needed.
- Clear success, loading, empty, offline and error states; tell the user what to do next.
- Large text option, high contrast, reduced motion and keyboard/screen-reader support.
- Undo for reversible actions; confirmation for delete, publish, report or account removal.

### Advanced mode
- Power filters, sort controls, keyboard shortcuts, resource metadata, version/source history and saved workspaces.
- Advanced settings remain collapsed until requested.
- Do not make the beginner home look like a professional control panel.

### Language
- Urdu, English, Arabic and Pashto are priority language experiences; add more languages only when translations are checked.
- Correct RTL layout: navigation order, arrows, forms, numbers, mixed URLs, punctuation and text alignment must be tested—not merely set `dir=rtl`.
- Preserve the user's chosen language; do not unexpectedly switch pages.
- Keep original publisher/source text accessible when a translation is shown.

## 4. Search — the most important interaction

- One search controller across the entire directory, not competing independent handlers.
- Search title, aliases, transliterations, description, category, tags, platform and publisher.
- Support Urdu/English terms and common Roman Urdu spellings where feasible.
- Suggestions are grouped: resources, categories, recent searches and suggested queries.
- Filters: type, platform, free status, country availability, official/verified status, language and last updated.
- Results cards show title, purpose, resource type, supported device, price/free limits, official domain, last checked, and a direct Open button.
- Empty state: suggest spelling, remove filters, browse related category and report missing resource.
- Keep query text after returning from a result; show clear button; never hide search behind a menu on mobile.
- External search suggestions must disclose which provider receives the typed query.

## 5. Resource cards and detail pages

Every resource has one canonical record and a shareable detail page. Standard fields:
- Name, type, category, short benefit, detailed description.
- Platform/device support and region availability.
- Free / limited-free / trial / paid / unknown; explain the limit.
- Official publisher and HTTPS destination; distinguish official from third-party.
- Last checked date, version/update date if relevant.
- Account/card/phone requirement, credits, watermark, export limits, commercial-use notes when known.
- Privacy note: local processing vs remote upload.
- Primary action: **Open official site** or **Get from official store**.
- Secondary: Save, Share, Report broken/outdated link.
- Affiliate/sponsor label next to the actual commercial link, not hidden in a footer.
- No invented ratings, download counts, reviews, security badges or “100% safe” claims.

### Apps and APK safety
- Prefer Google Play, Apple App Store, F-Droid and publisher websites.
- Keep unofficial APK sources clearly separated and risk-labelled.
- Never repackage or host copyrighted/modified software without authorization.
- Do not claim an APK is safe without a real scan, source verification and date.
- Warn about permissions, unknown sources, signature mismatch and update risks.
- Never make a misleading 5-second ad gate or fake Download button.

### AI directory
For each AI provider show free quota/credits, output duration/resolution, watermark, login/card requirement, region, data-use/privacy link, commercial terms and last verification date. If the provider changes its free tier, mark it “recheck” rather than silently promising it remains free.

## 6. Community / member experience

- Guests may read public content; login required only to post, follow, comment, save or message.
- Profiles have privacy controls and only expose fields the member chooses.
- Feed tabs: For You, Latest, Following, Saved; explain ranking signals and allow “more like this / less like this”.
- No fake online users, fabricated likes, false urgency, coercive streaks or red notification tricks.
- Report, block, mute, delete-own-post and admin moderation actions are easy to find.
- Photo upload only after private/public visibility is explained; show file size and upload progress; allow cancel/delete.
- Notifications are real events and individually markable as read.
- Streaks must be optional, truthful, non-punitive and based on documented rules.
- Add rate limits, anti-spam and abuse controls before expanding reach.
- Do not activate messaging/live calls until table, RLS, room authorization and privacy tests pass.

## 7. Member Profile and personal workspace

Tabs:
- Overview
- Saved resources
- Recent activity (local by default)
- Followed topics/creators
- My posts/comments
- Language & appearance
- Accessibility & privacy
- Account security
- Export my data / delete account

Personal notes, favorites and history should stay on device unless a clear opt-in cloud sync is implemented. Provide clear clear/export/delete actions.

## 8. Admin — one owner, no accidental privilege escalation

- One owner-only Super Admin; all new accounts default to member.
- Admin login should use MFA where available and a secure owner identity check.
- Do not rely solely on a client-side hidden button or role string.
- Database remains source of truth; no service-role/secret key in HTML, JS, PWA or APK.
- Admin modules: resource catalog, app importer, suggestions queue, news/source curation, moderation, broken-link review, analytics, creator records and settings.
- Resource publishing: draft → preview → validate HTTPS/domain → publish; unpublish and rollback.
- Keep audit trail: who changed what and when; avoid logging passwords/tokens.
- Require confirmation for destructive changes and provide undo/restore where feasible.
- Never execute SQL migrations automatically from the website.

## 9. Ethical earning model

### Owner revenue
1. Approved affiliate programs with visible disclosure.
2. Direct sponsorships with clear “Sponsored” labels.
3. Ad network only after approval and policy compliance.
4. Optional digital products/services only if genuinely deliverable.

### Member earnings
- Only funded tasks, real partner referral commissions or sponsor-paid creator work.
- Credit only after the partner confirms and settles the transaction.
- Separate pending, approved, payable and paid ledger states.
- Publish eligibility, caps, validation time, payout minimum and country restrictions before a user participates.
- Never reward ad clicks, fabricate cash balances, sell user data or promise guaranteed income.
- No forced ad gate before ordinary downloads/content.

## 10. Visual design system

### Brand direction
Retain the recognizable SK dark navy + mint identity, but create a calm light theme as a first-class option. Avoid a different unrelated palette in every module.

Suggested core tokens (preserve existing tested values initially):
- Deep ink: `#071522`
- Panel: `#0D2030`
- Raised surface: `#122B40`
- Main text: `#F2F8FC`
- Muted text: `#A8BDCC`
- Primary mint: `#67E6D0`
- Link blue: `#83C8FF`
- Accent violet: `#B6A4FF`
- Semantic green / amber / red only for success / warning / danger.

The current palette has strong calculated contrast on the listed navy surfaces, but every real component, hover, disabled and light-theme state still needs contrast testing. Never communicate status through color alone.

### Typography
- Latin: Inter where locally available, then system UI/Segoe UI/Arial.
- Urdu/Arabic: platform-native Noto Naskh Arabic / Noto Sans Arabic / suitable system Arabic fallback; test Nastaliq rendering and line-height on Android.
- Body text around 16px minimum on mobile; comfortable 1.5–1.7 line height; headings use a consistent scale.
- Do not load a large external font package before measuring its performance and script coverage.
- Never set fixed heights that clip Urdu/Arabic glyphs or translated labels.

### Layout / cards
- Use a consistent spacing scale (4/8/12/16/24/32), 12-column desktop grid, single-column mobile cards and restrained card radius (12–18px).
- Each card: icon/thumbnail, title, one-line purpose, 2–3 useful metadata chips, one clear primary action.
- Avoid huge shadows, excessive glass blur, excessive gradients and decorative motion.
- Align text and controls; use consistent empty/loading/error states.

### Motion
- Short, purposeful transitions, generally 120–220ms for micro-interactions.
- Animate opacity/transform rather than layout dimensions or large blur effects.
- No autoplay background video, no flashing, no motion required to understand content.
- Honor `prefers-reduced-motion`; add a visible motion setting if appropriate.
- Use a real pressed/loading state so taps feel acknowledged; never fake progress.

## 11. Accessibility and inclusive design

Target WCAG 2.2 AA for the web and platform-native accessibility guidance:
- Keyboard access and visible focus; focus must not be hidden by sticky bars.
- Contrast: 4.5:1 for normal text, 3:1 for large text under WCAG AA.
- Web target size: WCAG 2.2 minimum 24×24 CSS px with spacing exceptions; practical target 44–48px.
- Android: 48×48dp touch target guidance.
- iOS: 44×44pt general hit target guidance.
- Semantic headings, labels, button names, alt text, landmarks and status announcements.
- Form errors beside the field and summarized at top; preserve typed input after error.
- Captions/transcripts for spoken video/audio where content is provided.
- 320 CSS-pixel viewport/zoom reflow, text enlargement, RTL/LTR and color-blind checks.
- Never use color alone, icon alone or animation alone to convey meaning.

## 12. Performance and reliability

Measure first; then optimize. Target Google's good Core Web Vitals at the 75th percentile:
- LCP ≤ 2.5 seconds
- INP ≤ 200 milliseconds
- CLS ≤ 0.1

Implementation:
- Establish Lighthouse/PageSpeed baseline on mobile and desktop before/after each phase.
- Remove unused/duplicate third-party scripts; load noncritical tools only when their section opens.
- Review Tailwind CDN, XLSX, Google Translate and LiveKit loading cost and necessity.
- Split the 500KB single-page experience into route/page modules over time without breaking URLs or existing data.
- Lazy-load below-the-fold images and media; set dimensions to avoid layout shifts.
- Defer noncritical JavaScript; avoid long main-thread tasks.
- Add explicit offline/error states; don't cache authenticated/private API responses in a public service-worker cache.
- Cache versioned static shell assets safely and test update rollback.
- Measure on low/mid-range Android and slow network, not only desktop Wi-Fi.

## 13. Android, Apple and desktop experience

### Android
- Main app launch must match the website's main Home, not unexpectedly open a separate browser/discovery start page.
- Use clear, labelled navigation and 48dp targets.
- Handle system Back, downloads, file picker/camera, permission requests, network loss and WebView errors.
- External OAuth may need a compliant system-browser/Custom Tabs flow; do not assume every provider supports WebView login.
- Do not claim full browser features until tabs, bookmarks, privacy modes, download safety and browser security are implemented and tested.

### iPhone / iPad
- Current repository has no native iOS app. Support responsive Safari/PWA first.
- Provide correct safe-area spacing, touch targets, share behavior, install instructions and offline fallback.
- Do not claim App Store availability until a native app is built, signed, reviewed and published.

### Desktop / laptop
- Keyboard-first navigation, focus visibility, logical tab order, wide-screen sidebar, readable content width, multi-column resource grids and accessible dialogs.
- Support mouse, keyboard, screen reader, zoom and narrow desktop windows.

## 14. SEO and sustainable traffic

- Each valuable category/resource gets a useful, descriptive, shareable URL.
- Unique titles/descriptions and original explanations; avoid thin pages containing only outbound links.
- Sitemap, robots, canonical URLs, breadcrumbs and structured data only where accurate.
- Keep source, last-updated and editorial ownership visible for news and AI free-tier data.
- Create genuinely helpful original tutorials, comparisons and local-language guides.
- Share through creator channels without spam, fake engagement or copied AI videos.
- Measure searches with no results, broken links, returning users, task completion and user feedback—not raw page views alone.
- Use privacy-respecting analytics and disclose what is collected.

## 15. Delivery roadmap — implement without breaking the current product

### Phase 0 — Evidence baseline (now)
- Finish the A–Z code/app/database audit.
- Record existing page screenshots and device tests.
- Run CI and Lighthouse; check all feature dependencies against Live Supabase.
- Fix duplicate IDs and known broken navigation first.

### Phase 1 — Navigation and design foundation
- Define shared design tokens and typography.
- Reorganize 38 sections into 8 collections.
- Build task-first Home and labelled mobile bottom navigation.
- Keep old URLs and existing Apps renderer working.
- Add accessible states and reduced-motion support.

### Phase 2 — Catalog and search
- One canonical resource data model; no duplicate manually curated cards.
- Global search, filters, synonyms, no-results recovery and detail pages.
- Owner-only import/preview/publish workflow; broken-link report.
- Do not apply new SQL until exact schema diff and approval.

### Phase 3 — Trust, language and accessibility
- Easy Mode, RTL, translation QA, contrast and screen-reader pass.
- Official source verification, free-tier metadata and last-checked dates.
- Safe APK/download warnings and clear privacy disclosure.

### Phase 4 — Backend feature activation
- Reconcile every Community/Messenger/Live/Creator table and RPC with the current live schema.
- Back up, diff, owner approval, then migration-by-migration deployment only.
- Two-member + owner tests; RLS and Storage security review.

### Phase 5 — PWA and native Android
- Align PWA start_url and native Android Home.
- Static asset caching/offline behavior, install/update flow.
- Honor 400 Lite test matrix; fix failures before release.
- Native iOS remains separate scope.

### Phase 6 — Growth and sustainable revenue
- Original content, SEO, trend radar and ethical distribution.
- Affiliate/sponsor/ad approval only after policy review.
- Real, auditable revenue and member commission ledger only after a funded partner is active.

## 16. Release gates — nothing is “done” without evidence

A phase is complete only when:
1. Exact files and diff are reviewed.
2. Static checks and automated tests pass.
3. No new secret, unsafe URL, XSS, broken navigation or duplicate IDs.
4. Mobile and desktop checks pass.
5. WCAG-relevant keyboard/contrast/zoom/reduced-motion checks pass.
6. Backend changes match live schema and RLS is tested with anon/member/owner roles.
7. Real Android device test passes for Android changes.
8. Owner separately approves merge, deployment, SQL mutation, paid service or public release.

## Research sources

- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG/
- Google, Core Web Vitals: https://web.dev/articles/vitals
- Google Search Central, SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- web.dev, Third-party JavaScript: https://web.dev/articles/optimizing-content-efficiency-loading-third-party-javascript
- Android, Accessibility and 48dp targets: https://developer.android.com/guide/topics/ui/accessibility/views/apps-views
- Android, Core app quality: https://developer.android.com/docs/quality-guidelines/core-app-quality
- Apple, Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Apple, UI Design Dos and Don'ts: https://developer.apple.com/design/tips/
- Nielsen Norman Group, 10 Usability Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- Nielsen Norman Group, Recognition and Recall: https://www.nngroup.com/articles/recognition-and-recall/
- Baymard, Mobile E-Commerce UX research overview: https://baymard.com/research/mcommerce-usability
- Baymard, Search UX research overview: https://baymard.com/research/ecommerce-search
- UK Department for Education, Plain Language: https://design.education.gov.uk/content-design/plain-language
- Existing SK research synthesis: `docs/2026-platform-research-and-build-plan.md`
- Existing product blueprint: `docs/SK-DIGITAL-WORKBENCH-PRODUCT-BLUEPRINT.md`
