-- SK CYBER HUB — Live room metadata and chat foundation
-- Run AFTER SK-CYBER-HUB-SETUP.sql and SK-COMMUNITY-SOCIAL-SETUP.sql.
-- Media is handled by LiveKit Cloud WebRTC, not Supabase Storage.
-- Free Build quotas are hard caps: sessions fail at the cap; do not upgrade without approval.

begin;

create table if not exists public.sk_live_rooms (
  id uuid primary key default gen_random_uuid(),
  room_name text not null unique,
  host_id uuid not null references public.sk_profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 100),
  description text not null default '',
  status text not null default 'live' check (status in ('live','ended','blocked')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.sk_live_chat (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.sk_live_rooms(id) on delete cascade,
  user_id uuid not null references public.sk_profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists sk_live_rooms_status_idx on public.sk_live_rooms(status,started_at desc);
create index if not exists sk_live_chat_room_idx on public.sk_live_chat(room_id,created_at asc);

alter table public.sk_live_rooms enable row level security;
alter table public.sk_live_chat enable row level security;

drop policy if exists sk_live_rooms_public_read on public.sk_live_rooms;
create policy sk_live_rooms_public_read on public.sk_live_rooms
for select to anon,authenticated using (status='live' or host_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_live_rooms_host_insert on public.sk_live_rooms;
create policy sk_live_rooms_host_insert on public.sk_live_rooms
for insert to authenticated with check (host_id=(select auth.uid()) and status='live');

drop policy if exists sk_live_rooms_host_update on public.sk_live_rooms;
create policy sk_live_rooms_host_update on public.sk_live_rooms
for update to authenticated using (host_id=(select auth.uid()) or public.sk_is_admin())
with check (host_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_live_chat_public_read on public.sk_live_chat;
create policy sk_live_chat_public_read on public.sk_live_chat
for select to anon,authenticated using (
  exists(select 1 from public.sk_live_rooms r where r.id=room_id and r.status='live')
);

drop policy if exists sk_live_chat_member_insert on public.sk_live_chat;
create policy sk_live_chat_member_insert on public.sk_live_chat
for insert to authenticated with check (
  user_id=(select auth.uid())
  and exists(select 1 from public.sk_live_rooms r where r.id=room_id and r.status='live')
);

drop policy if exists sk_live_chat_owner_delete on public.sk_live_chat;
create policy sk_live_chat_owner_delete on public.sk_live_chat
for delete to authenticated using (user_id=(select auth.uid()) or public.sk_is_admin());

revoke all on public.sk_live_rooms,public.sk_live_chat from anon,authenticated;
grant select on public.sk_live_rooms,public.sk_live_chat to anon,authenticated;
grant insert,update on public.sk_live_rooms to authenticated;
grant insert,delete on public.sk_live_chat to authenticated;

-- Enable Supabase Realtime only for the small metadata/chat tables required by the UI.
do $sk$
begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sk_live_rooms') then
    alter publication supabase_realtime add table public.sk_live_rooms;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sk_live_chat') then
    alter publication supabase_realtime add table public.sk_live_chat;
  end if;
end;
$sk$;

commit;
