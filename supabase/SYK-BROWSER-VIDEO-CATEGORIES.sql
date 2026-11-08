-- SYK Browser video discovery categories.
-- Run in the EXISTING SK Cyber Hub Supabase project only after reviewing this migration.
-- Safe additive migration: does not change Admin roles, existing RLS policies, or public access rules.
begin;

alter table if exists public.sk_creator_submissions
  add column if not exists category text not null default 'other';

alter table if exists public.sk_creator_admin_media
  add column if not exists category text not null default 'other';

do $$
begin
  if to_regclass('public.sk_creator_submissions') is not null
     and not exists (select 1 from pg_constraint where conname='sk_creator_submissions_category_check' and conrelid='public.sk_creator_submissions'::regclass) then
    alter table public.sk_creator_submissions
      add constraint sk_creator_submissions_category_check
      check (category in ('islamic','news','education','other')) not valid;
    alter table public.sk_creator_submissions
      validate constraint sk_creator_submissions_category_check;
  end if;

  if to_regclass('public.sk_creator_admin_media') is not null
     and not exists (select 1 from pg_constraint where conname='sk_creator_admin_media_category_check' and conrelid='public.sk_creator_admin_media'::regclass) then
    alter table public.sk_creator_admin_media
      add constraint sk_creator_admin_media_category_check
      check (category in ('islamic','news','education','other')) not valid;
    alter table public.sk_creator_admin_media
      validate constraint sk_creator_admin_media_category_check;
  end if;
end $$;

create index if not exists sk_creator_submissions_category_feed_idx
  on public.sk_creator_submissions(category,is_trending desc,trend_order asc,created_at desc)
  where status='approved' and content_type='video';

create index if not exists sk_creator_admin_media_category_feed_idx
  on public.sk_creator_admin_media(category,is_featured desc,created_at desc)
  where published=true and media_type='video';

commit;
