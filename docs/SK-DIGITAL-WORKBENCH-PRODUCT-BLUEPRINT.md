# SK Cyber Hub — Digital Workbench Product Blueprint

## Product conclusion
SK Cyber Hub should become a **trusted digital workbench**, not a clone of any single app. Combine useful workflows inspired by browsers, email, media tools and AI assistants while keeping third-party accounts and private data inside their original providers.

## Reference-app capability map

| Reference | Useful concepts to learn | SK Cyber Hub approach |
|---|---|---|
| UC Browser | Fast browsing, video playback, download organization, privacy controls, translation | Curated browser shortcuts, safe file guide, media organizer roadmap |
| Opera | Workspaces, tab organization, sync, sidebar services, split-screen workflows | Device-local saved tools, recent launches, task workspaces roadmap |
| Snaptube | Media discovery, quality choices, offline player, local library | Legal media discovery and personal-file library; no unauthorized ripping |
| Gmail | Search, labels, filters, archive, spam controls, attachments | Email shortcuts and a future user-owned mail organizer only with approved OAuth/API |
| ChatGPT | Natural-language help, search, files, images, projects and work | AI launchpad, reusable prompt library, comparison workflow |
| Copilot | Writing, productivity, web assistance and work context | AI task templates and official service hand-off |
| DeepSeek | Reasoning, coding, file/text extraction and chat history | Reasoning/coding task templates and AI comparison |
| Gemini | Research, Canvas, learning, connected apps and creative tools | Research, learning and creation categories with official links |

## Implemented in this release
- Dedicated Digital Workbench section and navigation shortcut.
- Service launch cards for UC Browser, Opera, Snaptube, Gmail, ChatGPT, Copilot, DeepSeek and Gemini.
- Search across the eight launch cards.
- Device-local favorites and recently opened services (maximum 12).
- AI prompt composer with copy action; users explicitly paste into the AI service they choose.
- Device-local quick notes with clear action.
- Responsive mobile layout and privacy disclosure.
- External links open in a new tab with safe opener isolation.

## Product principles
1. One global search; categories and filters should stay predictable.
2. Fast mobile-first loading, accessible contrast, keyboard focus, reduced motion and clear empty states.
3. User control: save, recent, clear, export and delete personal data.
4. Transparent labels for external services, sponsored content, affiliate links and downloads.
5. No fabricated reviews, download counts, urgency, notifications or earnings.
6. Never request third-party passwords, session cookies, API secrets or inbox access in the browser.
7. Keep personal notes, favorites and history local unless the user explicitly opts into account sync.
8. Use official provider OAuth and documented APIs only for future integrations; review scopes and privacy before enabling.
9. Only help users download content they own or are authorized to save. Respect copyright, platform terms and DRM.
10. Maintain free-first operation; no paid APIs, hosting, storage upgrades or billing without explicit owner approval.

## Recommended future roadmap
### Phase 1 — Core trust and usability
- Global search across all directory resources.
- Favorites, recent history, shareable resource pages and clear source labels.
- Report broken links and outdated app versions.
- Resource quality metadata: official source, platform, pricing model, last checked, permissions and update date.
- Accessibility, language switch, installable PWA and offline read-only shell.

### Phase 2 — Personal workspace
- User-controlled collections/workspaces (Study, Creator, Work, Personal).
- Export/import bookmarks and notes.
- Optional cloud sync only after private storage, RLS and consent are verified.
- File organizer for user-owned files, quota display, delete/export controls.
- Email connection only through approved OAuth with minimal read scopes; no password collection.

### Phase 3 — AI productivity
- Prompt library for writing, translation, research, coding, study and creator tasks.
- Side-by-side answer comparison by opening provider services; do not imply a shared AI backend.
- Provider/API integrations only when official API, free allowance, data handling and cost are documented.
- Show model/provider name, limits, citations and date checked; never promise unlimited free AI.

### Phase 4 — Media and creator studio
- User-owned media library, metadata, captions, transcript editor and compression.
- Links to official editing/hosting services.
- Downloads only from official sources or where the user has permission; no bypassing DRM or access restrictions.
- Private media storage only after Supabase bucket policies and quota limits are verified.

### Phase 5 — Community and sustainable business
- Transparent creator profiles, follows, posts, moderation and notifications.
- Clearly labeled affiliate/sponsored resources only after program approval.
- Real referrals and reward rules with eligibility, caps, anti-fraud checks and auditable records.
- No fake balances or guaranteed-income claims; no payout promise before a real payment provider and legal compliance are established.

## Integration boundary
The launch cards are external links, not native integrations. Gmail inbox access, AI conversations, browser history, provider subscriptions and media downloads remain inside each provider until an official, permissioned integration is deliberately built and reviewed.

## Cost and security boundary
This blueprint and current launchpad use static files and browser localStorage. They do not require a new paid service, API key, storage bucket, subscription or billing change. Existing Supabase migrations are separate and must not be assumed deployed merely because GitHub Pages is updated.
