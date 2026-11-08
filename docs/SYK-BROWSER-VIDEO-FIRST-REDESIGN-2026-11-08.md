# SYK Browser — video-first redesign

Date: 8 November 2026

## Included in this branch
- The root public URL and PWA start URL open SYK Browser by default; explicit section/auth hash links remain on the main site.
- The Browser home is video-first: the home view hides the old quick-access, game and interest sections.
- Public video feed includes only approved member videos and published Admin video items. Image and channel cards are excluded.
- Each card opens its own video player popup and shows the upload date/time in the viewer's locale.
- Admin can mark approved member videos as trending; trending items appear before the newest items.
- The signed-in account dropdown contains the member's video submission form and submission history. Guests see only Login.
- Day/night preference is shared through the same local preference key used by the SYK theme.
- New SVG brand mark is used for browser favicon, main-site brand mark and PWA manifest icon.
- The service worker cache is advanced to v17 and the static check is updated.

## Known limits — not represented as complete
- The registered `sk_creator_channels` table currently contains only a generic YouTube homepage entry titled “SYK Featured Video”; no real owner channel URL is configured. The remembered channel name is “KAKAR TIMES”, but its exact YouTube channel URL/ID is still required before a channel feed can be connected.
- YouTube's live search/trending results are not embedded inside SYK yet. The current search fallback opens YouTube's own results page using the browser language and the Asia/Riyadh timezone hint where applicable. Showing live search results inside SYK and opening each result in the popup requires a YouTube Data API key (free quota exists, but the key must be created and safely configured) or a server-side feed integration.
- “Trending” here means an Admin-curated flag/order, not a claim based on live YouTube view counts.
- Android screen rotation during fullscreen remains browser-dependent; the app can request landscape but cannot force every Android browser to allow it.
- This source change does not prove the GitHub Pages deployment is live or substitute for device testing. Verify anonymous browsing, member upload, Admin approval/trending, login/logout, both themes and popup playback after deployment.