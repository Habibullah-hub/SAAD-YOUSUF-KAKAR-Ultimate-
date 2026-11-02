# SK Cyber Hub — MOD APK information

**Current product decision:** the owner-supplied external link remains clickable. SK Cyber Hub does not add a mandatory warning checkbox, acknowledgement gate, or automatic download block based only on scan status.

## Visitor experience
- A MOD APK listing may show an honest informational note that it is a third-party modified package and has not been independently verified.
- The Get / Open action continues to open the exact HTTP(S) URL entered by the owner.
- No scan status is a guarantee that a file is safe, and no warning should tell visitors to disable Android or Play Protect protections.
- Normal apps and MOD APK listings use the same direct external-link behavior.

## Admin metadata
The optional metadata columns in `SK-MOD-APK-SAFETY-METADATA.sql` can record the original app URL, publisher, claimed modifications, permissions summary, scan provider, scan URL, scan date and admin notes. These fields are informational; they must not silently rewrite, hide or block the supplied link.

## Limits
- The one-click importer creates a domain-based title, favicon URL and short basic description. It does not scrape or verify the full webpage.
- Do not invent publisher identity, modification details, scan results or claims of being virus-free.
- The user must be able to see where the external link leads. SK Cyber Hub does not host or proxy the APK.
- This change is not live until the draft pull request is reviewed, merged and deployed.
