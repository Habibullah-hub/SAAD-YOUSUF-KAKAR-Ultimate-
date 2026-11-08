-- SYK Cyber Hub: secure public member-directory projection and trigger grants.
-- Run after SK-COMMUNITY-SOCIAL-SETUP.sql and the Messenger/Live foundations.
-- Public member lookup exposes display name/avatar/bio only; never email or role.
begin;
drop view if exists public.sk_public_profiles;
create table if not exists public.sk_public_profiles (
 id uuid primary key references public.sk_profiles(id) on delete cascade,
 display_name text not null default 'Member',
 avatar_url text,
 bio text not null default '',
 created_at timestamptz not null default now()
);
alter table public.sk_public_profiles enable row level security;
drop policy if exists sk_public_profiles_read_all on public.sk_public_profiles;
create policy sk_public_profiles_read_all on public.sk_public_profiles for select to anon,authenticated using(true);
revoke all on public.sk_public_profiles from anon,authenticated;
grant select on public.sk_public_profiles to anon,authenticated;
insert into public.sk_public_profiles(id,display_name,avatar_url,bio,created_at)
select id,display_name,avatar_url,bio,created_at from public.sk_profiles
on conflict(id) do update set display_name=excluded.display_name,avatar_url=excluded.avatar_url,bio=excluded.bio,created_at=excluded.created_at;
create or replace function public.sk_sync_public_profile()
returns trigger language plpgsql security definer set search_path=''
as $fn$
begin
 insert into public.sk_public_profiles(id,display_name,avatar_url,bio,created_at)
 values(new.id,new.display_name,new.avatar_url,new.bio,new.created_at)
 on conflict(id) do update set display_name=excluded.display_name,avatar_url=excluded.avatar_url,bio=excluded.bio;
 return new;
end;
$fn$;
revoke all on function public.sk_sync_public_profile() from public,anon,authenticated;
drop trigger if exists sk_profiles_sync_public_profile on public.sk_profiles;
create trigger sk_profiles_sync_public_profile after insert or update of display_name,avatar_url,bio on public.sk_profiles
for each row execute function public.sk_sync_public_profile();
revoke all on function public.sk_guard_call_insert() from public,anon,authenticated;
revoke all on function public.sk_guard_call_rate() from public,anon,authenticated;
revoke all on function public.sk_guard_live_chat_rate() from public,anon,authenticated;
revoke all on function public.sk_guard_message_rate() from public,anon,authenticated;
revoke all on function public.sk_guard_post_rate() from public,anon,authenticated;
revoke all on function public.sk_limit_community_user_storage() from public,anon,authenticated;
revoke all on function public.sk_profile_touch() from public,anon,authenticated;
revoke all on function public.sk_sync_community_author() from public,anon,authenticated;
revoke all on function public.sk_creator_submission_alert() from public,anon,authenticated;
revoke all on function public.sk_inbox_messages_resolve_recipient() from public,anon,authenticated;
revoke all on function public.sk_handle_new_user() from public,anon,authenticated;
revoke all on function public.sk_is_conversation_member(uuid) from public,anon;
grant execute on function public.sk_is_conversation_member(uuid) to authenticated;
commit;
