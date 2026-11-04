/* SK CYBER HUB — public read-only posts v1.
   Anon/publishable key only (window.SK_SUPABASE_CLIENT). SELECT only. No writes, no service role. */
(()=>{'use strict';
const panel=document.getElementById('skCommunityPanel');
const anchor=document.getElementById('skCommunityFeed');
if(!panel||!anchor||anchor.parentNode!==panel||document.getElementById('skPublicPosts'))return;
const COLUMNS='id,body,created_at';
const LIMIT=20;
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const when=v=>{try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));}catch(_){return '';}};
const box=el('section','sk-public-posts');
box.id='skPublicPosts';
box.setAttribute('aria-live','polite');
box.setAttribute('aria-label','Public posts');
const head=el('h4','sk-social-name','عوامی پوسٹس · Public posts');
const list=el('div');
box.append(head,list);
panel.insertBefore(box,anchor);
let running=false,again=false,runningWith=null,loadedWith=null;
function note(text,retry){
 const wrap=el('div','sk-social-empty');
 wrap.append(el('p','sk-social-muted',text));
 if(retry){const b=el('button','secondary','دوبارہ کوشش کریں');b.type='button';b.addEventListener('click',load);wrap.append(b);}
 list.replaceChildren(wrap);
}
async function load(){
 const db=window.SK_SUPABASE_CLIENT||null;
 if(running){if(db!==runningWith)again=true;return;}
 running=true;runningWith=db;
 try{
  if(!db){note('ڈیٹابیس ابھی جڑا نہیں۔ انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔',true);return;}
  note('پوسٹس لوڈ ہو رہی ہیں…');
  const {data,error}=await db.from('sk_posts').select(COLUMNS).eq('visibility','public').order('created_at',{ascending:false}).limit(LIMIT);
  if(error)throw error;
  loadedWith=db;
  if(!data||!data.length){note('ابھی کوئی عوامی پوسٹ نہیں۔');return;}
  list.replaceChildren(...data.map(card));
 }catch(e){
  loadedWith=null;
  note('عوامی پوسٹس ابھی لوڈ نہیں ہو سکیں۔',true);
  console.warn('SK public posts load failed:',e&&e.message?e.message:e);
 }finally{
  running=false;runningWith=null;
  if(again){again=false;load();}
 }
}
function card(post){
 const a=el('article','sk-social-post');
 a.dataset.publicPostId=String(post.id);
 a.append(el('div','sk-social-date',(when(post.created_at)||'')+' · Public'));
 a.append(el('p','sk-social-post-body',String(post.body||'')));
 return a;
}
function onReady(){const db=window.SK_SUPABASE_CLIENT||null;if(db&&db===loadedWith)return;load();}
window.addEventListener('sk:database-ready',onReady);
load();
})();