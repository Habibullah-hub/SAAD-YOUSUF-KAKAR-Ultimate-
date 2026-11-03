# SK Cyber Hub Android browser shell

This is the first native Android WebView shell for SK Cyber Hub. Unlike the installable PWA, it keeps the SK-branded address/search bar and bottom navigation visible while HTTPS pages (including Google Search results) load inside the app.

## Build

Open the `android/` folder in Android Studio and let Gradle sync. Build a debug APK for device testing before any release build. The app requires Android SDK 35 and Android Gradle Plugin 8.7.3. No signing key or release AAB is included.

## Important boundaries

- This is an initial source scaffold; it has not yet been built, signed, device-tested, or submitted to Google Play.
- Web pages can still show their own content and branding; SK's browser controls remain in the app shell.
- Third-party Android apps cannot be embedded or installed inside this app as sub-apps. They are installed separately through Google Play. SK's own HTML5 mini-games can run inside the app and can be cached for offline use.
- Before public release, add a proper privacy policy, safe browsing controls, download handling, navigation testing, account/session integration, accessibility review, and Play policy review.
