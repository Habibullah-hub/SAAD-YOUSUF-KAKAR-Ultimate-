# SK Cyber Hub — public research synthesis and implementation plan

**Research snapshot:** 2 November 2026  
**Project:** Saad Yousuf Kakar Ultimate / SK Cyber Hub  
**Cost rule:** free-first; no new paid storage, credits, subscriptions, or services without explicit owner approval.

## 1. What the public evidence suggests

### Discovery is moving beyond passive scrolling
TikTok's 2026 trend forecast describes audiences arriving with an intention and then following curiosity into adjacent topics, comments, search, and niche communities. It highlights authentic stories, real processes, community participation, and useful discovery rather than polished but empty promotion.

- TikTok Next 2026: https://ads.tiktok.com/business/en/next
- TikTok newsroom explanation: https://newsroom.tiktok.com/introducing-tiktok-next-2026-our-trend-forecast-for-marketers-for-the-year-ahead

**Product implication:** SK Cyber Hub should combine search with curated related resources, topic tags, helpful explanations, and a community feed. A search should help users discover a useful next step, not just return a dead-end list.

### Users want more control over recommendations
Meta's October 2026 Facebook update describes controls that let people say which topics they want more or less of and provide feedback on recommendations.

- Meta: https://about.fb.com/news/2026/10/introducing-your-algorithm-facebook/

**Product implication:** introduce simple feedback such as “Show me more like this” and “Not interested”, plus topic preferences. Do not build an opaque engagement-maximizing feed.

### Original, useful creator content matters
TikTok's Creator Rewards guidance emphasizes original, high-quality videos longer than one minute and signals such as originality, play duration, search value, and engagement. YouTube says repetitive, mass-produced, or minimally transformed AI content may not qualify for monetization. Meta says it is prioritizing original creator content and reducing distribution of duplicative or low-value reposts.

- TikTok Creator Rewards: https://newsroom.tiktok.com/introducing-the-new-creator-rewards-program
- YouTube monetization policy: https://support.google.com/youtube/answer/1311392
- Meta original creator guidance: https://about.fb.com/news/2026/03/rewarding-original-creators-on-facebook/

**Product implication:** creator tools should help members make original scripts, explainers, demonstrations, and tutorials. Do not encourage copying viral videos or mass-producing near-identical AI posts.

### WhatsApp succeeds as a simple broadcast and discovery layer
WhatsApp Channels support one-way updates containing text, images, video, links, audio, and polls. Channels can be discovered through links and an in-app directory.

- WhatsApp Channels: https://faq.whatsapp.com/809740894165112
- Meta's WhatsApp Updates tab: https://about.fb.com/news/2025/06/helping-you-find-more-channels-and-businesses-on-whatsapp/

**Product implication:** do not attempt to rebuild WhatsApp chat. Give SK members a clean announcement feed, topic channels, polls, share links, and a safe way to follow updates. Deep-link to WhatsApp when a user chooses to continue there.

### Monetization must protect users and the project
Google AdSense prohibits artificially generated ad clicks/impressions and generally prohibits compensating users for viewing or clicking ordinary ads.

- AdSense policies: https://support.google.com/adsense/answer/48182
- Invalid traffic guidance: https://support.google.com/adsense/answer/16737

**Product implication:** never reward ad clicks, use forced misleading ad gates, or promise cash for installs/views. Keep ads clearly labelled and only integrate a network after approval and a policy review. Affiliate links must be disclosed. Member commissions should be credited only after a real partner commission is confirmed and settled.

## 2. Proposed SK Cyber Hub experience

1. **Home / Discover:** a compact hero, one obvious global search, popular categories, new and featured resources, and a small “Trending topics” strip.
2. **Resource Catalog:** one source of truth for apps, software, AI tools, web tools, documents, courses, games, creator tools, earning opportunities, and news sources.
3. **Trend Radar:** weekly curated topics with source, date checked, region, and a short explanation of why the topic is rising. Use public trend reports and permitted public feeds; do not scrape private feeds or bypass platform access controls.
4. **Community:** original posts, comments, reactions, polls, report controls, and topic follows. Make feed ranking understandable and give users “more / less” feedback.
5. **Creator Studio:** scripts, captions, safe prompt ideas, video checklists, and platform-specific policy reminders. AI is an assistant, not a content-copying machine.
6. **World News:** clearly identify publisher and publication time; link to the original publisher; distinguish news from social-media trends and opinions.
7. **Member Area:** profile, saved resources, followed topics, referral status, and transparent activity history.
8. **Admin:** one owner-only dashboard for adding, editing, publishing, unpublishing, and sorting every resource type.

## 3. Simplest no-storage publishing workflow

The owner should not need to upload app installers, PDFs, or software files to GitHub or Supabase Storage.

For each listing, enter:
- title
- resource type
- category and platform
- free / limited-free / paid / unknown
- short description
- official HTTPS destination link
- optional externally hosted icon URL
- country availability
- featured / published toggle
- affiliate flag and disclosure when relevant

The proposed `supabase/SK-UNIFIED-RESOURCES.sql` creates an additive, RLS-protected catalog for this workflow. It does not replace the existing `sk_apps` table and has not been executed. Front-end integration and testing are still required.

## 4. Realistic revenue model

**Owner revenue, in a safe order:**
1. disclosed affiliate commissions from relevant tools and services;
2. clearly labelled direct sponsorships after a real sponsor agrees;
3. ad network placements only after approval and policy review;
4. optional digital services or products only when the owner can actually deliver them.

**Member rewards, only after a funded source exists:**
- referral commission after a partner confirms and pays a qualifying conversion;
- paid creator work from a real sponsor/customer;
- funded tasks with verifiable completion and written terms.

Never create a withdrawable balance from clicks, page views, unverified referrals, or estimated partner earnings. Use an auditable transaction ledger and separate pending, approved, payable, and paid amounts. Do not advertise guaranteed earnings.

## 5. Architecture and safety rules

- Keep the website and future Android app on the same Supabase project and the same RLS-protected data model.
- Keep the owner as the only Super Admin. New accounts are members by default.
- Never place Supabase service-role or secret keys in browser code or an APK.
- Store only metadata and external HTTPS links until a genuinely free, appropriate storage option is confirmed.
- Keep old Yousuf Kakar Free Apps tables and repository separate.
- Treat news feeds and external URLs as untrusted input; validate URL schemes and render user-supplied text as text, not HTML.
- Add rate limits, moderation, spam controls, and abuse checks before launching referrals or rewards.
- Test mobile, desktop, login/logout, refresh, admin/member permissions, offline shell, and external link behavior before merging production changes.

## 6. Delivery order

1. Finish the visual/accessibility and navigation audit; remove conflicting CSS overrides rather than stacking more patches.
2. Integrate the unified resource catalog with the existing owner-only admin UI.
3. Consolidate the duplicate search handlers into one tested search controller.
4. Improve Trend Radar and community feedback without scraping restricted social feeds.
5. Add verified referral tracking and a ledger only after a real partner revenue source is available.
6. Finish PWA testing, then package the same backend into an Android app if a free route is available.

## 7. Current status

- PWA shell work exists on a separate draft PR branch and is not live.
- This catalog migration is a separate proposed branch and is not applied to Supabase.
- No new paid service, storage, subscription, ad network, payment provider, or reward wallet has been activated.
- No earning amount or payout is promised.
