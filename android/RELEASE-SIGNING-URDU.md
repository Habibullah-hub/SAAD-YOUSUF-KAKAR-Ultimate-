# SK Cyber Hub — Android Release Signing (Urdu)

## موجودہ APK کی حقیقت

- پرانا خودکار `publish-beta-apk.yml` workflow ہٹا دیا گیا ہے کیونکہ ہر build کی debug signing key بدل سکتی تھی۔ اب debug APK صرف GitHub Actions کے عارضی artifact کے طور پر دستیاب ہے (14 دن)، public production release نہیں۔
- اسے Production APK یا Google Play release نہ سمجھیں۔
- Production updates کے لیے ایک مستقل Release Keystore ضروری ہے۔ ہر release میں وہی key استعمال ہونی چاہیے۔
- Debug-signed APK کو نئی release key سے براہِ راست update نہیں کیا جا سکتا۔ پہلی signed release انسٹال کرتے وقت پرانی beta app uninstall کرنا پڑ سکتی ہے؛ اس سے اس فون پر موجود app data ضائع ہو سکتا ہے۔

## یہ کام ابھی خودکار کیوں نہیں ہو سکتا؟

Keystore آپ کی اصل ملکیت اور راز ہے۔ اسے GitHub repository، ChatGPT، کسی public issue یا عام chat میں upload نہ کریں۔ میں نے Gradle میں optional signing configuration اور manual release workflow تیار کیا ہے، مگر آپ کے secrets کے بغیر signed APK بنانا ممکن نہیں۔

## مفت طریقہ

1. کسی کمپیوٹر پر مفت OpenJDK/JDK کا `keytool` استعمال کرکے ایک بار Release Keystore بنائیں:
   ```bash
   keytool -genkeypair -v -keystore sk-cyber-hub-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias skhub-release
   ```
2. Keystore کی کم از کم دو محفوظ offline backups رکھیں۔ Password اور alias بھی محفوظ جگہ لکھیں۔ Keystore کھو جائے تو اسی app کی آئندہ signed updates مشکل یا ناممکن ہو سکتی ہیں۔
3. Keystore کو Base64 میں تبدیل کریں۔ Linux/macOS:
   ```bash
   base64 -w 0 sk-cyber-hub-release.jks
   ```
   Windows PowerShell:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("sk-cyber-hub-release.jks"))
   ```
4. GitHub Repository → Settings → Secrets and variables → Actions → New repository secret میں یہ چار secrets بنائیں:
   - `SK_RELEASE_KEYSTORE_BASE64` — Keystore کا Base64 متن
   - `SK_RELEASE_STORE_PASSWORD` — Keystore password
   - `SK_RELEASE_KEY_ALIAS` — مثال کے طور پر `skhub-release`
   - `SK_RELEASE_KEY_PASSWORD` — key password
5. GitHub → Actions → **Build signed SK Android release** → Run workflow چلائیں۔
6. کامیابی پر `sk-cyber-hub-signed-release` artifact میں APK ملے گا۔ اسے install کرنے سے پہلے verify کریں۔

## ضروری احتیاط

- Keystore یا passwords کو GitHub code، repository files، README، APK یا chat میں کبھی نہ ڈالیں۔
- Secret نہ ہونے پر workflow جان بوجھ کر fail ہوگا؛ وہ debug key کو Production signing کے طور پر استعمال نہیں کرے گا۔
- Debug build صرف testing artifact ہے؛ اسے مستقل update یا public release نہ سمجھیں۔
- اس عمل کے لیے کوئی paid signing service درکار نہیں؛ JDK، Android build tools اور GitHub Actions استعمال ہوتے ہیں۔
