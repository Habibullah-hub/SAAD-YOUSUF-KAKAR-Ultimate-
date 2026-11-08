# SK Cyber Hub — Performance, Browser & Experience Pass

Date: 8 November 2026  
Branch: `main`  
Scope: static source review and lightweight UI improvements.

## Completed in source

### 1. Performance and offline shell
- Advanced the public service-worker cache from v8 to v9 so updated shell assets are refreshed.
- Kept the cache allowlist restricted to same-origin public pages and static assets.
- Included the homepage, SK Browser and Game Center in the explicit public offline-shell set.
- Added the two new small CSS files to the public static-asset allowlist.
- Preserved the existing protections: requests with query strings, authorization headers, API traffic and third-party requests are not cached.
- No new JavaScript framework, animation package, font CDN, video background or paid service was added.

### 2. SK Browser
- Added a dedicated, small stylesheet for the existing SK Browser page.
- Improved the hero entrance, search focus feedback, tile hover feedback, touch target sizing and mobile spacing.
- Preserved the existing Google web search, SK directory search, recent searches, saved shortcuts, theme toggle, settings and native-shell behavior.
- SK Browser remains a branded discovery/search interface; it is not represented as a standalone Chromium-class browser engine.

### 3. Premium visual experience
- Homepage motion stylesheet adds restrained hero entrance, floating decorative tiles, glow breathing and card/button feedback.
- Browser motion is CSS-only and limited to the browser discovery interface.
- Both stylesheets respect `prefers-reduced-motion`.
- Existing page structure, IDs, feature scripts and backend flows were not intentionally rewritten.

### 4. Regression checks
- Extended `scripts/check-static.mjs` to verify both new stylesheets, their page links, the service-worker cache version, the public asset allowlist and Browser shell entry.

## Performance verification status

This pass is a **static implementation review**, not a measured Lighthouse/PageSpeed run. No honest LCP, INP, CLS, load-time or real-device battery claim can be made from source inspection alone.

Targets remain:
- LCP: 2.5 seconds or less
- INP: under 200 milliseconds
- CLS: under 0.1

These must be measured on the deployed URL using mobile throttling and a real Android device. The large homepage HTML document and its inline code remain candidates for a later carefully tested optimization pass; they were not split in this change because doing so without a complete dependency map could break existing features.

## Manual acceptance checklist
- Open the homepage and SK Browser on Android Chrome.
- Confirm hero/cards animate smoothly and no content is hidden before animation.
- Enable Android/OS reduced motion and confirm decorative motion stops.
- Search Google and search the SK directory separately.
- Test saved shortcuts, recent history, theme toggle and bottom navigation.
- Install/update the PWA and confirm the browser receives the v9 service worker.
- Test airplane mode after one successful online visit; only the explicitly cached public shell is expected to work offline.
- Run the repository static checks and a real mobile Lighthouse/PageSpeed test before calling performance certification complete.
