-- Authenticated likes and comments for public SYK Browser videos.
begin;

create table if not exists public.sk_video_likes (
  id uuid primary key default gen_random_uuid(),
  video_source text not null check (video_source in ('admin','member')),
  video_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index if not exists sk_video_likes_one_per_user_idx
  on public.sk_video_likes(video_source,video_id,user_id);
create index if not exists sk_video_likes_video_idx
  on public.sk_video_likes(video_source,video_id);
create index if not exists sk_video_likes_user_idx on public.sk_video_likes(user_id);

create table if not exists public.sk_video_comments (
  id uuid primary key default gen_random_uuid(),
  video_source text not null check (video_source in ('admin','member')),
  video_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 800),
  created_at timestamptz not null default now()
);
create index if not exists sk_video_comments_video_idx
  on public.sk_video_comments(video_source,video_id,created_at desc);
create index if not exists sk_video_comments_user_idx on public.sk_video_comments(user_id);

alter table public.sk_video_likes enable row level security;
alter table public.sk_video_comments enable row level security;

drop policy if exists syk_video_likes_own_read on public.sk_video_likes;
create policy syk_video_likes_own_read on public.sk_video_likes
for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists syk_video_likes_own_insert on public.sk_video_likes;
create policy syk_video_likes_own_insert on public.sk_video_likes
for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists syk_video_likes_own_delete on public.sk_video_likes;
create policy syk_video_likes_own_delete on public.sk_video_likes
for delete to authenticated using (user_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists syk_video_comments_public_read on public.sk_video_comments;
create policy syk_video_comments_public_read on public.sk_video_comments
for select to anon,authenticated using (true);
drop policy if exists syk_video_comments_member_insert on public.sk_video_comments;
create policy syk_video_comments_member_insert on public.sk_video_comments
for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists syk_video_comments_member_delete on public.sk_video_comments;
create policy syk_video_comments_member_delete on public.sk_video_comments
for delete to authenticated using (user_id=(select auth.uid()) or public.sk_is_admin());

create or replace view public.sk_video_public_comments
with (security_invoker=true)
as
select id,video_source,video_id,body,created_at
from public.sk_video_comments;

revoke all on public.sk_video_likes from anon,authenticated;
grant select,insert,delete on public.sk_video_likes to authenticated;
revoke all on public.sk_video_comments from anon,authenticated;
grant insert,delete on public.sk_video_comments to authenticated;
grant select (id,video_source,video_id,body,created_at) on public.sk_video_comments to anon,authenticated;
revoke all on public.sk_video_public_comments from anon,authenticated;
grant select on public.sk_video_public_comments to anon,authenticated;

create or replace function private.sk_validate_video_engagement()
returns trigger
language plpgsql
security definer
set search_path=''
as $fn$
declare
  allowed boolean := false;
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'You may only interact as your signed-in account';
  end if;
  if new.video_source='member' then
    select exists(select 1 from public.sk_creator_submissions s
      where s.id=new.video_id and s.status='approved' and s.content_type='video')
      into allowed;
  else
    select exists(select 1 from public.sk_creator_admin_media a
      where a.id=new.video_id and a.published=true and a.media_type='video')
      into allowed;
  end if;
  if not allowed then raise exception 'This video is not publicly available'; end if;
  return new;
end;
$fn$;
revoke all on function private.sk_validate_video_engagement() from public,anon,authenticated;

drop trigger if exists syk_video_likes_validate on public.sk_video_likes;
create trigger syk_video_likes_validate before insert on public.sk_video_likes
for each row execute function private.sk_validate_video_engagement();
drop trigger if exists syk_video_comments_validate on public.sk_video_comments;
create trigger syk_video_comments_validate before insert on public.sk_video_comments
for each row execute function private.sk_validate_video_engagement();

commit;
