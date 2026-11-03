# SK Cyber Hub Android browser

This Android app is the native browser shell for SK Cyber Hub. It keeps SK's address/search field and browser controls visible while HTTPS websites, including Google Search results, load inside the app's WebView.

## Current native browser features

- Global Google search from the address field; HTTPS pages stay inside the SK WebView.
- Live Google query suggestions while typing (the partial query is sent to Google's suggestion service).
- Native page-loading progress feedback.
- Back, forward, home, refresh, history and downloads controls.
- Browsing history stored on the device; Clear all history removes the native list, WebView navigation history and SK's local search-history key.
- Web downloads are handed to Android DownloadManager and saved to the device's Downloads folder.
- Safe WebView defaults: HTTPS preferred, mixed content blocked, local file/content access disabled, Safe Browsing enabled where supported.

## Build and test

Open the `android/` folder in Android Studio, install Android SDK 35 and use Java 17 / Gradle 8.9. You can also run:

```bash
gradle -p android assembleDebug
```

A GitHub Actions workflow builds a **debug APK** and stores it as a short-lived test artifact. A debug APK is for testing only; it is not a Play Store release.

## Important release checklist

This project is not yet Google Play ready. Before release it still needs a successful build and real-device testing, a release signing key, a signed Android App Bundle (AAB), a verified privacy policy and data-safety disclosures, account/session integration, accessibility and navigation review, download edge-case testing, app icon/splash assets, and Play policy review. Never publish a debug build as a production release.

No paid service or API key is required by the current browser shell. Google autocomplete sends typed partial search text to Google; normal Google searches also go to Google. The app uses Android's system DownloadManager for file downloads. Review and disclose these data flows in the privacy policy before any public release.

Third-party Android apps cannot be bundled as sub-apps without their publisher's rights and source/integration support. SK's own HTML5 mini-games can run inside the app and can be cached for offline use after first load.
