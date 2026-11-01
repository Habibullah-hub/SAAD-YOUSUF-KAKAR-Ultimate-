# Saad Yousuf Kakar Ultimate — SK Cyber Hub

A zero-budget digital discovery platform for Pakistan, Saudi Arabia, Urdu-speaking communities and a wider global audience.

## Live website
https://habibullah-hub.github.io/SAAD-YOUSUF-KAKAR-Ultimate-/

## Project identity
This is the separate **Saad Yousuf Kakar Ultimate / SK Cyber Hub** project. It is not the older Yousuf Kakar Free Apps website or its Supabase project. Keep repositories, databases, credentials and storage separate.

## Current platform
- Responsive directory for apps, AI tools, free online tools, software, documents and learning, games, video/audio, images/design, developer tools, security/privacy and world news.
- One combined category browser and global search control; avoid duplicate navigation rows.
- World News search with language selection, speech input where supported, translated summaries, share options and publisher links.
- Each news result provides **Read full article** and **Open publisher website** links that open the original source in a new tab. Feed summaries are shown in the site; complete publisher text is only shown when a feed supplies it and display is permitted.
- Admin dashboard with Supabase Auth role verification, app listing management and bulk CSV/Excel import.
- The temporary “Add & Test a Resource” utility is inside the admin-only dashboard, not the public directory.
- About, privacy and advertising/affiliate disclosure pages, crawler instructions and XML sitemap.

## Admin and database security
The site uses the configured Supabase project URL and public anon/publishable key in the browser. Never enter a service-role key, database password or private secret in the website. The front end checks that the signed-in user's `profiles.role` is `admin`, but this is not a substitute for database security. The current SK Cyber Hub Supabase project's Row Level Security policies, profile-role protections and Storage policies must be independently verified. Public users must never be able to grant themselves admin access or write/delete listings.

Browser configuration is local to the device and browser. Setting it on one phone does not automatically configure another. Do not reuse credentials from the separate Yousuf Kakar Free Apps project.

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
