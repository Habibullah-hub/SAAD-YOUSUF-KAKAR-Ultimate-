# SK Cyber Hub — Supabase setup (Urdu)

یہ فائل صرف **SK Cyber Hub** کے ڈیٹا بیس کو جوڑنے کے لیے ہے۔ یہ پرانی ویب سائٹ کے `public.apps` اور `public.profiles` ٹیبلز کو تبدیل نہیں کرتی۔ نئے ٹیبلز کے نام `public.sk_apps` اور `public.sk_profiles` ہیں۔

## 1) SQL چلائیں

1. اپنے موجودہ Supabase فری پروجیکٹ کو کھولیں۔ نیا paid project بنانے کی ضرورت نہیں۔
2. بائیں طرف **SQL Editor** کھولیں اور **New query** دبائیں۔
3. [SK-CYBER-HUB-SETUP.sql](./SK-CYBER-HUB-SETUP.sql) فائل کھولیں۔
4. SQL فائل کا مکمل متن Copy کریں، Supabase کے SQL Editor میں Paste کریں اور **Run** دبائیں۔
5. یہ اسکرپٹ صرف SK Cyber Hub کے الگ ٹیبلز، policies اور trigger بناتا ہے۔ پرانے `apps` اور `profiles` ٹیبلز کو نہیں چھیڑتا۔

## 2) Community / Social Feed تیار کریں

World Network کے Community حصے میں پوسٹ، Like، Comment اور Report کے لیے یہ الگ SQL ایک مرتبہ چلائیں:

1. [SK-CYBER-HUB-COMMUNITY.sql](./SK-CYBER-HUB-COMMUNITY.sql) کھولیں۔
2. مکمل SQL کاپی کریں اور اسی SK Cyber Hub Supabase پروجیکٹ کے SQL Editor میں Run کریں۔
3. یہ صرف `sk_posts`, `sk_post_likes`, `sk_post_comments`, `sk_post_reports` بناتا ہے۔ پرانے `apps` یا `profiles` ٹیبلز تبدیل نہیں ہوتے۔
4. پوسٹ کرنے کے لیے Member Login ضروری ہے۔ عام ممبر کو Admin اختیارات نہیں ملتے۔ Report صرف Admin پڑھ سکتا ہے۔

**نوٹ:** اس SQL کو چلائے بغیر Community feed کا ڈیزائن نظر آئے گا، لیکن پوسٹ/Like/Comment ڈیٹا محفوظ نہیں ہوگا۔

## 2) صرف اپنے اکاؤنٹ کو Admin بنائیں

1. Supabase میں **Authentication → Users** کھولیں۔
2. اپنا مالک/ایڈمن اکاؤنٹ بنائیں یا پہلے سے موجود اپنا اکاؤنٹ استعمال کریں۔
3. اپنے اکاؤنٹ کا **User ID / UUID** Copy کریں۔
4. SQL Editor میں یہ کمانڈ چلائیں، اور placeholder کی جگہ اپنا UUID لکھیں:

```sql
UPDATE public.sk_profiles
SET role = 'admin'
WHERE id = 'PASTE-OWNER-USER-UUID-HERE';
```

5. نتیجے میں صرف ایک row update ہونی چاہیے۔ کسی دوسرے صارف کو Admin نہ بنائیں۔

نئے صارفین خودکار طور پر `member` بنتے ہیں۔ عام صارف اپنے آپ کو Admin نہیں بنا سکتا۔

## 3) ویب سائٹ کو Supabase سے جوڑیں

1. Supabase میں **Project Settings → API** کھولیں۔
2. **Project URL** اور **anon / publishable public key** Copy کریں۔
3. SK Cyber Hub ویب سائٹ کھولیں اور اوپر Admin/Settings والے بٹن سے Supabase settings کھولیں۔
4. Project URL اور anon/public key درج کرکے Save کریں۔
5. **service_role / secret key کبھی ویب سائٹ یا چیٹ میں نہ ڈالیں۔**

## 3-A) نئے Catalog اور Suggestions / MOD APK اضافی ٹیبلز

بنیادی Setup SQL کامیابی سے چلانے کے بعد یہ الگ migrations ضرورت کے مطابق ایک ایک مرتبہ چلائیں:

1. `SK-UNIFIED-RESOURCES.sql` — unified resource catalog اور import-source approvals۔
2. `SK-MOD-APK-SAFETY-METADATA.sql` — موجودہ `sk_apps` میں صرف معلوماتی MOD APK safety fields۔
3. `SK-MEMBER-SUGGESTIONS.sql` — ممبرز کی تجاویز اور Admin review queue۔

یہ migrations خودکار طور پر نہیں چلتے۔ ہر فائل کو پہلے پڑھیں، پھر اسی SK Cyber Hub Supabase پروجیکٹ کے SQL Editor میں چلائیں۔ انہیں پرانے Yousuf Kakar Free Apps ڈیٹابیس میں نہ چلائیں۔ ان تبدیلیوں سے کوئی paid سروس یا Storage فعال نہیں ہوتی۔

## 4) Admin لاگ اِن اور جانچ

اپنے Authentication والے ای میل اور پاس ورڈ سے Admin Login کریں۔ کامیاب ہونے کے بعد Admin Dashboard میں App شامل، تبدیل یا حذف کر کے دیکھیں۔

اگر ٹیبل یا policy سے متعلق error آئے تو اس کا مکمل متن شیئر کریں؛ پاس ورڈ، secret key یا service_role key شیئر نہ کریں۔

**خرچ:** اس طریقے میں نیا Supabase project یا paid plan درکار نہیں۔ موجودہ فری پروجیکٹ کے اندر الگ SK ٹیبلز استعمال ہوتے ہیں؛ Supabase کی فری حدود پھر بھی لاگو رہیں گی۔
