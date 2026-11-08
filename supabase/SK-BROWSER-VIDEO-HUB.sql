-- SYK Browser: owner-only media cards (video, image, channel link). Run once after SK-CREATOR-HUB.sql.
begin;
create table if not exists public.sk_creator_admin_media(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 media_type text not null check(media_type in ('video','image','channel')),
 platform text not null check(platform in ('youtube','tiktok','facebook','image')),
 title text not null check(char_length(trim(title)) between 2 and 120),
 media_url text not null check(media_url ~* '^https://'),
 published boolean not null default true,
 created_at timestamptz not null default now(),
 constraint sk_creator_admin_media_platform_kind check(
  (media_type='image' and platform='image') or
  (media_type in ('video','channel') and platform in ('youtube','tiktok','facebook'))
 )
);
alter table public.sk_creator_admin_media enable row level security;
drop policy if exists sk_creator_admin_media_public_read on public.sk_creator_admin_media;
create policy sk_creator_admin_media_public_read on public.sk_creator_admin_media for select to anon,authenticated using(published or public.sk_is_admin());
drop policy if exists sk_creator_admin_media_owner_manage on public.sk_creator_admin_media;
create policy sk_creator_admin_media_owner_manage on public.sk_creator_admin_media for all to authenticated using(public.sk_is_admin()) with check(public.sk_is_admin() and owner_id=(select auth.uid()));
revoke all on public.sk_creator_admin_media from anon,authenticated;
grant select on public.sk_creator_admin_media to anon,authenticated;
grant insert,update,delete on public.sk_creator_admin_media to authenticated;
commit;
