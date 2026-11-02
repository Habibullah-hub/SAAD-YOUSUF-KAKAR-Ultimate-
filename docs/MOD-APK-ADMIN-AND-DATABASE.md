# MOD APK safety metadata and Admin workflow

## Owner Admin form
When the owner selects **All Apps Mod APK** in the existing Add/Edit App modal, the form reveals a dedicated safety-review section. It stores:
- Original app / developer URL
- Original publisher/developer name
- Claimed modifications summary
- Requested Android permissions summary
- Scan status: not scanned, unknown/inconclusive, no detection reported, or detection reported
- Scan provider, report URL, and checked date
- Admin safety review notes

These fields are not a scanner. The owner must enter only information supported by a real source/report. Unknown values should remain blank or be described as unknown. A “no detection reported” result is not a safety guarantee.

## Visitor details
The MOD APK detail panel displays available per-listing metadata and a scan report link only when provided. If a listing has `detection_reported`, its download action is withheld and the details show a prominent warning. Otherwise, the normal warning and acknowledgement gate still apply.

## Database migration
Run `supabase/SK-MOD-APK-SAFETY-METADATA.sql` in the SK Cyber Hub Supabase SQL Editor only after reviewing it. It adds columns to the existing `public.sk_apps` table and adds validation constraints. It does not create storage or modify the old project's tables. Existing RLS remains in control; only the existing Admin role should manage these fields.

**Important:** Until this migration has been run successfully, the new Admin form cannot save the additional safety fields. The website code and SQL file in this draft PR do not apply themselves to Supabase.

## Operational rules
- Never invent the original publisher, MOD changes, permissions, scan provider, scan date, or report.
- Never mark a file safe based only on a clean scan.
- Never advise users to disable Play Protect or bypass a harmful-app warning.
- A reported detection means do not distribute; the website withholds the download action.
- Prefer the original Google Play listing or developer distribution page.
