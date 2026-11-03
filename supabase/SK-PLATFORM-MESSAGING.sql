-- SK Cyber Hub: native member-to-member inbox (NOT public email/SMTP)
-- Run once in the SK Cyber Hub Supabase SQL Editor.
-- No external mail provider, paid API, public bucket, or secret key is required.
begin;

create table if not exists public.sk_messages (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 sender_email text not null,
 recipient_email text not null,
 subject text not null default '' check (char_length(subject)<=120),
 body text not null check (char_length(trim(body)) between 1 and 5000),
 created_at timestamptz not null default now(),
 read_at timestamptz,
 constraint sk_messages_no_self_send check (sender_id <> recipient_id)
);

create index if not exists sk_messages_recipient_created_idx on public.sk_messages(recipient_id,created_at desc);
create index if not exists sk_messages_sender_created_idx on public.sk_messages(sender_id,created_at desc);

create or replace function public.sk_messages_resolve_recipient()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
 v_recipient_id uuid;
 v_sender_email text;
 v_recent_count integer;
begin
 if new.sender_id <> (select auth.uid()) then
  raise exception 'Sender must be the signed-in SK member.';
 end if;
 select u.id into v_recipient_id
 from auth.users u
 where lower(u.email)=lower(trim(new.recipient_email))
 limit 1;
 if v_recipient_id is null then
  raise exception 'No registered SK member uses that email address.';
 end if;
 select count(*) into v_recent_count from public.sk_messages m
 where m.sender_id=new.sender_id and m.created_at > now() - interval '1 hour';
 if v_recent_count >= 20 then
  raise exception 'SK Mail sending limit reached. Please try again later.';
 end if;
 if v_recipient_id=new.sender_id then
  raise exception 'You cannot send a message to yourself.';
 end if;
 select u.email into v_sender_email from auth.users u where u.id=new.sender_id;
 new.recipient_id:=v_recipient_id;
 new.recipient_email:=lower(trim(new.recipient_email));
 new.sender_email:=coalesce(v_sender_email,'');
 return new;
end;
$$;

drop trigger if exists sk_messages_resolve_recipient_before_insert on public.sk_messages;
create trigger sk_messages_resolve_recipient_before_insert
before insert on public.sk_messages
for each row execute function public.sk_messages_resolve_recipient();

alter table public.sk_messages enable row level security;

drop policy if exists sk_messages_participant_read on public.sk_messages;
create policy sk_messages_participant_read on public.sk_messages
for select to authenticated
using (sender_id=(select auth.uid()) or recipient_id=(select auth.uid()));

drop policy if exists sk_messages_sender_insert on public.sk_messages;
create policy sk_messages_sender_insert on public.sk_messages
for insert to authenticated
with check (sender_id=(select auth.uid()));

drop policy if exists sk_messages_recipient_mark_read on public.sk_messages;
create policy sk_messages_recipient_mark_read on public.sk_messages
for update to authenticated
using (recipient_id=(select auth.uid()))
with check (recipient_id=(select auth.uid()));

revoke all on table public.sk_messages from anon;
revoke all on table public.sk_messages from authenticated;
grant select,insert on table public.sk_messages to authenticated;
grant update(read_at) on table public.sk_messages to authenticated;
revoke all on function public.sk_messages_resolve_recipient() from public,anon,authenticated;

commit;
