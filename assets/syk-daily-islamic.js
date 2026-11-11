/* SYK Daily Quran reminder — QuranEnc Urdu Junagarhi v1.1.3 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const root=$('sykDailyNaseeha');if(!root)return;
const verses=[[2,286],[3,134],[17,23],[49,12],[2,153],[4,36],[3,159],[14,7],[94,5],[65,2],[16,90],[39,53],[29,69],[13,28],[2,152],[5,8],[31,18],[24,22]];
let busy=false,lastKey='syk-daily-verse-index-v1',client=null,authBound=false;
function nextVerse(){
 let previous=-1;try{previous=Number(sessionStorage.getItem(lastKey));}catch(_){}
 let index=Math.floor(Math.random()*verses.length);
 if(verses.length>1&&index===previous)index=(index+1+Math.floor(Math.random()*(verses.length-1)))%verses.length;
 try{sessionStorage.setItem(lastKey,String(index));}catch(_){}
 return verses[index];
}
function text(id,value){const n=$(id);if(n)n.textContent=value||'';}
function status(message){$('sykDailyLoading').hidden=false;text('sykDailyLoading',message);$('sykDailyContent').hidden=true;}
async function json(url){const r=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});if(!r.ok)throw new Error('Source unavailable ('+r.status+')');return r.json();}
async function render(){
 if(busy)return;busy=true;status('آج کی آیت اور اردو ترجمہ حاصل کیا جا رہا ہے…');
 const [sura,aya]=nextVerse();
 try{
  const payload=await json('https://quranenc.com/api/v1/translation/aya/urdu_junagarhi/'+sura+'/'+aya);
  const item=Array.isArray(payload)?payload[0]:(payload.result?.[0]||payload.data?.[0]||payload.result||payload);
  const translation=String(item?.translation||'').trim();
  let arabic='';
  try{const q=await json('https://api.alquran.cloud/v1/ayah/'+sura+':'+aya+'/quran-uthmani');arabic=String(q?.data?.text||'').trim();}catch(_){}
  if(!arabic)arabic=String(item?.arabic_text||item?.arabic||item?.text_uthmani||'').trim();
  if(!arabic||!translation)throw new Error('آیت کا مکمل مستند متن دستیاب نہیں ہوا۔');
  const arabicNode=$('sykDailyArabic');if(arabicNode){arabicNode.textContent=arabic;arabicNode.setAttribute('dir','rtl');arabicNode.setAttribute('lang','ar');}
  text('sykDailyReference','سورۃ نمبر '+sura+' · آیت '+aya);
  text('sykDailyTranslation',translation);
  const note=String(item?.footnotes||'').trim();
  const foot=$('sykDailyFootnote');foot.hidden=!note;text('sykDailyFootnote',note);
  $('sykDailySource').href='https://quranenc.com/ur/browse/urdu_junagarhi/'+sura+'/'+aya;
  $('sykDailyTranslation').hidden=false;
  $('sykDailyTranslationToggle').textContent='ترجمہ چھپائیں';
  $('sykDailyTranslationToggle').setAttribute('aria-expanded','true');
  $('sykDailyLoading').hidden=true;const content=$('sykDailyContent');content.hidden=false;content.classList.remove('is-open');const fold=$('sykDailyFoldToggle');if(fold){fold.setAttribute('aria-expanded','false');fold.innerHTML='آیت کھولیں <span aria-hidden="true">⌄</span>';}
 }catch(error){
  status('آج کی نصیحت لوڈ نہیں ہو سکی۔ انٹرنیٹ چیک کرکے دوبارہ کوشش کریں۔');
 }finally{busy=false;}
}
function bindAuth(){
 const next=window.SK_SUPABASE_CLIENT||null;if(!next||authBound)return;
 client=next;authBound=true;
 client.auth.onAuthStateChange((event)=>{
  if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='USER_UPDATED')setTimeout(render,0);
 });
}
const foldButton=$('sykDailyFoldToggle');
foldButton?.addEventListener('click',()=>{
 const content=$('sykDailyContent');if(!content||content.hidden)return;
 const open=!content.classList.contains('is-open');content.classList.toggle('is-open',open);
 foldButton.setAttribute('aria-expanded',String(open));
 foldButton.innerHTML=open?'آیت بند کریں <span aria-hidden="true">⌃</span>':'آیت کھولیں <span aria-hidden="true">⌄</span>';
});
$('sykDailyRefresh')?.addEventListener('click',render);
$('sykDailyTranslationToggle')?.addEventListener('click',()=>{
 const n=$('sykDailyTranslation'),b=$('sykDailyTranslationToggle');n.hidden=!n.hidden;
 b.textContent=n.hidden?'ترجمہ دکھائیں':'ترجمہ چھپائیں';b.setAttribute('aria-expanded',String(!n.hidden));
});
window.addEventListener('sk:database-ready',bindAuth);
bindAuth();render();
})();