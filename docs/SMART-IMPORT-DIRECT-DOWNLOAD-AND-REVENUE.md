# SK Cyber Hub — Smart Import, Direct Download and Bandwidth Revenue

**Date:** 2 November 2026  
**Status:** design and database foundation only; not deployed or connected to the live Supabase project.

## 1. Owner's one-click import workflow

The target Admin Dashboard flow is:
1. Open **Smart Import**.
2. Choose a source/domain (for example, an approved software publisher or app catalog).
3. Search for a product within that source.
4. Select a result.
5. The importer prepares a preview: title, description, icon, category, platform, version, publisher, source URL, and any direct-file URL the source explicitly exposes.
6. Owner reviews the source and metadata, then presses **Add to SK Cyber Hub**.
7. The resource is saved as a draft first. Owner can publish after checking the listing.

The importer should never silently publish scraped content or claim a download is safe merely because metadata was found.

## 2. Search reality and free-first choice

A Google-like full-web search API is not automatically free or unlimited. Google's current Programmable Search guidance supports a free site-search experience for up to 50 designated domains. Google's January 2026 product update says new engines must use site-specific search; full-web search requires contacting Google for its newer solution, and the transition for affected existing engines is scheduled by 1 January 2027.

- Google Programmable Search overview: https://support.google.com/programmable-search/answer/4513751
- Google January 2026 product update: https://programmablesearchengine.googleblog.com/2026/01/updates-to-our-web-search-products.html

**Recommended first version:** site-specific search across a curated set of up to 50 approved domains, not an expensive or unbounded full-web search API. It can cover official app stores, software publishers, document providers and trusted tool directories. A search-engine ID/configuration will be needed; do not put a paid API key in public HTML.

A generic search for any arbitrary website cannot be promised as free until its provider, quota, and terms are confirmed. Do not scrape Google/Bing result pages as a substitute for an authorized API.

## 3. Metadata extraction

When a source is approved, the import service may parse Open Graph fields (og:title, og:description, og:image, og:url), standard page title and description, structured metadata such as JSON-LD when present, and publisher-provided version/file size/release date where clearly identified.

- Open Graph: https://ogp.me/
- MDN CORS: https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CORS
- MDN SSRF: https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SSRF

Browser JavaScript cannot reliably read arbitrary third-party pages because cross-origin fetches are restricted unless the source grants CORS access. A backend fetch service is therefore needed for broad metadata extraction.

The backend must be restricted to owner-approved exact hostnames, HTTPS only, small response sizes, short timeouts, content-type checks, redirect rejection or re-validation, and private/local IP blocking. It must never fetch arbitrary URLs supplied by ordinary members. Otherwise the feature could become an SSRF vulnerability.

## 4. Direct download behavior

A listing has three distinct modes:
- **Direct file:** source has explicitly exposed a stable HTTPS file URL; user taps Download and the browser requests that file from its actual host.
- **Official page:** the source only provides a product page; show “Open official download page”.
- **External page:** source is a general web page; show “Visit source”.

Do not label an ordinary product page as a direct download. Do not download files to SK storage or relay them through SK servers by default. That would consume the owner's hosting bandwidth, require storage/egress, create malware liability, and may violate copyright or provider terms.

A direct file link can still be served by the original provider without leaving a product detail page first, but the actual file transfer is between the user's device and the provider's server. Some providers block direct downloads, require cookies/login, or use temporary signed URLs; those must fall back to the provider's official page.

## 5. Source trust and Modyolo example

Modyolo is not an approved source. A public scan report surfaced during this review gave it a high-risk warning and reported multiple antivirus flags. That report is a warning signal, not proof about every file, but it is enough to keep automatic importing/direct downloads disabled pending a proper independent review.

- Public scan report: https://tools.malwaretips.com/url-scan/modyolo.com

The system should support source states:
- Unverified: no automatic metadata fetch or direct-download button.
- Approved: owner has reviewed the domain and enabled only the capabilities appropriate to it.
- Blocked: no import or download actions.

For APKs, prefer Google Play or the developer's official distribution channel. If a third-party source is later approved, show a clear third-party warning and do not make an unsupported “virus-free” claim. Never host modified/pirated premium apps or bypass paid access.

## 6. Does every MB used by a visitor pay the website owner?

No. A visitor's mobile-data usage does not automatically pay the website owner. The mobile carrier/ISP sells the data service; the site owner does not receive a per-MB share simply because the site was visited.

There are separate, opt-in business models such as selling unused bandwidth through a specialist network, but that is not the same as normal website traffic and carries privacy, security, carrier-terms, and reputation risks. It should not be built into SK Cyber Hub or run through visitors' connections.

SK should earn through transparent, consent-based sources:
1. Affiliate commissions for qualifying purchases or signups, after partner confirmation.
2. Direct sponsorships clearly labelled as sponsored.
3. Ad placements after network approval, following that network's policies.
4. Paid services/digital products only when SK can deliver them.
5. Member commissions only from a real, settled partner revenue share.

Never reward ad clicks or incentivize ordinary ad impressions. Never promise money for merely using data, browsing, downloading, or searching.

## 7. Database support prepared

The proposed supabase/SK-UNIFIED-RESOURCES.sql now includes download_url and download_mode, source_domain and source_review_status, an owner-only sk_import_sources registry, source permissions disabled by default, and RLS policies that rely on the existing owner-only sk_is_admin() helper.

This SQL has not been run. The UI, authorized search provider, server-side metadata extraction function, source review process, and download testing still need to be built and deployed.

## 8. Acceptance tests before launch

- A member cannot open Smart Import or change source approvals.
- A non-approved source cannot be fetched automatically.
- Invalid schemes, localhost/private IPs, redirects to unapproved hosts, huge responses and non-HTML content are rejected.
- Imported data is previewed and saved as draft; it is not auto-published.
- No file is copied to SK storage.
- Direct-download mode is used only for a verified file URL from an approved source.
- If a provider blocks direct download, the UI clearly falls back to its official page.
- No service_role key is present in HTML, JS, PWA assets, or the Android package.
- No new paid API or storage is activated without explicit owner approval.