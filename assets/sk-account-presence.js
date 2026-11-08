/* SYK Cyber Hub — shared account identity across homepage and SYK Browser.
   Uses the same Supabase Auth session/localStorage as the main site. */
(()=>{'use strict';
const KEY_URL='skcyberhub_supabase_url',KEY_PUBLIC='skcyberhub_supabase_anon_key';
const $=id=>document.getElementById(id);
let client=null,bound=false,renderSeq=0;
const nameOf=user=>String(user?.user_metadata?.first_name||user?.user_metadata?.full_name||user?.email?.split('@')[0]||'Member').trim().slice(0,40)||'Member';
const initials=name=>name.split(/[\s._-]+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'U';
function addStyle(){
 if($('skAccountPresenceStyle'))return;
 const style=document.createElement('style');style.id='skAccountPresenceStyle';
 style.textContent=`
 .sk-account-presence{position:relative;display:inline-flex;align-items:center;z-index:80;font:inherit}
 .sk-account-trigger{display:flex;align-items:center;gap:8px;max-width:220px;min-height:40px;padding:4px 10px 4px 5px;border:1px solid #385675;border-radius:999px;background:linear-gradient(135deg,#122a43,#111b31);color:#f1f7ff;cursor:pointer;text-align:left}
 .sk-account-avatar{width:30px;height:30px;flex:0 0 30px;display:grid;place-items:center;border-radius:50%;background:linear-gradient(135deg,#53e0c1,#8a9dff);color:#071522;font-size:11px;font-weight:950}
 .sk-account-copy{min-width:0;display:grid;line-height:1.2}.sk-account-copy b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.sk-account-copy small{color:#a9bdd4;font-size:9px}
 .sk-account-pop{position:absolute;right:0;top:calc(100% + 9px);width:min(280px,calc(100vw - 28px));padding:13px;border:1px solid #365674;border-radius:15px;background:#0d1a2c;color:#eff6ff;box-shadow:0 18px 48px #0009}
 .sk-account-pop[hidden]{display:none}.sk-account-pop strong{display:block;overflow-wrap:anywhere;font-size:13px}.sk-account-pop p{margin:5px 0 10px;color:#a9bdd4;font-size:11px;overflow-wrap:anywhere}
 .sk-account-role{display:inline-block;margin:0 0 10px;padding:4px 8px;border:1px solid #2e746f;border-radius:99px;background:#123b3c;color:#a6f4e7;font-size:10px;font-weight:850}
 .sk-account-pop a,.sk-account-pop button{display:block;width:100%;margin-top:7px;padding:9px 10px;border:1px solid #3a5875;border-radius:9px;background:#142a43;color:#eaf5ff;text-align:center;text-decoration:none;font-size:11px;font-weight:800;cursor:pointer}
 .sk-account-pop button{border-color:#7b4651;background:#3a202c;color:#ffdce2}
 @media(max-width:600px){.sk-account-trigger{min-height:36px;gap:6px;padding-right:8px}.sk-account-copy b{max-width:78px;font-size:10px}.sk-account-copy small{font-size:8px}.sk-account-avatar{width:27px;height:27px;flex-basis:27px}}
 @media(prefers-reduced-motion:no-preference){.sk-account-trigger,.sk-account-pop{transition:transform .18s ease,opacity .18s ease}.sk-account-trigger:active{transform:scale(.97)}}
 @media(prefers-reduced-motion:reduce){.sk-account-trigger,.sk-account-pop{transition:none}}
 body.sk-day-mode .sk-account-trigger,html[data-theme=light] .sk-account-trigger{background:#fff!important;border-color:#bfd1e1!important;color:#17324a!important}
 body.sk-day-mode .sk-account-copy small,html[data-theme=light] .sk-account-copy small{color:#526b82!important}
 body.sk-day-mode .sk-account-pop,html[data-theme=light] .sk-account-pop{background:#fff!important;border-color:#c7d8e6!important;color:#17324a!important}
 body.sk-day-mode .sk-account-pop p,html[data-theme=light] .sk-account-pop p{color:#526b82!important}
 body.sk-day-mode .sk-account-pop a,html[data-theme=light] .sk-account-pop a{background:#edf5fb!important;color:#075b91!important}
 .sk-account-pop #sykMemberSubmit,.sk-account-pop #sykMyVideos{max-height:55vh;overflow:auto}
 html[data-theme=light] .sk-account-pop #sykMemberSubmit,html[data-theme=light] .sk-account-pop #sykMyVideos{background:#f5f9fc;border-color:#c7d8e6;color:#17324a}

 `;
 document.head.append(style);
}
function mount(){
 const host=document.querySelector('.top .nav-actions')||document.querySelector('.top-actions');
 if($('skAccountPresence'))return true;if(!host)return false;
 addStyle();
 const wrap=document.createElement('div');wrap.className='sk-account-presence';wrap.id='skAccountPresence';
 const trigger=document.createElement('button');trigger.type='button';trigger.className='sk-account-trigger';trigger.id='skAccountTrigger';trigger.setAttribute('aria-expanded','false');
 const avatar=document.createElement('span');avatar.className='sk-account-avatar';avatar.id='skAccountAvatar';avatar.textContent='U';
 const copy=document.createElement('span');copy.className='sk-account-copy';const title=document.createElement('b');title.id='skAccountTitle';title.textContent='Account';const sub=document.createElement('small');sub.id='skAccountSubtitle';sub.textContent='Guest';
 copy.append(title,sub);trigger.append(avatar,copy);
 const pop=document.createElement('div');pop.className='sk-account-pop';pop.id='skAccountPopover';pop.hidden=true;
 wrap.append(trigger,pop);host.append(wrap);
 trigger.addEventListener('click',()=>{
  if(!client||!trigger.dataset.signedIn){if(location.pathname.endsWith('/browser.html'))location.href='./#community';else if(typeof window.openMemberAuthModal==='function')window.openMemberAuthModal('login');else location.href='./#community';return;}
  pop.hidden=!pop.hidden;trigger.setAttribute('aria-expanded',String(!pop.hidden));
 });
 document.addEventListener('click',e=>{if(!wrap.contains(e.target)){pop.hidden=true;trigger.setAttribute('aria-expanded','false');}});
 return true;
}
function paintGuest(){
 const t=$('skAccountTitle'),s=$('skAccountSubtitle'),a=$('skAccountAvatar'),p=$('skAccountPopover'),b=$('skAccountTrigger');
 if(!t||!s||!a||!p||!b)return;
 t.textContent='Login';s.textContent='Sign in';a.textContent='+';b.dataset.signedIn='';
 const upload=document.getElementById('sykMemberSubmit'),mine=document.getElementById('sykMyVideos'),hub=document.getElementById('sykVideoHub');if(hub){if(upload)hub.append(upload);if(mine)hub.append(mine);}p.innerHTML='<strong>Welcome to SYK Browser</strong><p>Login once to submit a video for Admin review.</p><a href="./#community">Login</a>';
}
async function paintUser(user){
 const seq=++renderSeq,t=$('skAccountTitle'),s=$('skAccountSubtitle'),a=$('skAccountAvatar'),p=$('skAccountPopover'),b=$('skAccountTrigger');
 if(!t||!s||!a||!p||!b)return;
 const name=nameOf(user);let role='member';
 try{const result=await client.from('sk_profiles').select('role').eq('id',user.id).maybeSingle();if(seq!==renderSeq)return;if(!result.error&&result.data?.role==='admin')role='admin';}
 catch(_){}
 t.textContent=name;s.textContent=role==='admin'?'Owner Admin':'Member';a.textContent=initials(name);b.dataset.signedIn='1';
 p.replaceChildren();
 const strong=document.createElement('strong');strong.textContent=name;
 const email=document.createElement('p');email.textContent=user.email||'Signed-in account';
 const badge=document.createElement('span');badge.className='sk-account-role';badge.textContent=role==='admin'?'OWNER ADMIN':'MEMBER';
 const signout=document.createElement('button');signout.type='button';signout.textContent='Sign out';
 signout.addEventListener('click',async()=>{signout.disabled=true;const result=await client.auth.signOut();if(result.error){signout.disabled=false;email.textContent='Sign out failed. Please try again.';}else{p.hidden=true;b.setAttribute('aria-expanded','false');paintGuest();}});
 p.append(strong,email,badge,signout);const upload=document.getElementById('sykMemberSubmit'),mine=document.getElementById('sykMyVideos');if(upload)p.append(upload);if(mine)p.append(mine);
}
async function init(){
 if(!mount())return;
 try{
  client=window.SK_SUPABASE_CLIENT||null;
  if(!client&&window.supabase?.createClient){
   const url=localStorage.getItem(KEY_URL)||'',key=localStorage.getItem(KEY_PUBLIC)||'';
   if(url&&key){client=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}});}
  }
  if(!client){paintGuest();return;}
  const {data,error}=await client.auth.getSession();if(error)throw error;
  if(data?.session?.user)await paintUser(data.session.user);else paintGuest();
  if(!bound){bound=true;client.auth.onAuthStateChange((_event,session)=>{if(session?.user)paintUser(session.user);else{renderSeq++;paintGuest();}});}
 }catch(_){paintGuest();}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('sk:database-ready',()=>{client=window.SK_SUPABASE_CLIENT||client;if(client&&!bound){bound=true;client.auth.onAuthStateChange((_event,session)=>session?.user?paintUser(session.user):paintGuest());}init();});
})();