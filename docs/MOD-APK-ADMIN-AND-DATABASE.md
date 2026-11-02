# MOD APK metadata and Admin workflow

## Owner Admin form
When the owner selects **All Apps Mod APK** in the existing Add/Edit App modal, optional metadata may be recorded:
- Original app / developer URL
- Original publisher/developer name
- Claimed modifications summary
- Requested Android permissions summary
- Scan status: not scanned, unknown/inconclusive, no detection reported, or detection reported
- Scan provider, report URL, and checked date
- Admin review notes

These fields are informational, not a scanner. The owner must enter only information supported by a real source/report. Unknown values should remain blank or be described as unknown. A “no detection reported” result is not a safety guarantee.

## Visitor behavior
- The owner-entered external URL remains clickable and opens directly.
- There is no mandatory warning acknowledgement checkbox or warning gate.
- Scan status does not automatically hide, rewrite, or disable the download/open link.
- If appropriate, the page may show a concise informational note that a modified app is third-party software and is not independently verified.
- Never advise users to disable Play Protect or bypass a harmful-app warning.

## Database migration
Run `supabase/SK-MOD-APK-SAFETY-METADATA.sql` in the SK Cyber Hub Supabase SQL Editor only after reviewing it. It adds columns to the existing `public.sk_apps` table. Existing RLS remains in control; only the existing Admin role should manage these fields.

**Important:** Until this migration has been run successfully, the optional metadata fields cannot be saved. The website code and SQL file in this draft PR do not apply themselves to Supabase.

## Operational rules
- Never invent the original publisher, MOD changes, permissions, scan provider, scan date, or report.
- Never mark a file safe based only on a clean scan.
- Make the destination clear to visitors; SK Cyber Hub does not host or proxy the APK.
- Prefer official developer distribution when it is available, but do not automatically block an owner-entered external link.
