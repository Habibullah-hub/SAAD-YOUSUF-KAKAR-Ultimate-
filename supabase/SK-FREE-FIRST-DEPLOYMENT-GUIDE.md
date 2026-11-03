# SK Cyber Hub — Free-first Creator, Messenger & Live setup

This repository contains the browser UI and SQL foundations. Saving these files to GitHub does **not** activate the database, deploy the Edge Function, approve an ad account, or create a payment account.

## Required database migration order

Run these scripts in the **SK Cyber Hub Supabase project only**, in this order:

1. `supabase/SK-CYBER-HUB-SETUP.sql`
2. `supabase/SK-CYBER-HUB-COMMUNITY.sql`
3. `supabase/SK-COMMUNITY-SOCIAL-SETUP.sql`
4. `supabase/SK-MESSENGER-CALLS-FOUNDATION.sql`
5. `supabase/SK-LIVE-ROOMS-FOUNDATION.sql`
6. `supabase/SK-CREATOR-MONETIZATION-FOUNDATION.sql`

Do not run the community extension before the base setup. Do not paste a Supabase service-role key into the website or any browser code.

## Messenger and calls

- Messages are stored in Supabase and protected by conversation-participant RLS policies.
- This version is **not end-to-end encrypted**. Do not use it for sensitive/private secrets.
- One-to-one calls use browser WebRTC and a public STUN server. No TURN relay is configured; some mobile carriers, corporate networks or strict NATs may prevent calls from connecting.
- Camera/microphone permissions are requested only after the user taps a call button.
- Screen sharing depends on browser support. Mobile browser screen capture is not guaranteed.
- Call media is not uploaded to the SK Storage bucket. No call recording is enabled.

## SK Live — LiveKit Cloud Build (free) pilot

The source for the token endpoint is `supabase/functions/sk-live-token/index.ts`.

1. Create a LiveKit Cloud project on the **Build (free)** plan.
2. Do not add a payment method or upgrade. If the dashboard asks you to choose a paid plan or enter billing details, stop.
3. From LiveKit project settings, copy the WebSocket server URL, API key and API secret.
4. In Supabase Dashboard → Edge Functions → Secrets, add:
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
5. Deploy an Edge Function named `sk-live-token` using the repository source file. Supabase provides `SUPABASE_URL` and `SUPABASE_ANON_KEY` to Edge Functions.
6. Run the SQL migrations above. Sign in to SK Cyber Hub and test with two member accounts.

LiveKit's free Build plan has hard monthly quotas. Current documentation lists 5,000 WebRTC participant minutes, 50 GB downstream data transfer and 100 participants per project; when a hard cap is reached, new operations fail until the quota resets. Quotas can change, so check the LiveKit dashboard before testing. Never switch to a paid plan without the owner's explicit approval.

Live video is transported by LiveKit Cloud; it is not stored in the SK Supabase photo bucket. The LiveKit provider processes the media stream to deliver it to viewers. No recording or replay is enabled in this version.

## Creator monetization

- The creator application is free and collects only a creator category, country, optional public portfolio URL and originality acknowledgement.
- No payout account, bank details, wallet or payment integration is collected.
- The ledger accepts records only from the SK owner/admin. Record only money actually confirmed by an advertiser, affiliate partner, sponsor or payment provider.
- A creator application, view, like, follow, ad impression or click does not itself create earnings.
- AdSense or any other ad network is **not connected**. Apply only after the site has sufficient original content and meets the network's policies. Do not incentivize ad clicks or impressions.
- The website remains free to browse. No visitor bandwidth, device, mobile data or browser is secretly rented, resold or used as a proxy.

## No-cost and security rules

- No paid storage, video recording, TURN relay, billing plan or automatic upgrade is enabled by this repository.
- Supabase project storage and egress quotas are shared by the project; UID folders enforce per-member access but are not separate unlimited storage accounts.
- Public community photos are public. Members must not upload sensitive/private images.
- If a free quota is reached, the feature should pause or fail safely rather than trigger a paid upgrade.
