-- SYK Browser: accept safe external social video links and Admin channel references.
begin;

alter table public.sk_creator_submissions
  drop constraint if exists sk_creator_submissions_platform_check,
  drop constraint if exists sk_creator_submissions_platform_host_check;

alter table public.sk_creator_submissions
  add constraint sk_creator_submissions_platform_check
    check (platform = any (array['youtube','tiktok','facebook','instagram','x','threads','twitch','reddit','linkedin','snapchat','other']::text[])),
  add constraint sk_creator_submissions_platform_host_check
    check (
      (platform='youtube' and url ~* '^https://([a-z0-9-]+[.])*(youtube[.]com|youtu[.]be)([:/]|$)') or
      (platform='tiktok' and url ~* '^https://([a-z0-9-]+[.])*tiktok[.]com([:/]|$)') or
      (platform='facebook' and url ~* '^https://([a-z0-9-]+[.])*(facebook[.]com|fb[.]watch)([:/]|$)') or
      (platform='instagram' and url ~* '^https://([a-z0-9-]+[.])*instagram[.]com([:/]|$)') or
      (platform='x' and url ~* '^https://([a-z0-9-]+[.])*(x[.]com|twitter[.]com)([:/]|$)') or
      (platform='threads' and url ~* '^https://([a-z0-9-]+[.])*threads[.]net([:/]|$)') or
      (platform='twitch' and url ~* '^https://([a-z0-9-]+[.])*twitch[.]tv([:/]|$)') or
      (platform='reddit' and url ~* '^https://([a-z0-9-]+[.])*reddit[.]com([:/]|$)') or
      (platform='linkedin' and url ~* '^https://([a-z0-9-]+[.])*linkedin[.]com([:/]|$)') or
      (platform='snapchat' and url ~* '^https://([a-z0-9-]+[.])*snapchat[.]com([:/]|$)') or
      (platform='other' and url ~* '^https://[^/@]+([:/]|$)')
    );

alter table public.sk_creator_admin_media
  add column if not exists channel_url text;

alter table public.sk_creator_admin_media
  drop constraint if exists sk_creator_admin_media_platform_check,
  drop constraint if exists sk_creator_admin_media_platform_kind;

alter table public.sk_creator_admin_media
  add constraint sk_creator_admin_media_platform_check
    check (platform = any (array['youtube','tiktok','facebook','instagram','x','threads','twitch','reddit','linkedin','snapchat','other','image','direct']::text[])),
  add constraint sk_creator_admin_media_platform_kind
    check (
      (media_type='image' and platform='image') or
      (media_type='video' and platform = any (array['youtube','tiktok','facebook','instagram','x','threads','twitch','reddit','linkedin','snapchat','other','direct']::text[])) or
      (media_type='channel' and platform = any (array['youtube','tiktok','facebook','instagram','x','threads','twitch','reddit','linkedin','snapchat','other']::text[]))
    ),
  add constraint sk_creator_admin_media_channel_url_check
    check (channel_url is null or channel_url ~* '^https://[^/@]+([:/]|$)');

commit;