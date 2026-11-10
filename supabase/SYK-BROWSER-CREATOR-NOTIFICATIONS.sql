-- Deliver Creator approval/rejection decisions to the member's existing SYK inbox.
begin;

create or replace function private.sk_creator_status_inbox_notice()
returns trigger
language plpgsql
security definer
set search_path=''
as $fn$
declare
  acting_admin uuid := auth.uid();
  admin_email text;
  member_email text;
  notice_subject text;
  notice_body text;
begin
  if new.status is not distinct from old.status
     or new.status not in ('approved','rejected')
     or acting_admin is null then
    return new;
  end if;

  select u.email into admin_email from auth.users u where u.id=acting_admin;
  select u.email into member_email from auth.users u where u.id=new.user_id;
  if member_email is null then
    return new;
  end if;

  if tg_table_name='sk_creator_access_requests' then
    notice_subject := case when new.status='approved'
      then 'SYK Creator access approved'
      else 'SYK Creator access request update' end;
    notice_body := coalesce(new.review_message,
      case when new.status='approved'
        then 'Your Creator access is approved. You may now submit one video at a time for Admin review.'
        else 'Your Creator access request was not approved. Please review the Community Guidelines.' end);
  else
    notice_subject := case when new.status='approved'
      then 'Your SYK video is approved'
      else 'Your SYK video was not approved' end;
    notice_body := coalesce(new.review_message,
      case when new.status='approved'
        then 'Your video has been approved and is now eligible to appear in the public feed.'
        else 'Your video was not approved. Please review the Community Guidelines.' end);
  end if;

  insert into public.sk_inbox_messages
    (sender_id,recipient_id,sender_email,recipient_email,subject,body)
  values
    (acting_admin,new.user_id,coalesce(admin_email,'SYK Admin'),member_email,
     notice_subject,left(notice_body,5000));

  return new;
end;
$fn$;

revoke all on function private.sk_creator_status_inbox_notice() from public, anon, authenticated;

drop trigger if exists syk_creator_access_inbox_notice on public.sk_creator_access_requests;
create trigger syk_creator_access_inbox_notice
after update of status on public.sk_creator_access_requests
for each row execute function private.sk_creator_status_inbox_notice();

drop trigger if exists syk_creator_video_inbox_notice on public.sk_creator_submissions;
create trigger syk_creator_video_inbox_notice
after update of status on public.sk_creator_submissions
for each row execute function private.sk_creator_status_inbox_notice();

commit;
