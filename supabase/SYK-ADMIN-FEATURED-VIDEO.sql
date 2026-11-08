-- SYK Browser owner-only featured video and small direct-upload support.
-- Run after SK-BROWSER-VIDEO-HUB.sql. Uses the existing free storage quota only.
begin;
alter table public.sk_creator_admin_media add column if not exists is_featured boolean not null default false;
alter table public.sk_creator_admin_media add column if not exists media_path text;
alter table public.sk_creator_admin_media drop constraint if exists sk_creator_admin_media_platform_check;
alter table public.sk_creator_admin_media add constraint sk_creator_admin_media_platform_check
 check (platform = any (array['youtube'::text,'tiktok'::text,'facebook'::text,'image'::text,'direct'::text]));
alter table public.sk_creator_admin_media drop constraint if exists sk_creator_admin_media_platform_kind;
alter table public.sk_creator_admin_media add constraint sk_creator_admin_media_platform_kind check (
 (media_type='image' and platform='image') or
 (media_type='video' and platform in ('youtube','tiktok','facebook','direct')) or
 (media_type='channel' and platform in ('youtube','tiktok','facebook'))
);
create index if not exists sk_creator_admin_media_featured_idx
 on public.sk_creator_admin_media(is_featured desc,created_at desc) where published=true;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('syk-owner-videos','syk-owner-videos',true,52428800,array['video/mp4','video/webm','video/quicktime'])
on conflict(id) do update set public=true,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists syk_owner_videos_admin_insert on storage.objects;
create policy syk_owner_videos_admin_insert on storage.objects for insert to authenticated
with check(bucket_id='syk-owner-videos' and public.sk_is_admin() and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists syk_owner_videos_admin_update on storage.objects;
create policy syk_owner_videos_admin_update on storage.objects for update to authenticated
using(bucket_id='syk-owner-videos' and public.sk_is_admin() and (storage.foldername(name))[1]=(select auth.uid())::text)
with check(bucket_id='syk-owner-videos' and public.sk_is_admin() and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists syk_owner_videos_admin_delete on storage.objects;
create policy syk_owner_videos_admin_delete on storage.objects for delete to authenticated
using(bucket_id='syk-owner-videos' and public.sk_is_admin() and (storage.foldername(name))[1]=(select auth.uid())::text);
do $$
begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sk_inbox_messages') then
  alter publication supabase_realtime add table public.sk_inbox_messages;
 end if;
end $$;
revoke all on function public.rls_auto_enable() from public,anon,authenticated;
revoke all on function public.sk_is_admin() from public,anon;
grant execute on function public.sk_is_admin() to authenticated;
revoke all on function public.sk_record_site_visit(text,text,text) from public,authenticated;
grant execute on function public.sk_record_site_visit(text,text,text) to anon;
commit;
