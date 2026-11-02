-- SK Cyber Hub — member suggestions and admin review queue
-- Run once in the SK Cyber Hub Supabase SQL Editor.
-- This creates one new SK-only table and does not modify existing apps/profiles tables.

begin;

create table if not exists public.sk_user_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'Other'
    check (kind in ('App / Website','AI Tool','Software / Document','News','Sponsored offer','Other')),
  title text not null check (char_length(title) between 1 and 120),
  url text,
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists sk_user_suggestions_status_created_idx
  on public.sk_user_suggestions(status, created_at desc);

alter table public.sk_user_suggestions enable row level security;

drop policy if exists sk_suggestions_member_submit on public.sk_user_suggestions;
create policy sk_suggestions_member_submit
on public.sk_user_suggestions
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
);

drop policy if exists sk_suggestions_admin_read on public.sk_user_suggestions;
create policy sk_suggestions_admin_read
on public.sk_user_suggestions
for select to authenticated
using (public.sk_is_admin());

drop policy if exists sk_suggestions_admin_review on public.sk_user_suggestions;
create policy sk_suggestions_admin_review
on public.sk_user_suggestions
for update to authenticated
using (public.sk_is_admin())
with check (public.sk_is_admin());

revoke all on public.sk_user_suggestions from anon;
revoke all on public.sk_user_suggestions from authenticated;
grant insert on public.sk_user_suggestions to authenticated;
grant select, update on public.sk_user_suggestions to authenticated;

commit;
