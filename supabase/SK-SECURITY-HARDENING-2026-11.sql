-- SK CYBER HUB — Security hardening migration (2026-11)
-- Run AFTER SK-MESSENGER-CALLS-FOUNDATION.sql.
-- Additive/idempotent: does not delete messages, conversations, profiles or media.
-- Purpose: prevent call participants from changing call identity or reviving/forging call states.

begin;

create or replace function public.sk_guard_call_session_update()
returns trigger
language plpgsql
set search_path = ''
as $sk$
declare
  actor uuid;
begin
  actor := (select auth.uid());

  if actor is null or actor not in (old.caller_id, old.callee_id) then
    raise exception 'Only a participant can update this call.';
  end if;

  if new.conversation_id is distinct from old.conversation_id
    or new.caller_id is distinct from old.caller_id
    or new.callee_id is distinct from old.callee_id
    or new.call_type is distinct from old.call_type
    or new.created_at is distinct from old.created_at then
    raise exception 'Call identity and creation time cannot be changed.';
  end if;

  if new.status is distinct from old.status then
    if old.status = 'ringing' then
      if new.status not in ('accepted','declined','ended','missed') then
        raise exception 'Invalid call status transition.';
      end if;
      if new.status in ('accepted','declined','missed') and actor <> old.callee_id then
        raise exception 'Only the invited member can accept, decline or mark a call missed.';
      end if;
    elsif old.status = 'accepted' then
      if new.status <> 'ended' then
        raise exception 'An active call can only be ended.';
      end if;
    else
      raise exception 'A finished call cannot be reopened or changed.';
    end if;
  elsif new.ended_at is distinct from old.ended_at then
    raise exception 'Call end time can only change with a valid status transition.';
  end if;

  if new.status in ('declined','ended','missed') then
    new.ended_at := coalesce(new.ended_at, now());
  elsif new.status in ('ringing','accepted') then
    new.ended_at := null;
  end if;

  return new;
end;
$sk$;

drop trigger if exists sk_call_session_identity_guard on public.sk_call_sessions;
create trigger sk_call_session_identity_guard
before update on public.sk_call_sessions
for each row execute function public.sk_guard_call_session_update();

-- Ensure calls always connect exactly the two members of one direct conversation.
create or replace function public.sk_guard_call_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $sk$
declare
  member_count integer;
begin
  if new.caller_id is distinct from (select auth.uid()) then
    raise exception 'You can only start a call from your own account.';
  end if;

  if not exists (
    select 1 from public.sk_conversations c
    where c.id = new.conversation_id and c.kind = 'direct'
  ) then
    raise exception 'Calls are available only in direct conversations.';
  end if;

  if not exists (
    select 1 from public.sk_conversation_members m
    where m.conversation_id = new.conversation_id and m.user_id = new.caller_id
  ) or not exists (
    select 1 from public.sk_conversation_members m
    where m.conversation_id = new.conversation_id and m.user_id = new.callee_id
  ) then
    raise exception 'Both call participants must belong to this conversation.';
  end if;

  select count(*) into member_count
  from public.sk_conversation_members m
  where m.conversation_id = new.conversation_id;

  if member_count <> 2 then
    raise exception 'A direct call must have exactly two participants.';
  end if;

  if new.caller_id = new.callee_id or new.status <> 'ringing' then
    raise exception 'Invalid initial call state.';
  end if;

  return new;
end;
$sk$;

drop trigger if exists sk_call_session_member_guard on public.sk_call_sessions;
create trigger sk_call_session_member_guard
before insert on public.sk_call_sessions
for each row execute function public.sk_guard_call_insert();

-- Restrict function execution to authenticated users where the RPC is user-facing.
revoke all on function public.sk_create_direct_conversation(uuid) from public, anon;
grant execute on function public.sk_create_direct_conversation(uuid) to authenticated;

commit;

-- Operational note:
-- This migration hardens database rules but does not provide end-to-end encryption,
-- TURN relay, account recovery, backups, WAF/DDoS protection or a security certification.
-- Do not claim the platform is "unhackable". Review Supabase Auth/MFA and GitHub MFA settings.
