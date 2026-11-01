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
- Community & User Accounts (planned; public registration is not enabled yet)
- Languages & Global Access
- World News search, language selection, speech input where supported, translated summaries, sharing and publisher links

## News experience
Every news result provides **Read full article** and **Open publisher website** links that open the original source in a new tab. News feed summaries are shown inside SK Cyber Hub; full publisher text is shown only when a feed supplies it and display is permitted. Publisher sites may restrict embedding or full-text reuse.

## Search, mobile and design
- Responsive mobile and desktop layout with a combined category browser and global search control.
- Search filters static directory cards and database-backed app listings.
- World News navigation accounts for the sticky header.
- Light, Microsoft Store-inspired visual style and global-platform SEO metadata.
- Crawler instructions, XML sitemap, About, Privacy and advertising/affiliate disclosure pages.

## Admin and database security
The site uses the isolated `public.sk_apps` and `public.sk_profiles` tables. It accepts only a public Supabase Publishable key (`sb_publishable_`) or legacy anon JWT key in the browser; never enter a `sb_secret_` / `service_role` key, database password or private secret. The connection test checks `sk_apps`; Admin login separately checks that the signed-in user's `sk_profiles.role` is `admin`.

The SQL setup creates the SK-specific Row Level Security policies and a trigger that creates new profiles as `member`. Browser clients have read-only access to `sk_profiles`; neither members nor an Admin session can change account roles through the website. The owner must manually promote only their own Auth user UUID to `admin` using the final SQL statement in `supabase/SK-CYBER-HUB-SETUP.sql`. Verify that exactly one owner row is updated. Do not promote other accounts. Role changes after setup must also be performed by the owner in the Supabase SQL Editor.

Public account registration/community features remain disabled until the owner-only Admin setup and live security checks are complete. No Storage bucket is required for the current external-icon listing design.

Browser configuration is local to the device and browser. Setting it on one phone does not automatically configure another. Do not reuse credentials from the separate Yousuf Kakar Free Apps project.

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

## Development status
The website is being improved incrementally. A successful GitHub commit does not by itself confirm that GitHub Pages has finished deploying or that every third-party service is available. Test the live site on both mobile and desktop after deployment.
