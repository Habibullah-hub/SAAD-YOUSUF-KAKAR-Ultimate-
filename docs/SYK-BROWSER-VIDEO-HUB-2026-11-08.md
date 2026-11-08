# SYK Browser Video Hub — implementation notes (8 November 2026)

## Included in this branch
- Creator/video feed is placed on `browser.html`, the SYK Browser home view.
- The old duplicate Creator Hub section on the main `index.html` is hidden; the primary browser web-search field remains because it is the browser's main function.
- Members can submit only one direct public video URL from YouTube, TikTok or Facebook. The form has no channel/page submission option.
- Member submissions remain pending until the Owner Admin approves or rejects them. The admin queue has editable default approval and rejection messages; the selected message is stored in `review_message`.
- Owner Admin can publish a video, image URL, or channel link from the Browser page. Images are currently added by a public HTTPS image URL, not by uploading a file to Supabase Storage.
- Approved videos and owner-published media appear in the Browser feed. Video and image cards open in a popup. The fullscreen action requests landscape orientation where the browser/device permits it; orientation locking is not guaranteed on every Android browser or installed PWA.
- Service worker cache advanced to v16 and includes the new Browser video hub assets. Static checks cover the new assets and page controls.

## Required database step
Run `supabase/SK-BROWSER-VIDEO-HUB.sql` once in the existing SK Cyber Hub Supabase project. It creates `sk_creator_admin_media`, enables RLS, allows public reads only for published rows, and allows inserts/updates/deletes only to the existing Admin role with owner_id matching auth.uid(). The member video queue continues to use the already-installed `sk_creator_submissions` table and its video-only insert policy.

## Manual verification still required
- Sign in as a normal member and submit one direct video URL; confirm it is pending and not public.
- Sign in as Owner Admin; preview, approve and reject requests; confirm the member can see the saved review message.
- Publish an owner video, image URL, and channel link; confirm each renders as expected.
- Test popup close, fullscreen and landscape behavior on Android Chrome and the installed PWA.
- Some third-party videos disable embedding; the original platform may need to be opened instead.

## Live and calls
This branch does not claim to fix SK Live or Messenger calls. SK Live depends on a deployed `sk-live-token` Edge Function and configured LiveKit project. Messenger calls currently use peer-to-peer WebRTC with a public STUN server and no TURN relay configured; restrictive mobile/carrier networks may prevent media connection. These services need their own live diagnostics and configuration before they can be marked working.
