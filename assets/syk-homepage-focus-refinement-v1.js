/* SYK Cyber Hub — homepage focus, deduplication and accessibility refinement v1.
   Does not delete records, alter Supabase, or remove existing feature modules. */
(()=>{'use strict';
const start=()=>{
 const body=document.body;if(!body||body.dataset.skHomeRefine==='1')return;
 body.dataset.skHomeRefine='1';body.classList.add('sk-home-refine-v1');
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 const addToggle=(container,items,limit,label)=>{
  if(!container||container.dataset.skToggleReady==='1'||items.length<=limit)return;
  container.dataset.skToggleReady='1';container.classList.add('sk-home-compact-grid');
  items.slice(limit).forEach(el=>el.classList.add('sk-home-overflow-card'));
  const btn=document.createElement('button');btn.type='button';btn.className='sk-home-more-toggle';
  btn.textContent='View all '+items.length+' items';btn.setAttribute('aria-expanded','false');
  btn.addEventListener('click',()=>{
   const expanded=container.classList.toggle('sk-home-expanded');
   btn.setAttribute('aria-expanded',String(expanded));
   btn.textContent=expanded?'Show fewer':('View all '+items.length+' items');
  });
  container.insertAdjacentElement('afterend',btn);
 };
 // Collapse only non-filtered resource lists; all original cards remain in the DOM.
 ['#mod-apk','#software','#documents','#games','#free-tools','#video-audio'].forEach(id=>{
  const section=$(id),grid=section&&$('.resource-grid',section);
  if(grid)addToggle(grid,$$('.tile',grid),4);
 });
 // The dynamic app catalog can be long. Hide only overflow cards, never its data.
 const appGrid=$('#appsGrid');
 if(appGrid){
  const refreshApps=()=>{
   const cards=$('.app-resource, .tile, a.resource',appGrid);
   const empty=$('.empty',appGrid);
   if(empty&&cards.length===0){empty.hidden=true;empty.classList.add('sk-home-deduped');}
   const heading=appGrid.previousElementSibling;
   if(heading&&heading.classList.contains('section-head'))heading.hidden=cards.length===0;
   const old=appGrid.nextElementSibling;
   if(old&&old.classList.contains('sk-home-more-toggle'))old.remove();
   appGrid.classList.remove('sk-home-expanded');appGrid.dataset.skToggleReady='';
   addToggle(appGrid,cards,4);
  };
  refreshApps();
  new MutationObserver(refreshApps).observe(appGrid,{childList:true,subtree:true});
 }
 // Keep one canonical listing and cross-link from the duplicate category.
 const crosslink=(sectionId,title,target,category)=>{
  const section=$(sectionId);if(!section)return;
  const card=$$('a.tile',section).find(a=>$('h3',a)?.textContent.trim().toLowerCase()===title.toLowerCase());
  if(!card||card.dataset.skCrosslinked==='1')return;
  const link=document.createElement('a');link.className='sk-home-crosslink';link.href=target;link.dataset.skView=category;
  link.innerHTML='<b>'+title+'</b><small>Already listed in the dedicated '+category+' section. Open the main listing →</small>';
  card.replaceWith(link);link.dataset.skCrosslinked='1';
 };
 crosslink('#software','VLC Media Player','#video-audio','video-audio');
 crosslink('#free-tools','Google Translate','#languages','languages');
 crosslink('#deals','OpenLearn','#documents','documents');
 // Keep one DeepL listing in AI tools; the repeated alias becomes a compact pointer.
 const ai=$('#tools');if(ai){
  const deepl=$$('a.resource',ai).filter(a=>/deepl\.com\/translator/i.test(a.href));
  if(deepl.length>1)deepl.slice(1).forEach(a=>a.classList.add('sk-home-deduped'));
  const grid=$('.resource-grid',ai);
  if(grid)addToggle(grid,$$('a.resource[data-cost]',grid).filter(a=>!a.classList.contains('sk-home-deduped')),4);
  const filters=$('#skAiFilters',ai);
  filters?.addEventListener('change',()=>{
   const active=($('#skAiCost')?.value||'all')!=='all'||($('#skAiType')?.value||'all')!=='all';
   if(active&&grid){grid.classList.add('sk-home-expanded');const b=grid.nextElementSibling;if(b?.classList.contains('sk-home-more-toggle')){b.textContent='Show fewer';b.setAttribute('aria-expanded','true');}}
  });
 }
 // Smart finder: filters are functional; show a clear count/reset status from its existing live status.
 const smart=$('#smart-free-finder');
 if(smart){
  const status=$('#skSmartFinderStatus',smart),cards=$$('.resource-grid a.resource',smart);
  const update=()=>{if(status){const shown=cards.filter(c=>!c.classList.contains('hidden')).length;status.dataset.skRefineCount='1';if(!status.textContent.includes('Showing'))status.textContent='Showing '+shown+' of '+cards.length+' AI video tools. Use Reset filters to clear your choices.';}};
  ['input','change'].forEach(ev=>smart.addEventListener(ev,e=>{if(e.target.matches('input,select'))setTimeout(update,0);}));
  update();
 }
 // Add a visible World News destination beside the featured preview, without a second news feed.
 const featured=$('#skFeaturedFeed .sk-featured-grid');
 if(featured&&!$('a[href="#news"]',featured)){
  const a=document.createElement('a');a.href='#news';a.dataset.skView='news';a.className='sk-home-news-shortcut';
  a.innerHTML='<b>🌍 World News</b><span>Search topics · Choose language · Read publisher-attributed stories →</span>';
  $('#skFeaturedFeed').append(a);
 }
 // Future Lab becomes a concise roadmap preview; full roadmap remains one tap away.
 const future=$('.syk-future-grid');
 if(future){
  const cards=$$('.sk-future-card',future);
  if(cards.length>2){
   future.classList.add('sk-home-future-compact');
   const b=document.createElement('button');b.type='button';b.className='sk-home-more-toggle';b.textContent='View full Future Lab roadmap';b.setAttribute('aria-expanded','false');
   b.addEventListener('click',()=>{const open=future.classList.toggle('sk-home-expanded');b.textContent=open?'Show concise roadmap':'View full Future Lab roadmap';b.setAttribute('aria-expanded',String(open));});
   future.insertAdjacentElement('afterend',b);
  }
 }
 // Clarify the one existing global search scope; keep its original input and search handler.
 const search=$('.syk-home-header-search');
 if(search&&!$('.sk-search-scope',search)){
  const pill=document.createElement('span');pill.className='sk-search-scope';pill.textContent='SYK Directory';pill.setAttribute('aria-label','Search scope: SYK Cyber Hub directory');search.insertBefore(pill,search.firstChild);
 }
 // Urdu-only paragraphs get correct reading direction; mixed brand/English lines stay auto-directional.
 const urdu=/[\u0600-\u06FF]/g;
 $$('p,small,label,li').forEach(el=>{
  const t=el.textContent.trim(),m=t.match(urdu)||[];
  if(m.length>=8&&m.length>t.replace(/\s/g,'').length*.18&&!el.hasAttribute('dir')){el.setAttribute('dir','rtl');el.setAttribute('lang','ur');}
 });
 const creatorUrdu=$('#skCreatorHub .sk-creator-head>div>p');
 if(creatorUrdu){creatorUrdu.setAttribute('dir','rtl');creatorUrdu.setAttribute('lang','ur');}
 // Keep the full-section menu, but move its trigger into the existing header menu instead of floating over content.
 const more=$('.sk-more-fab'),menu=$('#categoryMenu');
 if(more&&menu&&!more.dataset.skMoved){more.dataset.skMoved='1';more.classList.add('sk-home-more-inline');more.textContent='Browse all sections';menu.appendChild(more);}
 // Do not add a second floating back-to-top; the page already has #skBackTop.
 const extra=$('.sk-home-back-top');if(extra)extra.remove();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();