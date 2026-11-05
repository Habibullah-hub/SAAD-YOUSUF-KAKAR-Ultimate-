-- SK Cyber Hub — restrict private call status transitions.
-- Run AFTER SK-MESSENGER-CALLS-FOUNDATION.sql.
-- Safe to re-run. Does not alter or delete call history.

begin;

create or replace function public.sk_guard_call_status_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $sk$
declare
  v_actor uuid := (select auth.uid());
begin
  if v_actor is null then
    raise exception 'Sign in to update a call.';
  end if;

  if new.conversation_id is distinct from old.conversation_id
    or new.caller_id is distinct from old.caller_id
    or new.callee_id is distinct from old.callee_id
    or new.call_type is distinct from old.call_type
    or new.created_at is distinct from old.created_at then
    raise exception 'Call identity fields cannot be changed.';
  end if;

  if new.status is not distinct from old.status then
    if new.ended_at is distinct from old.ended_at then
      raise exception 'Call end time is managed by the server.';
    end if;
    return new;
  end if;

  if old.status = 'ringing' and new.status in ('accepted','declined') then
    if v_actor <> old.callee_id then
      raise exception 'Only the invited member can accept or decline this call.';
    end if;
    if new.status = 'accepted' then
      new.ended_at := null;
    else
      new.ended_at := now();
    end if;
    return new;
  end if;

  if old.status = 'ringing' and new.status = 'ended' then
    if v_actor not in (old.caller_id, old.callee_id) then
      raise exception 'Only call participants can end this call.';
    end if;
    new.ended_at := now();
    return new;
  end if;

  if old.status = 'accepted' and new.status = 'ended' then
    if v_actor not in (old.caller_id, old.callee_id) then
      raise exception 'Only call participants can end this call.';
    end if;
    new.ended_at := now();
    return new;
  end if;

  raise exception 'This call status transition is not allowed.';
end;
$sk$;

revoke all on function public.sk_guard_call_status_transition() from public, anon, authenticated;

drop trigger if exists sk_call_status_transition_guard on public.sk_call_sessions;
create trigger sk_call_status_transition_guard
before update of status, ended_at on public.sk_call_sessions
for each row execute function public.sk_guard_call_status_transition();

commit;
