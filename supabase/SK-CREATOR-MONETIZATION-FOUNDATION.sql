-- SK CYBER HUB — Creator monetization foundation
-- Run AFTER SK-CYBER-HUB-SETUP.sql and SK-COMMUNITY-SOCIAL-SETUP.sql.
-- This stores applications and confirmed revenue records only.
-- It does NOT generate money, fake balances, impressions, or automatic payouts.

begin;

create table if not exists public.sk_creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.sk_profiles(id) on delete cascade,
  country text not null default 'Other' check (char_length(country) between 2 and 80),
  creator_type text not null check (creator_type in ('video','writing','education','live','mixed')),
  channel_url text,
  original_content_ack boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sk_creator_original_ack check (original_content_ack=true),
  constraint sk_creator_channel_url check (channel_url is null or channel_url ~ '^https://')
);

create table if not exists public.sk_creator_ledger (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.sk_profiles(id) on delete cascade,
  source text not null check (source in ('advertising','affiliate','sponsorship','gifts','membership','other')),
  source_reference text not null unique,
  currency char(3) not null default 'USD',
  gross_amount numeric(12,2) not null check (gross_amount>=0),
  creator_amount numeric(12,2) not null check (creator_amount>=0),
  platform_amount numeric(12,2) not null check (platform_amount>=0),
  status text not null default 'confirmed' check (status in ('confirmed','payable','paid','reversed')),
  description text not null default '',
  recorded_by uuid not null references public.sk_profiles(id),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint sk_creator_ledger_split check (round(gross_amount,2)=round(creator_amount+platform_amount,2))
);

create index if not exists sk_creator_apps_status_idx on public.sk_creator_applications(status,created_at desc);
create index if not exists sk_creator_ledger_creator_idx on public.sk_creator_ledger(creator_id,created_at desc);

alter table public.sk_creator_applications enable row level security;
alter table public.sk_creator_ledger enable row level security;

drop policy if exists sk_creator_application_read_self_or_admin on public.sk_creator_applications;
create policy sk_creator_application_read_self_or_admin on public.sk_creator_applications
for select to authenticated using (user_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_creator_application_insert_self on public.sk_creator_applications;
create policy sk_creator_application_insert_self on public.sk_creator_applications
for insert to authenticated with check (
  user_id=(select auth.uid()) and status='pending' and original_content_ack=true
);

drop policy if exists sk_creator_application_update_admin on public.sk_creator_applications;
create policy sk_creator_application_update_admin on public.sk_creator_applications
for update to authenticated using (public.sk_is_admin()) with check (public.sk_is_admin());

drop policy if exists sk_creator_application_delete_self_pending on public.sk_creator_applications;
create policy sk_creator_application_delete_self_pending on public.sk_creator_applications
for delete to authenticated using (user_id=(select auth.uid()) and status='pending');

drop policy if exists sk_creator_ledger_read_self_or_admin on public.sk_creator_ledger;
create policy sk_creator_ledger_read_self_or_admin on public.sk_creator_ledger
for select to authenticated using (creator_id=(select auth.uid()) or public.sk_is_admin());

drop policy if exists sk_creator_ledger_admin_insert on public.sk_creator_ledger;
create policy sk_creator_ledger_admin_insert on public.sk_creator_ledger
for insert to authenticated with check (public.sk_is_admin() and recorded_by=(select auth.uid()));

drop policy if exists sk_creator_ledger_admin_update on public.sk_creator_ledger;
create policy sk_creator_ledger_admin_update on public.sk_creator_ledger
for update to authenticated using (public.sk_is_admin()) with check (public.sk_is_admin());

revoke all on public.sk_creator_applications,public.sk_creator_ledger from anon,authenticated;
grant select,insert,delete on public.sk_creator_applications to authenticated;
grant update on public.sk_creator_applications to authenticated;
grant select,insert,update on public.sk_creator_ledger to authenticated;

create or replace function public.sk_creator_application_touch()
returns trigger
language plpgsql
set search_path = ''
as $sk$
begin
  new.updated_at := now();
  return new;
end;
$sk$;
drop trigger if exists sk_creator_application_touch_trigger on public.sk_creator_applications;
create trigger sk_creator_application_touch_trigger before update on public.sk_creator_applications
for each row execute function public.sk_creator_application_touch();

-- No public INSERT policy exists on the ledger. Members cannot invent their own earnings.
-- The owner must record only revenue that has actually been received/confirmed.
-- Creator applications do not guarantee approval, views, earnings or payouts.
commit;
