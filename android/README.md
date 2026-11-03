# SK Cyber Hub — Native Android WebView app

The Android app is a native SK-branded browser shell. It uses Android WebView to display the SK Cyber Hub home page and HTTPS websites inside the app, keeping the SK address bar and bottom navigation visible.

## Implemented in the Android source

- Native SK header, address/search field and browser navigation controls.
- Google global search and live query suggestions while typing. The address hint discloses that live suggestions use Google.
- HTTPS websites and Google results remain inside the WebView; HTTP page links are upgraded to HTTPS.
- Visible loading/progress feedback, refresh, back, forward and home.
- On-device browsing history with Clear all history. Clearing history returns to the SK home origin to remove the SK saved-search key as well as the native history.
- Native Downloads screen backed by Android DownloadManager. Completed downloads can be opened from the list.
- Web upload file chooser, opened only after a website requests a file and the user selects one.
- Safe WebView settings: Safe Browsing where supported, mixed content blocked, local file/content access disabled, third-party cookies disabled, invalid TLS certificates cancelled and cleartext traffic disabled at app level.
- App launcher icon and branded dark Android theme.
- Android 9 and older: storage permission is requested only when a user starts a public Downloads-folder download. Newer Android versions use the system DownloadManager without that legacy permission.

## Build and test

The GitHub Actions workflow builds a **debug APK** from this folder. Debug APKs are for device testing, not Google Play production releases. Open the `android/` folder in Android Studio with Java 17, Android SDK 35 and Gradle 8.9, or run:

```bash
gradle -p android assembleDebug
```

## Not yet Google Play ready

A successful CI build confirms compilation, not complete product certification. Before Play submission, the app still needs hands-on tests on supported Android devices (including this project's target Honor device), a release signing key held securely by the owner, a signed release Android App Bundle (AAB), final privacy/data-safety declarations, verified support/contact details, account/OAuth flow review, accessibility and download tests, crash/performance review, store listing assets, and Google Play policy review. Never publish a debug APK as the production app.

No paid service or API key is required by this browser shell. Typed partial queries are sent to Google's suggestion endpoint; submitted queries go to Google. Website requests and user-selected uploads are sent to the chosen websites. Downloaded files are saved through Android DownloadManager. These data flows are described in the site's privacy policy.

The native shell does not bypass website security controls. Some providers block OAuth sign-in inside WebViews; such sign-in may require a compliant external-browser redirect flow before release. Third-party Android apps cannot be bundled as sub-apps without publisher rights and integration support. SK's own HTML5 mini-games can run inside the app and be cached for offline use after first load.
