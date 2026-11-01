# SK Cyber Hub — Supabase setup (Urdu)

یہ فائل صرف **SK Cyber Hub** کے ڈیٹا بیس کو جوڑنے کے لیے ہے۔ یہ پرانی ویب سائٹ کے `public.apps` اور `public.profiles` ٹیبلز کو تبدیل نہیں کرتی۔ نئے ٹیبلز کے نام `public.sk_apps` اور `public.sk_profiles` ہیں۔

## 1) SQL چلائیں

1. اپنے موجودہ Supabase فری پروجیکٹ کو کھولیں۔ نیا paid project بنانے کی ضرورت نہیں۔
2. بائیں طرف **SQL Editor** کھولیں اور **New query** دبائیں۔
3. [SK-CYBER-HUB-SETUP.sql](./SK-CYBER-HUB-SETUP.sql) فائل کھولیں۔
4. SQL فائل کا مکمل متن Copy کریں، Supabase کے SQL Editor میں Paste کریں اور **Run** دبائیں۔
5. یہ اسکرپٹ صرف SK Cyber Hub کے الگ ٹیبلز، policies اور trigger بناتا ہے۔ پرانے `apps` اور `profiles` ٹیبلز کو نہیں چھیڑتا۔

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

## 4) Admin لاگ اِن اور جانچ

اپنے Authentication والے ای میل اور پاس ورڈ سے Admin Login کریں۔ کامیاب ہونے کے بعد Admin Dashboard میں App شامل، تبدیل یا حذف کر کے دیکھیں۔

اگر ٹیبل یا policy سے متعلق error آئے تو اس کا مکمل متن شیئر کریں؛ پاس ورڈ، secret key یا service_role key شیئر نہ کریں۔

**خرچ:** اس طریقے میں نیا Supabase project یا paid plan درکار نہیں۔ موجودہ فری پروجیکٹ کے اندر الگ SK ٹیبلز استعمال ہوتے ہیں؛ Supabase کی فری حدود پھر بھی لاگو رہیں گی۔
