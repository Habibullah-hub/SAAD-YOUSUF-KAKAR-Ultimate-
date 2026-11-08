-- SYK member finder: search public display names or an exact registered email.
-- Email is used only as a lookup key and is never returned to the browser.
begin;
create or replace function public.sk_find_members(p_query text)
returns table(id uuid,display_name text,avatar_url text,bio text)
language sql
stable
security definer
set search_path=''
as $fn$
 select pp.id,pp.display_name,pp.avatar_url,pp.bio
 from public.sk_public_profiles pp
 join public.sk_profiles p on p.id=pp.id
 where auth.uid() is not null
   and pp.id<>auth.uid()
   and length(trim(coalesce(p_query,''))) between 2 and 120
   and (
     (position('@' in trim(p_query))>0 and lower(trim(p.email))=lower(trim(p_query)))
     or
     (position('@' in trim(p_query))=0 and pp.display_name ilike '%'||trim(p_query)||'%')
   )
 order by pp.display_name
 limit 12;
$fn$;
revoke all on function public.sk_find_members(text) from public,anon;
grant execute on function public.sk_find_members(text) to authenticated;
notify pgrst,'reload schema';
commit;
