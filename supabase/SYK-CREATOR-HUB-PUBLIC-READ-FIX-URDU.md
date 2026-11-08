# SYK Creator Hub — محفوظ ڈیٹابیس درستگی (اردو)

یہ فائل Creator Hub کی Public Read پالیسیوں کی خرابی درست کرنے کے لیے ہے۔ اس سے عام وزیٹر صرف منظور شدہ ویڈیوز دیکھ سکتا ہے، جبکہ Owner Admin کی منظوری اور انتظامی اختیارات صرف لاگ اِن شدہ موجودہ Admin کے پاس رہتے ہیں۔

## Supabase میں کیا کرنا ہے

1. صرف اپنے موجودہ **SK Cyber Hub** Supabase پروجیکٹ میں جائیں۔
2. پہلے Database کا دستیاب Backup/Export محفوظ کریں۔
3. Supabase → SQL Editor → New query کھولیں۔
4. اس ریپوزٹری کی فائل `supabase/SYK-CREATOR-HUB-PUBLIC-READ-FIX.sql` کھول کر مکمل SQL نقل کریں۔
5. SQL Editor میں Paste کرکے Run کریں۔
6. اگر نتیجہ Error دے تو مزید SQL نہ چلائیں؛ مکمل Error کا Screenshot محفوظ کریں۔

## یہ SQL کیا بدلتا ہے؟

- بغیر Login وزیٹر کے لیے صرف `approved` ویڈیوز اور `published` Owner ویڈیوز پڑھنے کی اجازت۔
- Login ممبر اپنی درخواستیں اور منظور شدہ ویڈیوز دیکھ سکتا ہے۔
- موجودہ Owner Admin تمام Creator submissions دیکھ اور منظور/مسترد کر سکتا ہے۔
- `sk_is_admin()` صرف authenticated لاگ اِن صارفین کے لیے دستیاب رہتا ہے؛ anon کو Admin function چلانے کی اجازت نہیں دی جاتی۔
- `sk_profiles`، موجودہ اکاؤنٹس، Admin رول، ویڈیو ریکارڈز اور Storage فائلیں اس migration میں تبدیل یا حذف نہیں ہوتیں۔

## ٹیسٹ

- پہلے Logout حالت میں `browser.html` کھولیں: صرف منظور شدہ/شائع شدہ ویڈیوز نظر آنی چاہئیں۔
- پھر موجودہ Owner Admin اکاؤنٹ سے Main Hub میں Login کریں، پھر SYK Browser کھولیں: Admin بٹن اور ویڈیو Review Queue ظاہر ہونی چاہیے۔
- ایک عام Member اکاؤنٹ سے Login کریں: Admin بٹن/پینل ظاہر نہیں ہونا چاہیے؛ صرف اپنی درخواستیں اور منظور شدہ ویڈیوز نظر آئیں۔

## مقبول / ٹرینڈنگ ویڈیوز

SYK کے اندر ممبرز کی ویڈیوز Admin approval کے بعد ہی دکھائی جاتی ہیں۔ YouTube کی عالمی Trending فہرست کے لیے YouTube کی اپنی live search کھولی جاتی ہے؛ اس کے لیے کوئی غیر موجود API یا جعلی ویڈیو/ویوز استعمال نہیں کیے جاتے۔ SYK کے اندر ممبر ویڈیو کو Owner Admin دستی طور پر مقبول/ٹرینڈنگ نشان لگا سکتا ہے۔

## Play Store کے بارے میں

یہ اپ ڈیٹ ویب/PWA کو بہتر کرتی ہے؛ یہ بذاتِ خود Google Play Store پر شائع شدہ Android App نہیں بناتی۔ Play Console اکاؤنٹ، signed Android App Bundle (AAB)، privacy/data-safety declaration، store listing اور Android device testing الگ مراحل ہیں۔ Google Play developer registration کی فیس لاگو ہو سکتی ہے؛ کسی ادائیگی سے پہلے مالک کی منظوری ضروری ہے۔
