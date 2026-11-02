# SK Cyber Hub — Supabase setup (اردو)

یہ ہدایات صرف **Saad Yousuf Kakar Ultimate / SK Cyber Hub** کے الگ Supabase پروجیکٹ کے لیے ہیں۔ پرانے **Yousuf Kakar Free Apps** پروجیکٹ یا اس کے `public.apps` / `public.profiles` ٹیبلز میں یہ SQL ہرگز نہ چلائیں۔

## شروع کرنے سے پہلے

- موجودہ SK Cyber Hub Supabase پروجیکٹ ہی استعمال کریں؛ نیا paid project بنانے کی ضرورت نہیں۔
- پہلے SQL فائلیں پڑھیں اور صحیح پروجیکٹ/URL کی تصدیق کریں۔
- کسی بھی migration کو چلانے سے پہلے backup/export رکھیں۔
- ویب سائٹ میں صرف Project URL اور anon/publishable public key استعمال کریں۔ `service_role` یا secret key کبھی browser، GitHub frontend، PWA یا Android app میں نہ رکھیں۔
- نیچے دی گئی SQL فائلیں خودکار طور پر نہیں چلیں۔ انہیں چلانے کے لیے مالک کی واضح منظوری ضروری ہے۔

## SQL چلانے کی درست ترتیب

Supabase کے SQL Editor میں ہر فائل الگ کھولیں، مکمل متن Paste کریں اور Run کریں۔ اگلی فائل سے پہلے کامیابی کی تصدیق کریں۔

1. **`SK-CYBER-HUB-SETUP.sql`** — بنیادی `sk_profiles`، `sk_apps`، Auth trigger، RLS اور Admin check۔
2. **`SK-CYBER-HUB-COMMUNITY.sql`** — پوسٹس، لائکس، تبصرے اور رپورٹس۔
3. **`SK-UNIFIED-RESOURCES.sql`** — نیا unified resource catalog اور admin-only import-source approvals۔
4. **`SK-MOD-APK-SAFETY-METADATA.sql`** — MOD APK کی معلوماتی safety fields اور الگ private admin notes۔ یہ پرانی draft notes کو محفوظ private table میں منتقل کرکے public column ہٹاتا ہے؛ اسی لیے پہلے backup ضروری ہے۔
5. **`SK-MEMBER-SUGGESTIONS.sql`** — ممبرز کی تجاویز اور Admin review queue۔

تمام migrations ایک ہی **SK Cyber Hub Supabase project** میں چلائیں۔ انہیں پرانے Yousuf Kakar Free Apps backend میں نہ چلائیں۔

## صرف مالک کو Admin بنانا

1. Supabase میں **Authentication → Users** کھولیں۔
2. مالک کا اپنا اکاؤنٹ بنائیں یا موجودہ اکاؤنٹ منتخب کریں۔
3. اسی اکاؤنٹ کا **User ID / UUID** کاپی کریں۔
4. SQL Editor میں نیچے والی کمانڈ میں placeholder کی جگہ UUID رکھ کر چلائیں:

```sql
UPDATE public.sk_profiles
SET role = 'admin'
WHERE id = 'PASTE-OWNER-USER-UUID-HERE';
```

5. نتیجے میں صرف ایک row update ہونی چاہیے۔ پھر تصدیق کریں:

```sql
SELECT id, email, role
FROM public.sk_profiles
WHERE role = 'admin';
```

بنیادی Setup میں ایک unique partial index ہے جو ایک وقت میں صرف **ایک Admin** کی اجازت دیتا ہے۔ نئے اکاؤنٹس خودکار طور پر `member` بنتے ہیں۔ Browser clients کو profiles پر INSERT/UPDATE/DELETE کی اجازت نہیں؛ عام ممبر خود کو Admin نہیں بنا سکتا۔ Admin role صرف ڈیٹابیس کے مالک کے SQL اختیار سے تبدیل کیا جا سکتا ہے۔

## ویب سائٹ کو Supabase سے جوڑنا

1. Supabase میں **Project Settings → API** کھولیں۔
2. Project URL اور anon/publishable public key کاپی کریں۔
3. SK Cyber Hub میں Admin/Settings کے Supabase حصے میں یہ دونوں values درج کریں۔
4. Save کریں اور Admin login آزمائیں۔

**کبھی بھی یہ چیزیں شیئر نہ کریں:** پاس ورڈ، service_role/secret key، recovery codes یا نجی API tokens۔

## اہم سکیورٹی حدود

- RLS ڈیٹابیس کی سطح پر لاگو ہے؛ صرف UI میں بٹن چھپانا سکیورٹی نہیں۔
- Private community posts کے likes/comments عام عوام کو نظر نہیں آنے چاہییں؛ Admin اور متعلقہ پوسٹ کا مالک ہی private پوسٹ سے متعلق ڈیٹا دیکھ سکتے ہیں۔
- Admin کی MOD APK review notes الگ private table میں محفوظ ہیں، public app record میں نہیں۔
- Scan status صرف درج شدہ معلومات ہے؛ اس کا مطلب APK کے محفوظ ہونے کی ضمانت نہیں۔
- Unified catalog ابھی schema foundation ہے؛ جب تک frontend integration اور حقیقی runtime tests مکمل نہ ہوں، اسے مکمل طور پر منسلک یا live نہ سمجھیں۔
- ویب سائٹ کا موجودہ importer اگر `sk_apps` استعمال کرتا ہے تو catalog migration اکیلے اسے `sk_resources` پر منتقل نہیں کرتی۔
- کوئی بھی external APK، software یا earning link شائع کرنے سے پہلے اصل publisher/source، HTTPS، terms، خطرات اور affiliate/sponsored disclosure چیک کریں۔

## خرچ اور فری سروسز

یہ migrations خود کوئی paid plan، Storage، اشتہار، payout یا subscription فعال نہیں کرتیں۔ Supabase/GitHub کے free plan کی اپنی limits ہیں؛ حد ختم ہونے پر upgrade یا payment prompt آئے تو ادائیگی سے پہلے رک جائیں۔ کوئی paid upgrade خودکار طور پر منظور نہیں ہے۔

## مسئلہ آئے تو

SQL error کا مکمل متن یا screenshot بھیجیں، لیکن password، secret key، service_role key یا UUID جیسی حساس معلومات عوامی طور پر شیئر نہ کریں۔ غلط project میں SQL چلانے کے بجائے فوراً رک جائیں۔
