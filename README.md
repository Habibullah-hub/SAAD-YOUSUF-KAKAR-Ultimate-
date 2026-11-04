# Saad Yousuf Kakar Ultimate — SK Cyber Hub

A zero-budget digital super-platform for Pakistan, Saudi Arabia, Urdu-speaking communities and a wider global audience.

## Live website
https://habibullah-hub.github.io/SAAD-YOUSUF-KAKAR-Ultimate-/

## Project identity
This is the separate **Saad Yousuf Kakar Ultimate / SK Cyber Hub** project. It is not the older Yousuf Kakar Free Apps website or its Supabase project. Keep repositories, databases, credentials and storage separate.

## Current platform sections
- Apps and All Apps Mod APK
- AI Tools Directory and Smart Free Finder for free AI video tools
- Software and Free Online Tools
- Documents & Learning and Games
- Video & Audio, Images & Design, Developer Tools, Security & Privacy
- Creator Studio, Global Search, Jobs & Opportunities, Deals & Freebies
- SK Pulse Community: member profiles, public/followers posts, photo sharing, likes, comments, follows, saved posts and abuse reports (activate the optional SQL extension)
- Languages & Global Access
- World News search, language selection, speech input where supported, translated summaries, sharing and publisher links

## News experience
Every news result provides **Read full article** and **Open publisher website** links that open the original source in a new tab. News feed summaries are shown inside SK Cyber Hub; full publisher text is shown only when a feed supplies it and display is permitted. Publisher sites may restrict embedding or full-text reuse.

## Search, mobile and design
- Responsive mobile and desktop layout with a combined category browser and global search control.
- Search filters static directory cards and database-backed app listings.
- World News navigation accounts for the sticky header.
- Installable Progressive Web App (PWA) with an app manifest, home-screen icon, service-worker app shell, offline home fallback and safe update notice. On Android, open the site in Chrome and choose **Install app** or **Add to Home screen** from the browser menu when offered.
- Website and installed PWA use the same Supabase project and accounts; the app is not a separate database.
- Light, Microsoft Store-inspired visual style and global-platform SEO metadata.
- Crawler instructions, XML sitemap, About, Privacy and advertising/affiliate disclosure pages.

## Admin and database security
The site uses the isolated `public.sk_apps` and `public.sk_profiles` tables. It accepts only a public Supabase Publishable key (`sb_publishable_`) or legacy anon JWT key in the browser; never enter a `sb_secret_` / `service_role` key, database password or private secret. The connection test checks `sk_apps`; Admin login separately checks that the signed-in user's `sk_profiles.role` is `admin`.

The SQL setup creates the SK-specific Row Level Security policies and a trigger that creates new profiles as `member`. Browser clients have read-only access to `sk_profiles`; neither members nor an Admin session can change account roles through the website. The owner must manually promote only their own Auth user UUID to `admin` using the final SQL statement in `supabase/SK-CYBER-HUB-SETUP.sql`. Verify that exactly one owner row is updated. Do not promote other accounts. Role changes after setup must also be performed by the owner in the Supabase SQL Editor.

Public member registration and login are enabled in the website. New accounts are assigned `member` by the database trigger. To activate the complete SK Pulse community, run these migrations in order after the base setup: `supabase/SK-CYBER-HUB-COMMUNITY.sql`, `supabase/SK-COMMUNITY-SOCIAL-SETUP.sql`, then `supabase/SK-SOCIAL-ENGAGEMENT-EXTRAS.sql`. The second migration upgrades the original tables, adds member profiles, followers, saved posts, moderation rules and a private `sk-community-media` bucket. The third adds real in-app notifications (new followers, likes, comments and posts from followed creators) and daily activity streak counters. Each member can upload only into their own UID folder; images are delivered through signed URLs only to viewers allowed to see the related post. Admins can remove community posts, while members can remove their own posts. The social experience includes a personalized For You feed, Following/Latest/Saved filters, progressively loaded posts, topic buzz from real hashtags, red unread-notification badges, optional photo color filters, and a local hide-like-count preference. Version 2 accepts JPEG/PNG/WebP photos up to 8 MB and uses external video links rather than hosting video files. Images are compressed in supported browsers and uploaded with long-lived cache headers. Supabase Free storage and bandwidth are shared project quotas; monitor usage and do not upgrade or add billing without explicit owner approval. Browser/service-worker cache is device-local; authenticated feed/API responses are not placed in the shared offline shell cache.

Browser configuration is local to the device and browser. Setting it on one phone does not automatically configure another. Do not reuse credentials from the separate Yousuf Kakar Free Apps project.

## SK Pulse engagement rules
- The community feed supports For You, Latest, Following and Saved views, progressive loading with a visible manual fallback, and topic Buzz based on real hashtags in loaded posts.
- For You ranking is a lightweight on-device page ranking based on freshness, genuine likes/comments and followed creators; it is not an AI recommendation model and does not claim to know private interests.
- Red notification counts are based only on actual unread follow, like, comment and followed-creator post events. Opening the panel does not silently mark every alert read; a member marks an alert read by selecting it.
- A streak counts a genuine post, like or comment once per UTC calendar day. No paid restore, punishment, fake loss warning or guaranteed reward is used.
- Like and follower counts are genuine database counts. Members can hide both on their own device.
- Photo filters (Original, Vivid, Warm, Cool, Mono, Vintage) are applied locally to a chosen or camera-captured photo before upload. This is not a live augmented-reality face-lens camera. The selected image is not uploaded until the member presses Publish.
- Anticipation messages describe real loading and available content only. Artificial scarcity, fake countdowns, fabricated likes/followers, fake online users and deceptive red alerts are prohibited. Limited-time notices must refer to a real published deadline.
- Social Extras require running `supabase/SK-SOCIAL-ENGAGEMENT-EXTRAS.sql` after the base, community and private-media migrations. A file in GitHub is not the same as an applied live database migration.

## Smart Free Finder policy
The AI video finder records free-use limits, account/card requirements, resolution, duration and watermark information from official provider pages. Free allowances change, may be shared or restricted, and are not unlimited. Users should re-check provider terms before generating. Never pay for credits or subscriptions unless you independently choose to do so.

## Responsible publishing and monetization
- Prefer official publishers and authorized download sources; validate every external URL.
- Clearly identify external destinations, advertisements, sponsorships and affiliate links.
- Respect copyright, trademarks, software licences, privacy and provider terms.
- Never disguise advertisements as download buttons or use misleading countdowns.
- Advertising, affiliate tracking, sponsorships and premium features require separate provider approval and configuration. They are not activated by this repository alone.
- Earnings, traffic and unlimited free usage are not guaranteed.

## Zero-cost rule
Development and launch should use free tools and free tiers wherever possible. Do not enable a paid plan, service, domain, ad spend or purchase without the owner's explicit approval. Free services have limits and may change.

## Native SK Platforms
SK Cyber Hub is moving from a third-party app link directory toward native SK services. The current in-site workspace includes:
- SK AI Studio: local prompt workspace and templates; live AI inference is not connected yet.
- SK Mail: private member-to-member messaging after the separate Supabase migration; not public email/SMTP.
- SK Browser: internal search across SK Hub resources; not a full standalone web browser.
- SK Media Center: local device audio/video playback; no upload or cloud storage in this version.

See [the native platform deployment guide](supabase/SK-FREE-FIRST-DEPLOYMENT-GUIDE.md) and [the product blueprint](docs/SK-DIGITAL-WORKBENCH-PRODUCT-BLUEPRINT.md). No paid API, subscription, storage bucket or billing is enabled.

## Development status
Member signup uses Supabase Auth and the existing profile trigger; if email confirmation is enabled in Supabase, new users must confirm their email before logging in. The browser verifies that member accounts have the `member` role and never offers role promotion.\n\nThe website is being improved incrementally. A successful GitHub commit does not by itself confirm that GitHub Pages has finished deploying or that every third-party service is available. Test the live site on both mobile and desktop after deployment.
\n\n## SK Pulse social database activation\n1. Run `supabase/SK-CYBER-HUB-SETUP.sql` if the base SK database is not already installed.\n2. Run `supabase/SK-COMMUNITY-SOCIAL-SETUP.sql` in the same separate SK Supabase project.\n3. Refresh the website and sign in as a normal member. Public posts, follows, likes, comments, saved posts and reports are then connected to the shared SK backend.\n4. Do not enable a paid plan or billing. Keep uploads small and monitor storage/egress quotas.\n5. Public photos are visible to anyone; user folders isolate upload/delete permissions, not public viewing. Video-file uploads and creator payouts are not part of v1.\n