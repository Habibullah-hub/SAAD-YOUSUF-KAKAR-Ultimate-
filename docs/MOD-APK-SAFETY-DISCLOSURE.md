# SK Cyber Hub — MOD APK Safety Disclosure

**Status:** UI disclosure and acknowledgement gate added to the unified-resource-catalog draft branch. This is not a malware scanner and does not certify any APK as safe.

## What visitors see

The MOD APK directory now displays a prominent notice explaining that modified APKs are changed by third parties, can carry security/privacy risks, and are not automatically trusted.

Each MOD APK card's **View details** panel explains:
- What a MOD APK is.
- The purpose of the listed app, using the admin-entered description (or a clear “not enough verified information” fallback).
- Why Google Play Protect may warn and why users should not dismiss warnings or disable protection.
- Basic safer-use checks: prefer the official publisher, review source/version/permissions, use reputable scanning, avoid unrelated sensitive permissions, and never enter banking credentials/OTPs into untrusted modified apps.
- The current SK Cyber Hub status: third-party modified app, not independently verified unless separate evidence is displayed. No 100% safety guarantee is made.

The **Get** action for MOD APK listings is changed to **Read warning first**. It opens the details panel and requires the visitor to tick an acknowledgement before the existing external source link can open. This is an informed acknowledgement only; it is not a safety approval and does not bypass Android or Play Protect.

## Important limitations

- The current `sk_apps` records do not provide a verified malware-scan result, exact modification list, original publisher identity, or requested-permissions report. The interface must not invent those facts.
- The admin's description should state the app's real purpose and exactly which modifications are claimed by the source. If this information cannot be verified, say so.
- Do not automatically approve Modyolo or any other APK mirror. Keep unknown sources unverified until reviewed.
- Do not tell users to turn off Play Protect, sideload despite a harmful-app warning, grant Accessibility/SMS/device-admin permissions to make a MOD work, or bypass paid access/licensing.
- Prefer the original app on Google Play or the developer's official distribution channel.
- A clean antivirus scan is not a guarantee; a warning is not to be casually dismissed. Explain the specific evidence and uncertainty.

## Required next-stage data model

Before presenting per-file scan badges or claiming a source is reviewed, add reviewed fields to the resource catalogue, such as:
- `is_modified_app`
- `original_app_url`
- `publisher_name`
- `modifications_summary`
- `requested_permissions_summary`
- `security_scan_status` (`not_scanned`, `no_detection_reported`, `detection_reported`, `unknown`)
- `security_scan_url`
- `security_scan_checked_at`
- `safety_review_notes`
- `source_review_status`

Only an administrator may edit these fields. A scan result must include the scan provider and checked date; do not turn a scan result into a “safe” guarantee. Members must never be able to set their own trust or scan status.

## Acceptance tests

1. Normal app cards retain their existing behaviour.
2. Every card in the `All Apps Mod APK` category shows the safety information.
3. Clicking **Read warning first** opens the details panel but does not open the external URL.
4. The external URL opens only after the visitor checks the acknowledgement.
5. The acknowledgement wording clearly says the APK remains risky and is not certified safe.
6. No instruction suggests disabling Play Protect or bypassing Android security.
7. No unverified source is represented as approved or scanned.
8. The description is rendered with `textContent`, not injected as HTML.
9. The UI works on narrow mobile screens and keyboard focus reaches the acknowledgement checkbox.
10. This change is not considered deployed until the draft PR is merged and the site is tested.