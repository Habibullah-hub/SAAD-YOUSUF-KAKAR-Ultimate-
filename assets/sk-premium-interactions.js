/* SK Cyber Hub — notification badges, profile alerts and protected triple-tap admin access. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
let client=null,user=null,role='member',channel=null,refreshing=false,authBound=false;
const escCount=n=>n>99?'99+':String(n);
const safeDate=v=>{try{return new Date(v).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}catch(_){return '';}};
function ensureBadge(){
 const avatar=$('skAccountAvatar');if(!avatar)return null;
 let badge=$('skAccountUnreadBadge');
 if(!badge){badge=document.createElement('span');badge.id='skAccountUnreadBadge';badge.className='sk-account-unread-badge';badge.hidden=true;badge.setAttribute('aria-label','Unread notifications');avatar.append(badge);}
 return badge;
}
function ensurePanel(){
 const pop=$('skAccountPopover');if(!pop||!user)return;
 if($('skAccountNotificationArea'))return;
 const area=document.createElement('section');area.id='skAccountNotificationArea';area.className='sk-notification-area';area.setAttribute('aria-label','Notifications');
 const toggle=document.createElement('button');toggle.type='button';toggle.id='skAccountNotificationToggle';toggle.className='sk-notification-toggle';toggle.setAttribute('aria-expanded','false');
 const label=document.createElement('span');label.innerHTML='<span aria-hidden="true">♢</span> Notifications';
 const count=document.createElement('span');count.id='skAccountNotificationCount';count.className='sk-notification-count';count.dataset.zero='true';count.textContent='0';
 toggle.append(label,count);
 const list=document.createElement('div');list.id='skAccountNotificationList';list.className='sk-notification-list';list.hidden=true;
 const foot=document.createElement('p');foot.className='sk-notification-foot';foot.textContent='یہاں صرف آپ کے اکاؤنٹ کی حقیقی اطلاعات دکھائی جاتی ہیں۔';
 toggle.addEventListener('click',async()=>{const open=list.hidden;list.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)await refresh(true);});
 area.append(toggle,list,foot);pop.append(area);
}
function emptyList(list,message){list.replaceChildren();const p=document.createElement('p');p.className='sk-notification-empty';p.textContent=message;list.append(p);}
function addItem(list,message,when,mark){
 const row=document.createElement('article');row.className='sk-notification-item';
 const copy=document.createElement('p');copy.textContent=message||'نئی اطلاع';const time=document.createElement('small');time.textContent=safeDate(when);copy.append(time);row.append(copy);
 if(mark){const button=document.createElement('button');button.type='button';button.textContent='پڑھ لیا';button.addEventListener('click',async()=>{button.disabled=true;const ok=await mark();if(ok){row.remove();await refresh(true);}else{button.disabled=false;button.textContent='دوبارہ کوشش';}});row.append(button);}
 list.append(row);
}
async function countQuery(table,build){
 try{let q=client.from(table).select('id',{count:'exact',head:true});q=build(q);const r=await q;return r.error?0:(r.count||0);}catch(_){return 0;}
}
async function refresh(withList=false){
 if(!client||!user||refreshing)return;refreshing=true;
 try{
  const tasks=[
   countQuery('sk_notifications',q=>q.eq('recipient_id',user.id).is('read_at',null)),
   countQuery('sk_inbox_messages',q=>q.eq('recipient_id',user.id).is('read_at',null))
  ];
  if(role==='admin')tasks.push(countQuery('sk_creator_admin_alerts',q=>q.is('seen_at',null)));
  const counts=await Promise.all(tasks);const total=counts.reduce((a,b)=>a+b,0);
  const badge=ensureBadge(),number=$('skAccountNotificationCount');
  if(badge){badge.textContent=escCount(total);badge.hidden=total===0;badge.title=total+' unread notifications';}
  if(number){number.textContent=escCount(total);number.dataset.zero=String(total===0);}
  if(withList)await loadList();
 }finally{refreshing=false;}
}
async function loadList(){
 const list=$('skAccountNotificationList');if(!list||!client||!user)return;
 list.replaceChildren();let found=0;
 try{
  const r=await client.from('sk_notifications').select('id,kind,message,created_at,post_id').eq('recipient_id',user.id).is('read_at',null).order('created_at',{ascending:false}).limit(6);
  if(!r.error&&r.data){r.data.forEach(item=>{found++;addItem(list,item.message,item.created_at,async()=>{const u=await client.from('sk_notifications').update({read_at:new Date().toISOString()}).eq('id',item.id);return !u.error;});});}
 }catch(_){}
 try{
  const r=await client.from('sk_inbox_messages').select('id,subject,body,created_at').eq('recipient_id',user.id).is('read_at',null).order('created_at',{ascending:false}).limit(5);
  if(!r.error&&r.data){r.data.forEach(item=>{found++;addItem(list,(item.subject?item.subject+' — ':'')+item.body,item.created_at,async()=>{const u=await client.from('sk_inbox_messages').update({read_at:new Date().toISOString()}).eq('id',item.id);return !u.error;});});}
 }catch(_){}
 if(role==='admin'){
  try{
   const r=await client.from('sk_creator_admin_alerts').select('id,submission_id,created_at').is('seen_at',null).order('created_at',{ascending:false}).limit(5);
   if(!r.error&&r.data){r.data.forEach(item=>{found++;addItem(list,'نئی ممبر ویڈیو منظوری کے لیے موصول ہوئی ہے۔',item.created_at,async()=>{const u=await client.from('sk_creator_admin_alerts').update({seen_at:new Date().toISOString()}).eq('id',item.id);return !u.error;});});}
  }catch(_){}
 }
 if(!found)emptyList(list,'ابھی کوئی نئی اطلاع نہیں۔');
}
async function bind(){
 const next=window.SK_SUPABASE_CLIENT||null;if(!next)return;
 client=next;
 if(!authBound){authBound=true;client.auth.onAuthStateChange((_event,session)=>{
  user=session?.user||null;
  if(channel){try{channel.unsubscribe();}catch(_){}channel=null;}
  if(!user){role='member';$('skAccountUnreadBadge')?.remove();$('skAccountNotificationArea')?.remove();return;}
  setTimeout(()=>bind(),0);
 });}
 try{const r=await client.auth.getSession();user=r.data?.session?.user||null;}catch(_){user=null;}
 if(!user){$('skAccountUnreadBadge')?.remove();$('skAccountNotificationArea')?.remove();return;}
 try{const r=await client.from('sk_profiles').select('role').eq('id',user.id).maybeSingle();role=r.data?.role==='admin'?'admin':'member';}catch(_){role='member';}
 ensureBadge();ensurePanel();refresh(false);
 if(!channel){try{channel=client.channel('sk-profile-notifications-'+user.id)
  .on('postgres_changes',{event:'*',schema:'public',table:'sk_inbox_messages',filter:'recipient_id=eq.'+user.id},()=>refresh(false));
  if(role==='admin')channel.on('postgres_changes',{event:'*',schema:'public',table:'sk_creator_admin_alerts'},()=>refresh(false));
  channel.subscribe();
 }catch(_){channel=null;}}
}
function observeProfile(){
 const observer=new MutationObserver(()=>{
  if($('skAccountPopover')&&user){ensureBadge();ensurePanel();}
 });
 observer.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('click',e=>{
  if(e.target.closest('#skAccountTrigger'))setTimeout(()=>{if(!$('skAccountPopover')?.hidden)refresh(false);},0);
 });
}
function bindAdminGesture(){
 const logo=$('skAdminButton');if(!logo)return;
 let taps=0,timer=0;
 logo.addEventListener('click',event=>{
  event.preventDefault();event.stopImmediatePropagation();
  taps++;
  if(timer)clearTimeout(timer);
  if(taps>=3){taps=0;clearTimeout(timer);if(typeof window.openAuthModal==='function')window.openAuthModal();return;}
  timer=setTimeout(()=>{taps=0;},1250);
 },true);
}
function start(){bindAdminGesture();observeProfile();bind();window.addEventListener('sk:database-ready',bind);window.addEventListener('sk:member-auth-changed',bind);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();