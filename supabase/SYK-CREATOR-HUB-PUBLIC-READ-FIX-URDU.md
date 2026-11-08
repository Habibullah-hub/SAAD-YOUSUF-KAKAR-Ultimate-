# SYK Creator Hub — محفوظ ڈیٹابیس درستگی (اردو)

1. صرف موجودہ SK Cyber Hub Supabase پروجیکٹ کھولیں۔
2. پہلے دستیاب Database Backup/Export محفوظ کریں۔
3. Supabase → SQL Editor → New query کھولیں۔
4. `supabase/SYK-CREATOR-HUB-PUBLIC-READ-FIX.sql` کی مکمل عبارت Paste کرکے Run کریں۔
5. Error آئے تو مزید SQL نہ چلائیں؛ مکمل Error کا Screenshot محفوظ کریں۔

یہ SQL صرف Creator Hub کی RLS پالیسیوں کو درست کرتا ہے۔ عوام صرف منظور شدہ ممبر ویڈیوز اور شائع شدہ Owner ویڈیوز پڑھ سکیں گے۔ ممبر اپنی درخواستیں دیکھ سکے گا۔ موجودہ Owner Admin لاگ اِن کے بعد تمام درخواستیں، منظوری اور ٹرینڈنگ کنٹرول استعمال کر سکے گا۔ `sk_is_admin()` کو anon سے execute کرنے کی اجازت نہیں دی جاتی۔

یہ migration `sk_profiles`، موجودہ اکاؤنٹس، Admin رول، ویڈیو ریکارڈز یا Storage فائلیں تبدیل یا حذف نہیں کرتی۔

## ٹیسٹ
- Logout حالت میں Browser کھولیں: صرف منظور شدہ/شائع شدہ ویڈیوز نظر آئیں۔
- موجودہ Owner Admin سے Main Hub میں Login کریں، پھر SYK Browser کھولیں: Admin shortcut اور Review Queue نظر آئیں۔
- عام Member سے Login کریں: Admin پینل نہ آئے؛ صرف اپنی درخواستیں اور منظور شدہ ویڈیوز نظر آئیں۔

## مقبول ویڈیوز
SYK کے ممبر ویڈیوز Admin approval کے بعد ہی دکھتے ہیں۔ YouTube کی عوامی trending تلاش بیرونی YouTube سرچ لنکس سے کھلتی ہے؛ اسے SYK کی اندرونی منظوری یا API فیڈ ظاہر نہیں کیا جاتا۔ Owner Admin منظور شدہ ویڈیو کو مقبول/ٹرینڈنگ نشان لگا سکتا ہے۔

## Google Play Store
یہ ویب/PWA بہتری ہے، Google Play پر شائع شدہ native Android app نہیں۔ Play Store کے لیے signed AAB، Play Console developer registration، privacy/data-safety declarations، store listing اور Android device testing الگ درکار ہیں۔ Developer registration کی فیس ہو سکتی ہے؛ کوئی ادائیگی مالک کی منظوری کے بغیر نہ کریں۔
