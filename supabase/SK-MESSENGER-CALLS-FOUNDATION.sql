-- SK CYBER HUB — Private Messenger & WebRTC signaling foundation
-- Run AFTER SK-COMMUNITY-SOCIAL-SETUP.sql in the SK Cyber Hub Supabase project.
-- Text messages and call metadata only. Audio/video/screen media are NOT stored here.
-- No service-role key is used in the browser. Private conversations are never public.

begin;

create table if not exists public.sk_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'direct' check (kind in ('direct','group')),
  created_by uuid not null references public.sk_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.sk_conversation_members (
  conversation_id uuid not null references public.sk_conversations(id) on delete cascade,
  user_id uuid not null references public.sk_profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id,user_id)
);

create table if not exists public.sk_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.sk_conversations(id) on delete cascade,
  sender_id uuid not null references public.sk_profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.sk_call_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.sk_conversations(id) on delete cascade,
  caller_id uuid not null references public.sk_profiles(id) on delete cascade,
  callee_id uuid not null references public.sk_profiles(id) on delete cascade,
  call_type text not null check (call_type in ('audio','video','screen')),
  status text not null default 'ringing' check (status in ('ringing','accepted','declined','ended','missed')),
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  constraint sk_call_two_distinct_members check (caller_id<>callee_id)
);

-- Short-lived WebRTC offers/answers/ICE candidates. Participants must delete consumed rows.
create table if not exists public.sk_call_signals (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.sk_call_sessions(id) on delete cascade,
  sender_id uuid not null references public.sk_profiles(id) on delete cascade,
  recipient_id uuid not null references public.sk_profiles(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint sk_signal_distinct_members check (sender_id<>recipient_id),
  constraint sk_signal_payload_size check (octet_length(payload::text)<=16000)
);

create index if not exists sk_messages_conversation_idx on public.sk_messages(conversation_id,created_at desc);
create index if not exists sk_calls_conversation_idx on public.sk_call_sessions(conversation_id,created_at desc);
create index if not exists sk_signals_recipient_idx on public.sk_call_signals(recipient_id,created_at);

alter table public.sk_conversations enable row level security;
alter table public.sk_conversation_members enable row level security;
alter table public.sk_messages enable row level security;
alter table public.sk_call_sessions enable row level security;
alter table public.sk_call_signals enable row level security;

-- Security-definer membership check avoids recursive RLS policies on membership rows.
create or replace function public.sk_is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $sk$
  select exists(select 1 from public.sk_conversation_members m
    where m.conversation_id=p_conversation_id and m.user_id=(select auth.uid()));
$sk$;
revoke all on function public.sk_is_conversation_member(uuid) from public;
grant execute on function public.sk_is_conversation_member(uuid) to authenticated;

drop policy if exists sk_conversations_member_read on public.sk_conversations;
create policy sk_conversations_member_read on public.sk_conversations
for select to authenticated using (
  public.sk_is_conversation_member(id)
);

drop policy if exists sk_conversation_members_read on public.sk_conversation_members;
create policy sk_conversation_members_read on public.sk_conversation_members
for select to authenticated using (
  public.sk_is_conversation_member(conversation_id)
);

drop policy if exists sk_messages_member_read on public.sk_messages;
create policy sk_messages_member_read on public.sk_messages
for select to authenticated using (
  public.sk_is_conversation_member(sk_messages.conversation_id)
);

drop policy if exists sk_messages_member_send on public.sk_messages;
create policy sk_messages_member_send on public.sk_messages
for insert to authenticated with check (
  sender_id=(select auth.uid())
  and public.sk_is_conversation_member(sk_messages.conversation_id)
);

drop policy if exists sk_messages_sender_edit on public.sk_messages;
create policy sk_messages_sender_edit on public.sk_messages
for update to authenticated using (sender_id=(select auth.uid()))
with check (sender_id=(select auth.uid()));

drop policy if exists sk_messages_sender_delete on public.sk_messages;
create policy sk_messages_sender_delete on public.sk_messages
for delete to authenticated using (sender_id=(select auth.uid()));

-- Validate that the callee is the other participant in the same direct conversation.
create or replace function public.sk_guard_call_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $sk$
begin
  if not exists(select 1 from public.sk_conversation_members m
    where m.conversation_id=new.conversation_id and m.user_id=new.callee_id) then
    raise exception 'The invited member is not part of this conversation.';
  end if;
  return new;
end;
$sk$;
drop trigger if exists sk_call_session_member_guard on public.sk_call_sessions;
create trigger sk_call_session_member_guard before insert on public.sk_call_sessions
for each row execute function public.sk_guard_call_insert();

drop policy if exists sk_calls_participant_read on public.sk_call_sessions;
create policy sk_calls_participant_read on public.sk_call_sessions
for select to authenticated using (
  caller_id=(select auth.uid()) or callee_id=(select auth.uid())
);

drop policy if exists sk_calls_caller_create on public.sk_call_sessions;
create policy sk_calls_caller_create on public.sk_call_sessions
for insert to authenticated with check (
  caller_id=(select auth.uid())
  and public.sk_is_conversation_member(sk_call_sessions.conversation_id)
);

-- Participants and conversation identity are immutable after a call is created.
create or replace function public.sk_guard_call_session_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $sk$
begin
  if new.conversation_id<>old.conversation_id or new.caller_id<>old.caller_id
    or new.callee_id<>old.callee_id or new.call_type<>old.call_type then
    raise exception 'Call participants and type cannot be changed.';
  end if;
  return new;
end;
$sk$;
drop trigger if exists sk_call_session_identity_guard on public.sk_call_sessions;
create trigger sk_call_session_identity_guard before update on public.sk_call_sessions
for each row execute function public.sk_guard_call_session_update();

drop policy if exists sk_calls_participant_update on public.sk_call_sessions;
create policy sk_calls_participant_update on public.sk_call_sessions
for update to authenticated using (
  caller_id=(select auth.uid()) or callee_id=(select auth.uid())
) with check (
  caller_id=(select auth.uid()) or callee_id=(select auth.uid())
);

drop policy if exists sk_call_signals_participant_read on public.sk_call_signals;
create policy sk_call_signals_participant_read on public.sk_call_signals
for select to authenticated using (
  recipient_id=(select auth.uid()) or sender_id=(select auth.uid())
);

drop policy if exists sk_call_signals_sender_insert on public.sk_call_signals;
create policy sk_call_signals_sender_insert on public.sk_call_signals
for insert to authenticated with check (
  sender_id=(select auth.uid())
  and exists(select 1 from public.sk_call_sessions c where c.id=call_id
    and (c.caller_id=sender_id or c.callee_id=sender_id)
    and (c.caller_id=recipient_id or c.callee_id=recipient_id))
);

drop policy if exists sk_call_signals_participant_delete on public.sk_call_signals;
create policy sk_call_signals_participant_delete on public.sk_call_signals
for delete to authenticated using (sender_id=(select auth.uid()) or recipient_id=(select auth.uid()));

-- Secure RPC creates/reuses a direct conversation and adds exactly the two participants.
create or replace function public.sk_create_direct_conversation(p_other_user uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $sk$
declare me uuid; existing_id uuid; new_id uuid;
begin
  me := auth.uid();
  if me is null then raise exception 'Sign in first.'; end if;
  if p_other_user is null or p_other_user=me then raise exception 'Choose another member.'; end if;
  if not exists(select 1 from public.sk_profiles p where p.id=p_other_user ) then
    raise exception 'This member is not available for private chat.';
  end if;

  select c.id into existing_id
  from public.sk_conversations c
  where c.kind='direct'
    and exists(select 1 from public.sk_conversation_members a where a.conversation_id=c.id and a.user_id=me)
    and exists(select 1 from public.sk_conversation_members b where b.conversation_id=c.id and b.user_id=p_other_user)
    and (select count(*) from public.sk_conversation_members n where n.conversation_id=c.id)=2
  limit 1;

  if existing_id is not null then return existing_id; end if;

  insert into public.sk_conversations(kind,created_by) values('direct',me) returning id into new_id;
  insert into public.sk_conversation_members(conversation_id,user_id) values(new_id,me),(new_id,p_other_user);
  return new_id;
end;
$sk$;

revoke all on function public.sk_create_direct_conversation(uuid) from public;
grant execute on function public.sk_create_direct_conversation(uuid) to authenticated;

revoke all on public.sk_conversations,public.sk_conversation_members,public.sk_messages,public.sk_call_sessions,public.sk_call_signals from anon,authenticated;
grant select on public.sk_conversations,public.sk_conversation_members,public.sk_messages,public.sk_call_sessions,public.sk_call_signals to authenticated;
grant insert,update,delete on public.sk_messages to authenticated;
grant insert,update on public.sk_call_sessions to authenticated;
grant insert,select,delete on public.sk_call_signals to authenticated;

-- Enable realtime delivery for private conversations, messages and call signaling.
do $sk$
begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sk_conversations') then
    alter publication supabase_realtime add table public.sk_conversations;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sk_conversation_members') then
    alter publication supabase_realtime add table public.sk_conversation_members;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sk_messages') then
    alter publication supabase_realtime add table public.sk_messages;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sk_call_sessions') then
    alter publication supabase_realtime add table public.sk_call_sessions;
  end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sk_call_signals') then
    alter publication supabase_realtime add table public.sk_call_signals;
  end if;
end;
$sk$;

commit;

-- Important limits:
-- 1) This is the private messaging and call-signaling database foundation, not a finished UI.
-- 2) WebRTC can carry media peer-to-peer; some networks require a TURN relay, which may cost money.
-- 3) This schema does not provide end-to-end encryption by itself. Do not advertise E2EE until implemented and audited.
-- 4) No media files or screen recordings are uploaded here. Call signaling rows should be deleted after use.
-- 5) The admin is intentionally not granted access to private messages or call content.
