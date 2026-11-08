/* SYK Creator Hub — owner-first channel and member video showcase */
(()=>{'use strict';
const root=document.getElementById('skCreatorHub');if(!root)return;
const $=id=>document.getElementById(id);
const state={db:null,user:null,isAdmin:false,authBound:false,realtime:null};
const say=t=>{const n=$('skCreatorStatus');if(n)n.textContent=t;};
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch(_){return '';}};
const platformHosts={youtube:['youtube.com','youtu.be'],tiktok:['tiktok.com'],facebook:['facebook.com','fb.watch']};
const platformUrlAllowed=(platform,value)=>{const clean=safeUrl(value);if(!clean||!platformHosts[platform])return false;try{const host=new URL(clean).hostname.toLowerCase();return platformHosts[platform].some(domain=>host===domain||host.endsWith('.'+domain));}catch(_){return false;}};
const platformLabel=p=>({youtube:'YouTube',tiktok:'TikTok',facebook:'Facebook'}[p]||p);
function videoEmbed(platform,url){
 const u=safeUrl(url);if(!u)return '';
 try{const x=new URL(u);
  if(platform==='youtube'){let id=x.hostname==='youtu.be'?x.pathname.slice(1):x.searchParams.get('v');if(!id&&x.pathname.includes('/shorts/'))id=x.pathname.split('/shorts/')[1].split('/')[0];if(!id&&x.pathname.includes('/embed/'))id=x.pathname.split('/embed/')[1].split('/')[0];const allowed='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';return id&&id.length>=6&&id.length<=20&&Array.from(id).every(c=>allowed.includes(c))?'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0':'';}
  if(platform==='tiktok'){const part=x.pathname.split('/video/')[1];const id=part?part.split('/')[0]:'';return id&&Array.from(id).every(c=>'0123456789'.includes(c))?'https://www.tiktok.com/player/v1/'+id+'?autoplay=1':'';}
  if(platform==='facebook')return 'https://www.facebook.com/plugins/video.php?href='+encodeURIComponent(u)+'&show_text=false&width=560';
 }catch(_){}return '';
}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function makeVideo(item){
 const card=el('article','sk-creator-card'),preview=el('div','sk-creator-preview'),play=el('button','','▶');play.type='button';play.setAttribute('aria-label','Play approved '+platformLabel(item.platform)+' video');preview.append(play,el('span','',platformLabel(item.platform)+' video'));
 let started=false;play.addEventListener('click',()=>{if(started)return;const src=videoEmbed(item.platform,item.url);if(!src){say('یہ ویڈیو embed نہیں ہوسکی؛ نیچے اصل پلیٹ فارم کا لنک استعمال کریں۔');return;}const frame=document.createElement('iframe');frame.src=src;frame.title=item.title;frame.loading='lazy';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';preview.replaceChildren(frame);started=true;});
 const body=el('div','sk-creator-card-body');body.append(el('span','sk-creator-tag',platformLabel(item.platform)),el('h3','',item.title));const original=el('a','sk-creator-btn','Open on '+platformLabel(item.platform)+' ↗');original.href=item.url;original.target='_blank';original.rel='noopener noreferrer';body.append(original);card.append(preview,body);return card;
}
function renderOwner(channels){
 const host=$('skCreatorOwnerLinks'),featured=$('skCreatorOwnerFeatured'),player=$('skCreatorOwnerPlayer');host.replaceChildren();player.replaceChildren();
 const rows=channels||[];rows.forEach(item=>{const a=el('a','sk-creator-owner-link',({youtube:'▶ YouTube',tiktok:'♪ TikTok',facebook:'f Facebook'}[item.platform]||item.title));a.href=item.channel_url;a.target='_blank';a.rel='noopener noreferrer';a.title=item.title;host.append(a);});
 if(!rows.length)host.append(el('span','sk-creator-muted','آپ کے Official channel links یہاں نظر آئیں گے۔'));
 const youtube=rows.find(x=>x.platform==='youtube'&&x.featured_video_url);
 if(youtube){const src=videoEmbed('youtube',youtube.featured_video_url);if(src){const wrap=el('div','sk-creator-featured-player sk-creator-featured-poster'),button=el('button','sk-creator-featured-play','▶ Play my YouTube video');button.type='button';button.addEventListener('click',()=>{const frame=document.createElement('iframe');frame.src=src;frame.title='Owner featured YouTube video';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';wrap.replaceChildren(frame);});wrap.append(button);player.append(wrap);featured.hidden=false;}else featured.hidden=true;}else featured.hidden=true;
}
function renderMembers(items){
 const videos=$('skCreatorMemberVideos'),channels=$('skCreatorMemberChannels');videos.replaceChildren();channels.replaceChildren();
 const approvedVideos=(items||[]).filter(x=>x.content_type==='video').sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
 const approvedChannels=(items||[]).filter(x=>x.content_type==='channel').sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
 approvedVideos.forEach(x=>videos.append(makeVideo(x)));if(!approvedVideos.length)videos.append(el('p','sk-creator-muted','ابھی کوئی ممبر ویڈیو منظور نہیں ہوئی۔'));
 approvedChannels.forEach(x=>{const a=el('a','sk-creator-owner-link',platformLabel(x.platform)+' · '+x.title);a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';channels.append(a);});if(!approvedChannels.length)channels.append(el('p','sk-creator-muted','ابھی کوئی ممبر چینل منظور نہیں ہوا۔'));
}
async function loadPublic(db){
 const [channels,videos]=await Promise.all([
  db.from('sk_creator_channels').select('platform,title,channel_url,featured_video_url').eq('enabled',true),
  db.from('sk_creator_submissions').select('id,content_type,platform,title,url,is_trending,trend_order,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(60)
 ]);
 if(channels.error||videos.error){say('Creator Hub database error: '+(channels.error?.message||videos.error?.message));return;}
 renderOwner(channels.data||[]);renderMembers(videos.data||[]);
}
async function checkAdmin(db){
 const r=await db.rpc('sk_is_admin');state.isAdmin=!r.error&&r.data===true;$('skCreatorAdmin').hidden=!state.isAdmin;$('skCreatorMemberSubmit').hidden=!state.user;$('skCreatorLoginHint').hidden=!!state.user;if(state.isAdmin)await loadAdmin(db);
}
async function loadAdmin(db){
 const queue=$('skCreatorQueue');
 const [pending,channels]=await Promise.all([
  db.from('sk_creator_submissions').select('id,user_id,content_type,platform,title,url,created_at').eq('status','pending').order('created_at',{ascending:false}).limit(100),
  db.from('sk_creator_channels').select('platform,title,channel_url,featured_video_url')
 ]);
 if(pending.error){say('Admin queue load نہیں ہوئی: '+pending.error.message);return;}
 queue.replaceChildren();if(!pending.data?.length)queue.append(el('p','sk-creator-muted','کوئی نئی درخواست نہیں۔'));
 (pending.data||[]).forEach(item=>{const row=el('article','sk-creator-admin-item'),info=el('div','',item.title+' · '+platformLabel(item.platform)+' · '+item.content_type),link=el('a','','Submitted link ↗');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';const actions=el('div','sk-creator-admin-actions');
  [['Approve','approved',false],['Approve as Trending','approved',true],['Reject','rejected',false]].forEach(([label,status,trending])=>{const b=el('button','',label);b.type='button';b.addEventListener('click',async()=>{b.disabled=true;const update=await db.from('sk_creator_submissions').update({status,is_trending:trending,trend_order:trending?10:1000,reviewed_at:new Date().toISOString()}).eq('id',item.id);if(update.error){say('Update failed: '+update.error.message);b.disabled=false;return;}say('درخواست کا فیصلہ محفوظ ہوگیا۔');await loadAdmin(db);await loadPublic(db);});actions.append(b);});row.append(info,link,actions);queue.append(row);
 });
 const host=$('skCreatorChannelSettings');host.replaceChildren();const current=new Map((channels.data||[]).map(x=>[x.platform,x]));
 ['youtube','tiktok','facebook'].forEach(platform=>{const label=el('label','',platformLabel(platform)+' channel/page URL'),input=el('input','');input.type='url';input.placeholder='https://…';input.value=current.get(platform)?.channel_url||'';input.dataset.platform=platform;label.append(input);host.append(label);
  if(platform==='youtube'){const fl=el('label','','Featured YouTube video URL (direct play)'),fi=el('input','');fi.type='url';fi.placeholder='https://www.youtube.com/watch?v=…';fi.value=current.get(platform)?.featured_video_url||'';fi.dataset.featuredVideo='youtube';fl.append(fi);host.append(fl);}
 });
}
async function saveChannels(){
 const db=state.db;if(!state.isAdmin||!db)return;const rows=[...$('skCreatorChannelSettings').querySelectorAll('input[data-platform]')],payload=[],remove=[];
 const featured=$('skCreatorChannelSettings').querySelector('[data-featured-video="youtube"]')?.value.trim()||'';
 if(featured&&!platformUrlAllowed('youtube',featured)){say('Featured video کے لیے درست YouTube ویڈیو URL دیں۔');return;}
 for(const input of rows){const platform=input.dataset.platform,url=input.value.trim();if(!url){remove.push(platform);continue;}if(!platformUrlAllowed(platform,url)){say('ہر چینل کے لیے اسی پلیٹ فارم کا درست HTTPS لنک دیں۔');return;}payload.push({platform,title:platformLabel(platform)+' · Official',channel_url:url,featured_video_url:platform==='youtube'?(featured||null):null,enabled:true,updated_at:new Date().toISOString()});}
 if(payload.length){const r=await db.from('sk_creator_channels').upsert(payload,{onConflict:'platform'});if(r.error){say('Channel links محفوظ نہیں ہوئے: '+r.error.message);return;}}
 for(const platform of remove){const r=await db.from('sk_creator_channels').delete().eq('platform',platform);if(r.error){say('Channel link حذف نہیں ہوا: '+r.error.message);return;}}
 say('آپ کے Official links اور Featured video محفوظ ہوگئے۔');await loadPublic(db);
}
async function loadRegisteredMembers(){
 if(!state.isAdmin||!state.db)return;const host=$('skCreatorRegisteredMembers');host.hidden=false;host.replaceChildren(el('p','sk-creator-muted','Members کی فہرست لوڈ ہو رہی ہے…'));
 const r=await state.db.from('sk_profiles').select('id,email,role,created_at').eq('role','member').order('created_at',{ascending:false}).limit(500);
 host.replaceChildren();if(r.error){host.append(el('p','sk-creator-muted','Members کی فہرست نہیں کھل سکی: '+r.error.message));return;}
 const rows=r.data||[];host.append(el('p','sk-creator-muted','Registered members: '+rows.length));
 rows.forEach((member,index)=>{const row=el('div','sk-creator-member-row');row.append(el('b','',String(index+1)+'. '+(member.email||'Email not available')),el('span','',member.created_at?new Date(member.created_at).toLocaleDateString():'Date unavailable'));host.append(row);});
 if(!rows.length)host.append(el('p','sk-creator-muted','ابھی کوئی registered member موجود نہیں۔'));
}
async function submit(event){
 event.preventDefault();if(!state.db||!state.user){say('لنک بھیجنے سے پہلے Member Login کریں۔');return;}const form=event.currentTarget,button=form.querySelector('button[type=submit]');button.disabled=true;
 try{const platform=$('skCreatorPlatform').value,type=$('skCreatorType').value,url=safeUrl($('skCreatorUrl').value.trim()),title=$('skCreatorTitle').value.trim();if(!url)throw new Error('درست HTTPS لنک درج کریں۔');if(!platformUrlAllowed(platform,url))throw new Error('منتخب پلیٹ فارم اور لنک آپس میں مطابقت نہیں رکھتے۔');const r=await state.db.from('sk_creator_submissions').insert({user_id:state.user.id,content_type:type,platform,title,url,status:'pending',is_trending:false});if(r.error)throw r.error;form.reset();say('آپ کا لنک Admin کو بھیج دیا گیا ہے۔ منظوری سے پہلے ہوم پیج پر نظر نہیں آئے گا۔');}
 catch(e){say(e.message||'لنک جمع نہیں ہوسکا۔');}finally{button.disabled=false;}
}
async function init(){
 const db=window.SK_SUPABASE_CLIENT;if(!db){say('SK database connect ہونے کے بعد Creator Hub فعال ہوگا۔');return;}state.db=db;const auth=await db.auth.getUser();state.user=auth.data?.user||null;await checkAdmin(db);await loadPublic(db);
 if(!state.authBound){state.authBound=true;db.auth.onAuthStateChange((_event,session)=>{setTimeout(async()=>{state.user=session?.user||null;await checkAdmin(db);await loadPublic(db);},0);});}
 if(state.isAdmin&&!state.realtime){state.realtime=db.channel('sk-creator-admin-queue').on('postgres_changes',{event:'*',schema:'public',table:'sk_creator_submissions'},()=>loadAdmin(db)).subscribe();}
}
$('skCreatorForm')?.addEventListener('submit',submit);$('skCreatorSaveChannels')?.addEventListener('click',saveChannels);$('skCreatorRefresh')?.addEventListener('click',()=>state.db&&loadAdmin(state.db));
$('skCreatorMembersToggle')?.addEventListener('click',async()=>{const panel=$('skCreatorRegisteredMembers'),open=panel.hidden;panel.hidden=!open;$('skCreatorMembersToggle').setAttribute('aria-expanded',String(open));$('skCreatorMembersToggle').textContent=open?'Refresh registered members':'Open registered members';if(open)await loadRegisteredMembers();});
window.addEventListener('sk:database-ready',()=>init());let attempts=0;const wait=()=>{if(window.SK_SUPABASE_CLIENT){init();return;}if(++attempts<30)setTimeout(wait,1000);};wait();
})();