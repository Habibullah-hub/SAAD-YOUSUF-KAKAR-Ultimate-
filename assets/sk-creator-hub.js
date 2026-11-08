/* SK Creator Hub — owner channels + admin-approved member submissions */
(()=>{'use strict';
const root=document.getElementById('skCreatorHub');if(!root)return;
const $=id=>document.getElementById(id);
const state={db:null,user:null,isAdmin:false,loaded:false,authBound:false,realtime:null};
const say=t=>{const n=$('skCreatorStatus');if(n)n.textContent=t;};
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch(_){return '';}};
const platformLabel=p=>({youtube:'YouTube',tiktok:'TikTok',facebook:'Facebook'}[p]||p);
function videoEmbed(platform,url){
 const u=safeUrl(url);if(!u)return '';
 try{
  const x=new URL(u);
  if(platform==='youtube'){
   let id=x.hostname==='youtu.be'?x.pathname.slice(1):x.searchParams.get('v');
   if(!id&&x.pathname.includes('/shorts/'))id=x.pathname.split('/shorts/')[1]?.split('/')[0];
   if(!id&&x.pathname.includes('/embed/'))id=x.pathname.split('/embed/')[1]?.split('/')[0];
   return id&&/^[\w-]{6,20}$/.test(id)?'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0':'';
  }
  if(platform==='tiktok'){
   const id=x.pathname.match(/\/video\/(\d+)/)?.[1];
   return id?'https://www.tiktok.com/player/v1/'+id+'?autoplay=1':'';
  }
  if(platform==='facebook')return 'https://www.facebook.com/plugins/video.php?href='+encodeURIComponent(u)+'&show_text=false&width=560';
 }catch(_){}
 return '';
}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function makeVideo(item){
 const card=el('article','sk-creator-card'),preview=el('div','sk-creator-preview');
 const play=el('button','','▶');play.type='button';play.setAttribute('aria-label','Play approved '+platformLabel(item.platform)+' video');
 const label=el('span','sk-creator-tag',platformLabel(item.platform)+(item.is_trending?' · TRENDING':''));
 preview.append(play,el('span','',item.platform==='youtube'?'YouTube video':item.platform==='tiktok'?'TikTok video':'Facebook video'));
 let started=false;play.addEventListener('click',()=>{if(started)return;const src=videoEmbed(item.platform,item.url);if(!src){say('یہ لنک قابلِ اعتماد in-page embed format میں نہیں؛ اصل پلیٹ فارم پر کھولیں۔');return;}const frame=document.createElement('iframe');frame.src=src;frame.title=item.title;frame.loading='lazy';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';preview.replaceChildren(frame);started=true;});
 const body=el('div','sk-creator-card-body');body.append(label,el('h3','',item.title));
 const original=el('a','sk-creator-btn','Open on '+platformLabel(item.platform)+' ↗');original.href=item.url;original.target='_blank';original.rel='noopener noreferrer';body.append(original);card.append(preview,body);return card;
}
function renderVideos(items){
 const trending=$('skCreatorTrending'),more=$('skCreatorMore'),members=$('skCreatorMemberChannels');trending.replaceChildren();more.replaceChildren();members.replaceChildren();
 const videos=(items||[]).filter(x=>x.content_type==='video');const memberChannels=(items||[]).filter(x=>x.content_type==='channel').sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));memberChannels.forEach(x=>{const a=el('a','sk-creator-btn',platformLabel(x.platform)+' · '+x.title);a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';members.append(a);});if(!memberChannels.length)members.append(el('p','sk-creator-muted','ابھی کوئی member channel منظور نہیں ہوا۔'));
 const top=videos.filter(x=>x.is_trending).sort((a,b)=>(a.trend_order||1000)-(b.trend_order||1000)).slice(0,6);
 const rest=videos.filter(x=>!x.is_trending).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,12);
 top.forEach(x=>trending.append(makeVideo(x)));rest.forEach(x=>more.append(makeVideo(x)));
 if(!top.length)trending.append(el('p','sk-creator-muted','ابھی کوئی ویڈیو Admin نے Trending میں منتخب نہیں کی۔'));
 if(!rest.length)more.append(el('p','sk-creator-muted','مزید منظور شدہ ویڈیوز ابھی دستیاب نہیں۔'));
}
async function loadPublic(db){
 const [channels,videos]=await Promise.all([
  db.from('sk_creator_channels').select('platform,title,channel_url').eq('enabled',true),
  db.from('sk_creator_submissions').select('id,content_type,platform,title,url,is_trending,trend_order,created_at').eq('status','approved').order('is_trending',{ascending:false}).order('trend_order',{ascending:true}).order('created_at',{ascending:false}).limit(40)
 ]);
 if(channels.error||videos.error){say('Creator Hub SQL ابھی فعال نہیں۔ براہِ کرم نئی migration چلائیں۔');return;}
 const host=$('skCreatorOwnerLinks');host.replaceChildren();
 (channels.data||[]).forEach(item=>{const a=el('a','',({youtube:'▶ YouTube',tiktok:'♪ TikTok',facebook:'f Facebook'}[item.platform]||item.title));a.href=item.channel_url;a.target='_blank';a.rel='noopener noreferrer';a.title=item.title;host.append(a);});
 if(!host.children.length)host.append(el('span','sk-creator-muted','Owner channels جلد یہاں دکھائی دیں گے۔'));
 renderVideos(videos.data||[]);
}
async function checkAdmin(db){
 const r=await db.rpc('sk_is_admin');state.isAdmin=!r.error&&r.data===true;
 $('skCreatorAdmin').hidden=!state.isAdmin;
 $('skCreatorOwnerSettings').hidden=!state.isAdmin;
 $('skCreatorMemberSubmit').hidden=!state.user;
 $('skCreatorLoginHint').hidden=!!state.user;
 if(state.isAdmin)await loadAdmin(db);
}
async function loadAdmin(db){
 const queue=$('skCreatorQueue'),badge=$('skCreatorPendingBadge');
 const [pending,alerts,channels]=await Promise.all([
  db.from('sk_creator_submissions').select('id,user_id,content_type,platform,title,url,created_at').eq('status','pending').order('created_at',{ascending:false}).limit(50),
  db.from('sk_creator_admin_alerts').select('id',{count:'exact',head:true}).is('seen_at',null),
  db.from('sk_creator_channels').select('platform,title,channel_url')
 ]);
 if(pending.error){say('Admin queue load نہیں ہوئی: '+pending.error.message);return;}
 badge.textContent=String(pending.data?.length||0);badge.hidden=!(pending.data?.length);
 queue.replaceChildren();
 if(!pending.data?.length)queue.append(el('p','sk-creator-muted','کوئی نئی درخواست نہیں۔'));
 (pending.data||[]).forEach(item=>{
  const row=el('article','sk-creator-admin-item'),info=el('div','',item.title+' · '+platformLabel(item.platform)+' · '+item.content_type);
  const link=el('a','', 'Submitted link ↗');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
  const actions=el('div','sk-creator-admin-actions');
  [['Approve as regular','approved',false],['Approve as Trending','approved',true],['Reject','rejected',false]].forEach(([label,status,trending])=>{
   const b=el('button','',label);b.type='button';b.addEventListener('click',async()=>{b.disabled=true;const update=await db.from('sk_creator_submissions').update({status,is_trending:trending,trend_order:trending?10:1000,reviewed_at:new Date().toISOString()}).eq('id',item.id);if(update.error){say('Update failed: '+update.error.message);b.disabled=false;return;}say('درخواست کا فیصلہ محفوظ ہوگیا۔');await loadAdmin(db);await loadPublic(db);});actions.append(b);
  });
  row.append(info,link,actions);queue.append(row);
 });
 const host=$('skCreatorChannelSettings');host.replaceChildren();
 const current=new Map((channels.data||[]).map(x=>[x.platform,x]));
 ['youtube','tiktok','facebook'].forEach(platform=>{
  const label=el('label','',platformLabel(platform)+' channel/page URL');
  const input=el('input','');input.type='url';input.placeholder='https://…';input.value=current.get(platform)?.channel_url||'';input.dataset.platform=platform;
  label.append(input);host.append(label);
 });
}
async function saveChannels(){
 const db=state.db;if(!state.isAdmin||!db)return;
 const rows=[...$('skCreatorChannelSettings').querySelectorAll('input[data-platform]')],payload=[];
 for(const input of rows){const url=input.value.trim();if(!url)continue;if(!safeUrl(url)){say('براہِ کرم ہر چینل کے لیے درست HTTPS لنک دیں۔');return;}payload.push({platform:input.dataset.platform,title:platformLabel(input.dataset.platform)+' · Official',channel_url:url,enabled:true,updated_at:new Date().toISOString()});}
 const r=await db.from('sk_creator_channels').upsert(payload,{onConflict:'platform'});if(r.error){say('Channel links محفوظ نہیں ہوئے: '+r.error.message);return;}say('آپ کے official channel links محفوظ ہوگئے۔');await loadPublic(db);
}
async function submit(event){
 event.preventDefault();if(!state.db||!state.user){say('لنک بھیجنے سے پہلے Member Login کریں۔');return;}
 const form=event.currentTarget,button=form.querySelector('button[type=submit]');button.disabled=true;
 try{
  const platform=$('skCreatorPlatform').value,type=$('skCreatorType').value,url=safeUrl($('skCreatorUrl').value.trim()),title=$('skCreatorTitle').value.trim();
  if(!url)throw new Error('درست HTTPS لنک درج کریں۔');
  const parsed=new URL(url),host=parsed.hostname.toLowerCase();
  const allowed={youtube:['youtube.com','www.youtube.com','youtu.be','m.youtube.com'],tiktok:['tiktok.com','www.tiktok.com','vm.tiktok.com'],facebook:['facebook.com','www.facebook.com','m.facebook.com','fb.watch']};
  if(!allowed[platform].some(x=>host===x||host.endsWith('.'+x)))throw new Error('منتخب پلیٹ فارم اور لنک آپس میں مطابقت نہیں رکھتے۔');
  const r=await state.db.from('sk_creator_submissions').insert({user_id:state.user.id,content_type:type,platform,title,url,status:'pending',is_trending:false});
  if(r.error)throw r.error;form.reset();say('آپ کا لنک Admin کو بھیج دیا گیا ہے۔ منظوری سے پہلے ہوم پیج پر نظر نہیں آئے گا۔');
 }catch(e){say(e.message||'لنک جمع نہیں ہوسکا۔ SQL migration چیک کریں۔');}
 finally{button.disabled=false;}
}
async function init(){
 const db=window.SK_SUPABASE_CLIENT;if(!db){say('SK database connect ہونے کے بعد Creator Hub فعال ہوگا۔');return;}
 state.db=db;const auth=await db.auth.getUser();state.user=auth.data?.user||null;
 await checkAdmin(db);await loadPublic(db);
 if(!state.authBound){state.authBound=true;db.auth.onAuthStateChange((_event,session)=>{setTimeout(async()=>{state.user=session?.user||null;await checkAdmin(db);await loadPublic(db);},0);});}
 if(state.isAdmin&&!state.realtime){state.realtime=db.channel('sk-creator-admin-queue').on('postgres_changes',{event:'INSERT',schema:'public',table:'sk_creator_submissions'},()=>loadAdmin(db)).subscribe();}
}
$('skCreatorForm')?.addEventListener('submit',submit);
$('skCreatorSaveChannels')?.addEventListener('click',saveChannels);
$('skCreatorRefresh')?.addEventListener('click',()=>state.db&&loadAdmin(state.db));
document.querySelectorAll('[data-sk-creator-tab]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.skCreatorTab;document.querySelectorAll('[data-sk-creator-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('skCreatorTrendingBlock').hidden=key!=='trending';$('skCreatorMoreBlock').hidden=key!=='more';$('skCreatorChannelsBlock').hidden=key!=='channels';}));
window.addEventListener('sk:database-ready',()=>init());
let attempts=0;const wait=()=>{if(window.SK_SUPABASE_CLIENT){init();return;}if(++attempts<30)setTimeout(wait,1000);};wait();

})();
