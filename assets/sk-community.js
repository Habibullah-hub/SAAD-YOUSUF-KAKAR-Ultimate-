/* SK CYBER HUB — community social feed v1 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const root=$('skCommunityPanel');if(!root)return;
let db=null,user=null,activeTab='feed',busy=false;
const say=t=>{const n=$('skCommunityStatus');if(n)n.textContent=t;};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch(_){return '';}};
const shortDate=value=>{try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch(_){return '';}};
const escName=p=>p?.display_name||'SK Member';
function currentDb(){return window.SK_SUPABASE_CLIENT||window.skSupabaseClient||null;}
async function syncSession(){
 db=currentDb();if(!db){user=null;renderSignedOut();return;}
 const {data}=await db.auth.getSession();user=data?.session?.user||null;
 if(user){const {data:p}=await db.from('sk_profiles').select('role,display_name,bio').eq('id',user.id).maybeSingle();if(p?.role==='admin')user=null;else if(p){$('skCommunityProfileName').value=p.display_name||'';$('skCommunityProfileBio').value=p.bio||'';}}
 updateComposer();await loadFeed();
}
function renderSignedOut(){updateComposer();loadFeed();}
function updateComposer(){
 const signed=!!user;
 $('skCommunityPostText').disabled=!signed;
 $('skCommunityPhoto').disabled=!signed;
 $('skCommunityVideoUrl').disabled=!signed;
 $('skCommunityVisibility').disabled=!signed;
 $('skCommunityPublish').disabled=!signed;
 $('skCommunityProfileName').disabled=!signed;
 $('skCommunityProfileBio').disabled=!signed;
 $('skCommunityProfileSave').disabled=!signed;
 if(!signed)say('فوٹو، پوسٹ، لائک، کمنٹ اور فالو کرنے کے لیے مفت Member Login کریں۔');
}
async function compressImage(file){
 if(!file||!/^image\/(jpeg|png|webp)$/i.test(file.type))throw new Error('صرف JPEG، PNG یا WebP تصویر منتخب کریں۔');
 if(file.size>8*1024*1024)throw new Error('تصویر 8 MB سے چھوٹی ہونی چاہیے۔');
 if(!('createImageBitmap'in window))return file;
 const bitmap=await createImageBitmap(file);const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.78));
 if(!blob)return file;return new File([blob],'photo.webp',{type:'image/webp'});
}
async function publish(){
 if(!db||!user||busy)return;
 const body=$('skCommunityPostText').value.trim(),file=$('skCommunityPhoto').files?.[0],video=safeUrl($('skCommunityVideoUrl').value.trim()),visibility=$('skCommunityVisibility').value;
 if(!body&&!file&&!video){say('پوسٹ میں کچھ لکھیں یا تصویر / ویڈیو لنک شامل کریں۔');return;}
 if($('skCommunityVideoUrl').value.trim()&&!video){say('ویڈیو لنک صرف درست HTTPS URL ہونا چاہیے۔');return;}
 busy=true;$('skCommunityPublish').disabled=true;say('آپ کی پوسٹ محفوظ ہو رہی ہے…');
 let mediaPath=null;
 try{
  if(file){
   const image=await compressImage(file);
   const ext=image.type==='image/webp'?'webp':(image.type==='image/png'?'png':'jpg');
   mediaPath=user.id+'/'+crypto.randomUUID()+'.'+ext;
   const up=await db.storage.from('sk-community-media').upload(mediaPath,image,{cacheControl:'31536000',upsert:false,contentType:image.type});
   if(up.error)throw up.error;
  }
  const result=await db.from('sk_posts').insert({author_id:user.id,body,media_path:mediaPath,media_alt:$('skCommunityPhotoAlt').value.trim().slice(0,180),video_url:video||null,visibility,status:'published'});
  if(result.error)throw result.error;
  $('skCommunityPostText').value='';$('skCommunityPhoto').value='';$('skCommunityPhotoAlt').value='';$('skCommunityVideoUrl').value='';
  say('پوسٹ شائع ہوگئی۔');await loadFeed();
 }catch(e){if(mediaPath)await db.storage.from('sk-community-media').remove([mediaPath]);say('پوسٹ محفوظ نہیں ہوئی: '+(e.message||'براہِ کرم دوبارہ کوشش کریں۔'));}
 finally{busy=false;$('skCommunityPublish').disabled=!user;}
}
async function loadFeed(){
 if(!db){$('skCommunityFeed').replaceChildren(el('div','sk-social-empty','Database connect کرنے کے بعد یہاں حقیقی ممبرز کی پوسٹس نظر آئیں گی۔'));return;}
 const feed=$('skCommunityFeed');feed.replaceChildren(el('div','sk-social-muted','Feed لوڈ ہو رہی ہے…'));
 try{
  let followed=[];
  if(user){const f=await db.from('sk_follows').select('following_id').eq('follower_id',user.id);if(!f.error)followed=(f.data||[]).map(x=>x.following_id);}
  let query=db.from('sk_posts').select('*').eq('status','published').order('created_at',{ascending:false}).limit(30);
  if(activeTab==='following'){if(!user){feed.replaceChildren(el('div','sk-social-empty','Following feed کے لیے پہلے Member Login کریں۔'));return;}if(!followed.length){feed.replaceChildren(el('div','sk-social-empty','آپ نے ابھی کسی کو Follow نہیں کیا۔'));return;}query=query.in('author_id',followed);}
  if(activeTab==='saved'){if(!user){feed.replaceChildren(el('div','sk-social-empty','Saved posts دیکھنے کے لیے Member Login کریں۔'));return;}const saved=await db.from('sk_saved_posts').select('post_id').eq('user_id',user.id);const ids=(saved.data||[]).map(x=>x.post_id);if(!ids.length){feed.replaceChildren(el('div','sk-social-empty','ابھی کوئی پوسٹ محفوظ نہیں۔'));return;}query=query.in('id',ids);}
  const {data:posts,error}=await query;if(error)throw error;
  if(!posts?.length){feed.replaceChildren(el('div','sk-social-empty',activeTab==='following'?'Following creators کی نئی پوسٹس یہاں آئیں گی۔':'ابھی کوئی عوامی پوسٹ نہیں۔ پہلی پوسٹ آپ کر سکتے ہیں!'));return;}
  const ids=[...new Set(posts.map(p=>p.author_id))],postIds=posts.map(p=>p.id);
  const [profiles,likes,comments,myLikes,mySaves]=await Promise.all([
   db.from('sk_public_profiles').select('id,display_name,avatar_url,bio').in('id',ids),
   db.from('sk_post_likes').select('post_id').in('post_id',postIds),
   db.from('sk_post_comments').select('post_id').in('post_id',postIds).eq('status','published'),
   user?db.from('sk_post_likes').select('post_id').eq('user_id',user.id).in('post_id',postIds):Promise.resolve({data:[]}),
   user?db.from('sk_saved_posts').select('post_id').eq('user_id',user.id).in('post_id',postIds):Promise.resolve({data:[]})
  ]);
  const pm=new Map((profiles.data||[]).map(x=>[x.id,x])),count=(arr,id)=>((arr||[]).filter(x=>x.post_id===id).length);
  const liked=new Set((myLikes.data||[]).map(x=>x.post_id)),saved=new Set((mySaves.data||[]).map(x=>x.post_id)),followSet=new Set(followed);
  feed.replaceChildren(...posts.map(post=>makePost(post,pm.get(post.author_id),count(likes.data,post.id),count(comments.data,post.id),liked.has(post.id),saved.has(post.id),followSet.has(post.author_id))));
 }catch(e){feed.replaceChildren(el('div','sk-social-empty','سوشل فیڈ ابھی تیار نہیں: '+(e.message||'Database setup مکمل کریں۔')));}
}
function makePost(post,profile,likeCount,commentCount,liked,saved,isFollowing){
 const card=el('article','sk-social-post');card.dataset.postId=post.id;
 const head=el('div','sk-social-post-head'),avatar=el('div','sk-social-avatar');
 if(profile?.avatar_url){const im=el('img');im.src=safeUrl(profile.avatar_url);im.alt='';avatar.append(im);}else avatar.textContent=(escName(profile).trim()[0]||'S').toUpperCase();
 const ident=el('div');ident.append(el('div','sk-social-name',escName(profile)),el('div','sk-social-date',shortDate(post.created_at)+(post.visibility==='followers'?' · Followers':' · Public')));
 head.append(avatar,ident);
 if(user&&user.id!==post.author_id){const follow=el('button','secondary',isFollowing?'Following':'Follow +');follow.type='button';follow.style.marginLeft='auto';follow.addEventListener('click',()=>toggleFollow(post.author_id,isFollowing,follow));head.append(follow);}
 card.append(head);
 if(post.body)card.append(el('p','sk-social-post-body',post.body));
 if(post.media_path){const {data}=db.storage.from('sk-community-media').getPublicUrl(post.media_path);const im=el('img','sk-social-media');im.src=data.publicUrl;im.alt=post.media_alt||'Shared community photo';im.loading='lazy';card.append(im);}
 if(post.video_url){const a=el('a','sk-social-muted','▶ اصل ویڈیو کھولیں ↗');a.href=safeUrl(post.video_url);a.target='_blank';a.rel='noopener noreferrer';card.append(a);}
 const actions=el('div','sk-social-actions');
 const like=el('button',liked?'is-active':'',(liked?'♥':'♡')+' Like · '+likeCount);like.type='button';like.addEventListener('click',()=>toggleLike(post.id,liked,like));if(!user)like.disabled=true;
 const comment=el('button','','Comment · '+commentCount);comment.type='button';comment.addEventListener('click',()=>toggleComments(post.id,card));
 const save=el('button',saved?'is-active':'',(saved?'Saved ✓':'Save'));save.type='button';save.disabled=!user;save.addEventListener('click',()=>toggleSave(post.id,saved,save));
 const share=el('button','','Share ↗');share.type='button';share.addEventListener('click',()=>sharePost(post));
 const report=el('button','','Report');report.type='button';report.disabled=!user||user.id===post.author_id;report.addEventListener('click',()=>reportPost(post.id));
 actions.append(like,comment,save,share,report);
 if(user?.id===post.author_id||user?.id){if(user?.id===post.author_id){const del=el('button','','Delete');del.type='button';del.addEventListener('click',()=>deletePost(post));actions.append(del);}}
 card.append(actions);return card;
}
async function toggleLike(id,liked,button){if(!user)return;say('');button.disabled=true;const r=liked?await db.from('sk_post_likes').delete().eq('post_id',id).eq('user_id',user.id):await db.from('sk_post_likes').insert({post_id:id,user_id:user.id});if(r.error)say(r.error.message);await loadFeed();}
async function toggleSave(id,saved,button){if(!user)return;const r=saved?await db.from('sk_saved_posts').delete().eq('post_id',id).eq('user_id',user.id):await db.from('sk_saved_posts').insert({post_id:id,user_id:user.id});if(r.error)say(r.error.message);await loadFeed();}
async function toggleFollow(id,following,button){if(!user)return;button.disabled=true;const r=following?await db.from('sk_follows').delete().eq('follower_id',user.id).eq('following_id',id):await db.from('sk_follows').insert({follower_id:user.id,following_id:id});if(r.error)say(r.error.message);await loadFeed();}
async function toggleComments(postId,card){
 let box=card.querySelector('.sk-social-comment-list');if(box){box.remove();return;}
 box=el('div','sk-social-comment-list');box.append(el('div','sk-social-muted','Comments لوڈ ہو رہے ہیں…'));card.append(box);
 const {data,error}=await db.from('sk_post_comments').select('id,author_id,body,created_at').eq('post_id',postId).eq('status','published').order('created_at').limit(30);
 if(error){box.replaceChildren(el('div','sk-social-muted',error.message));return;}
 box.replaceChildren();
 const ids=[...new Set((data||[]).map(x=>x.author_id))];let profiles=[];
 if(ids.length){const r=await db.from('sk_public_profiles').select('id,display_name').in('id',ids);profiles=r.data||[];}
 const map=new Map(profiles.map(p=>[p.id,p.display_name]));
 (data||[]).forEach(c=>box.append(el('p','sk-social-comment',(map.get(c.author_id)||'Member')+': '+c.body)));
 if(!data?.length)box.append(el('p','sk-social-muted','ابھی کوئی کمنٹ نہیں۔'));
 const form=el('form','sk-social-controls'),input=el('input');input.placeholder=user?'اپنا کمنٹ لکھیں…':'کمنٹ کے لیے لاگ اِن کریں';input.maxLength=800;input.disabled=!user;
 const send=el('button','','Send');send.type='submit';send.disabled=!user;form.append(input,send);
 form.addEventListener('submit',async e=>{e.preventDefault();const body=input.value.trim();if(!body||!user)return;send.disabled=true;const r=await db.from('sk_post_comments').insert({post_id:postId,author_id:user.id,body});if(r.error)say(r.error.message);else{input.value='';await toggleComments(postId,card);await loadFeed();}});box.append(form);
}
async function sharePost(post){const url=location.origin+location.pathname+'#community';const text=(post.body||'A post on SK Cyber Hub').slice(0,220);try{if(navigator.share)await navigator.share({title:'SK Cyber Hub Community',text,url});else{await navigator.clipboard.writeText(text+' '+url);say('پوسٹ کا لنک کاپی ہوگیا۔');}}catch(_){}}
async function reportPost(id){const reason=prompt('Report reason: spam, harassment, hate, nudity, copyright, scam, other');if(!reason)return;const allowed=['spam','harassment','hate','nudity','copyright','scam','other'];const r=await db.from('sk_post_reports').insert({post_id:id,reporter_id:user.id,reason:allowed.includes(reason.toLowerCase())?reason.toLowerCase():'other'});say(r.error?'Report نہیں ہوا: '+r.error.message:'شکایت موصول ہوگئی۔ شکریہ۔');}
async function deletePost(post){if(!confirm('کیا آپ اپنی پوسٹ حذف کرنا چاہتے ہیں؟'))return;const r=await db.from('sk_posts').delete().eq('id',post.id).eq('author_id',user.id);if(r.error)say(r.error.message);else{if(post.media_path)await db.storage.from('sk-community-media').remove([post.media_path]);say('پوسٹ حذف ہوگئی۔');}await loadFeed();}
async function saveProfile(){if(!user||!db)return;const name=$('skCommunityProfileName').value.trim().slice(0,40),bio=$('skCommunityProfileBio').value.trim().slice(0,160);if(!name){say('پروفائل نام لکھیں۔');return;}const r=await db.from('sk_profiles').update({display_name:name,bio}).eq('id',user.id);say(r.error?'پروفائل محفوظ نہیں ہوا: '+r.error.message:'پروفائل اپ ڈیٹ ہوگیا۔');}
function init(){
 $('skCommunityPostText')?.addEventListener('input',e=>{$('skCommunityCharCount').textContent=e.target.value.length+' / 2000';});
 $('skCommunityPublish')?.addEventListener('click',publish);
 $('skCommunityRefresh')?.addEventListener('click',loadFeed);
 $('skCommunityProfileSave')?.addEventListener('click',saveProfile);
 root.querySelectorAll('[data-sk-social-tab]').forEach(b=>b.addEventListener('click',()=>{activeTab=b.dataset.skSocialTab;root.querySelectorAll('[data-sk-social-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));loadFeed();}));
 window.addEventListener('sk:database-ready',()=>{db=currentDb();syncSession();});
 db=currentDb();if(db){db.auth.onAuthStateChange(()=>setTimeout(syncSession,0));syncSession();}
 else{window.addEventListener('load',()=>{db=currentDb();if(db)syncSession();});}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();