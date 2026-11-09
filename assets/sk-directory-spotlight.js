/* SK Cyber Hub — Directory Spotlight, low-effects mode and safe search routing */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const LOW_KEY='sk-cyber-hub-low-effects';
function init(){
 const panel=$('skMorePanel'),grid=panel?.querySelector('.sk-more-grid'),moreButton=document.querySelector('.sk-bottom-nav [data-sk-more]');
 if(!panel||!grid||panel.dataset.skSpotlightReady==='1')return;
 panel.dataset.skSpotlightReady='1';
 const close=()=>{panel.classList.remove('is-open');moreButton?.setAttribute('aria-expanded','false');panel.hidden=true;};
 const searchWrap=document.createElement('section');searchWrap.id='skDirectorySpotlight';
 const label=document.createElement('label');label.htmlFor='skDirectorySpotlightSearch';label.textContent='DIRECTORY SPOTLIGHT · SEARCH MENU';
 const input=document.createElement('input');input.id='skDirectorySpotlightSearch';input.type='search';input.autocomplete='off';input.placeholder='Apps, Islam360, AI, Creator, News, Settings…';input.setAttribute('aria-label','Search all SK Cyber Hub menu links');input.setAttribute('aria-controls','skMoreGrid');
 const status=document.createElement('p');status.id='skDirectorySpotlightStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent='تمام دستیاب سیکشنز میں فوری تلاش کریں۔';
 searchWrap.append(label,input,status);
 const head=panel.querySelector('.sk-more-panel-head');head?.after(searchWrap);
 grid.id='skMoreGrid';
 const extras=[
  {label:'☪ Islam360 · Quran & Islamic resources',href:'https://webapp.theislam360.com/',keywords:'islam360 islam quran hadith prayer salah deen'},
  {label:'👤 Profile & Community',href:'#community',keywords:'profile account member my profile community'},
  {label:'⚙ Settings & Privacy',href:'#security-privacy',keywords:'settings preferences privacy security'}
 ];
 extras.forEach(item=>{
  if(item.href.startsWith('#')&&!$(item.href.slice(1)))return;
  if([...grid.querySelectorAll('a')].some(a=>a.getAttribute('href')===item.href))return;
  const a=document.createElement('a');a.href=item.href;a.textContent=item.label;a.dataset.spotlightKeywords=item.keywords;a.dataset.spotlightExtra='1';
  if(!item.href.startsWith('#')){a.target='_blank';a.rel='noopener noreferrer';}
  grid.append(a);
 });
 const links=[...grid.querySelectorAll('a')];
 links.forEach(a=>{
  const href=a.getAttribute('href')||'';
  const id=href.startsWith('#')?href.slice(1):'';
  const aliases={
   apps:'apps apk android downloads',
   tools:'ai artificial intelligence tools',
   news:'world news headlines',
   'creator-studio':'creator video studio creator hub',
   'security-privacy':'settings preferences privacy security',
   community:'profile account members social'
  };
  a.dataset.spotlightSearch=(a.textContent+' '+href+' '+(a.dataset.spotlightKeywords||'')+' '+(aliases[id]||'')).toLocaleLowerCase();
  if(a.dataset.skSpotlightBound==='1')return;
  a.dataset.skSpotlightBound='1';
  if(a.dataset.spotlightExtra==='1')a.addEventListener('click',event=>{
   if(a.getAttribute('href')?.startsWith('#')){
    const target=a.getAttribute('href').slice(1);
    if($(target)){event.preventDefault();close();window.skSetView?.(target);}
   }else if(a.href&&new URL(a.href,location.href).origin!==location.origin){
    close();
   }
  });
 });
 function filter(){
  const q=input.value.trim().toLocaleLowerCase();
  const terms=q.split(/\s+/).filter(Boolean);let count=0;
  links.forEach(a=>{
   const hay=a.dataset.spotlightSearch||a.textContent.toLocaleLowerCase();
   const match=!terms.length||terms.every(term=>hay.includes(term));
   a.hidden=!match;if(match)count++;
  });
  status.textContent=q?(count+' matching menu item'+(count===1?'':'s')+' found.'):'تمام دستیاب سیکشنز میں فوری تلاش کریں۔';
 }
 input.addEventListener('input',filter);
 input.addEventListener('keydown',event=>{
  if(event.key==='Escape'){input.value='';filter();input.blur();event.stopPropagation();}
  if(event.key==='Enter'){
   const first=links.find(a=>!a.hidden);
   if(first){event.preventDefault();first.click();}
  }
 });
 panel.addEventListener('transitionend',()=>{if(!panel.hidden&&panel.classList.contains('is-open'))input.focus({preventScroll:true});});
 moreButton?.addEventListener('click',()=>{if(!panel.hidden)input.value='';filter();});
 // The existing More controller owns visibility; focus search after it opens.
 moreButton?.addEventListener('click',()=>{if(panel.classList.contains('is-open'))setTimeout(()=>input.focus({preventScroll:true}),40);});
 const lowButton=document.createElement('button');lowButton.type='button';lowButton.id='skLowEffectsToggle';
 function applyLowEffects(enabled){
  document.body.classList.toggle('sk-low-effects',enabled);
  lowButton.setAttribute('aria-pressed',String(enabled));
  lowButton.textContent=enabled?'✓ Low Effects: ON':'Low Effects: OFF';
  try{localStorage.setItem(LOW_KEY,enabled?'1':'0');}catch(_){}
 }
 let low=false;try{low=localStorage.getItem(LOW_KEY)==='1';}catch(_){}
 lowButton.addEventListener('click',()=>applyLowEffects(!document.body.classList.contains('sk-low-effects')));
 head?.append(lowButton);applyLowEffects(low);
 const profile=document.querySelector('[data-sk-profile]');
 profile?.addEventListener('click',()=>{
  if(typeof window.skSetView==='function')window.skSetView('community');
  profile.setAttribute('aria-current','page');
  setTimeout(()=>{const field=$('skCommunityProfileName');field?.focus({preventScroll:true});field?.scrollIntoView({behavior:document.body.classList.contains('sk-low-effects')?'auto':'smooth',block:'center'});},180);
 });
 // Search result URLs from the command palette open in the branded reader where embedding is permitted.
 document.addEventListener('click',event=>{
  const anchor=event.target.closest('#skHeaderLiveResults a[href],#skGlobalResults a[href]');
  if(!anchor)return;
  let url;try{url=new URL(anchor.href,location.href);}catch(_){return;}
  if(url.origin===location.origin)return;
  if(typeof window.SKReader?.openUrl==='function'){event.preventDefault();window.SKReader.openUrl(url.href);}
 });
 // Header command palette keeps instant directory matches and adds an explicit web/video search route.
 const commandInput=$('search'),live=$('skHeaderLiveResults');
 if(commandInput&&live){
  const footerObserver=new MutationObserver(()=>{
   const old=[...live.querySelectorAll('a')].find(a=>a.textContent.includes('Open SYK Browser'));
   if(old){old.textContent='Search web & videos in SYK Browser ↗';old.setAttribute('aria-label','Search the web and videos inside SYK Browser');}
  });
  footerObserver.observe(live,{childList:true,subtree:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();