/* SK Digital Workbench — local-only preferences and tools */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const cards=[...document.querySelectorAll('.sk-wb-card[data-wb-id]')];
 if(!cards.length)return;
 const savedKey='sk-workbench-saved-v1',recentKey='sk-workbench-recent-v1',notesKey='sk-workbench-notes-v1';
 const safeRead=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value??fallback;}catch(_){return fallback;}};
 const safeWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){return false;}};
 let saved=new Set(safeRead(savedKey,[])),recent=safeRead(recentKey,[]),mode='all';
 const gridParents=[...new Set(cards.map(card=>card.parentElement))];
 function render(){
  const query=($('skWorkbenchSearch')?.value||'').trim().toLowerCase();
  cards.forEach(card=>{
   const id=card.dataset.wbId,text=(card.dataset.wbName+' '+card.dataset.wbKeywords+' '+card.dataset.wbCategory).toLowerCase();
   const matches=query===''||text.includes(query),allowed=mode==='all'||(mode==='saved'&&saved.has(id))||(mode==='recent'&&recent.includes(id));
   card.hidden=!(matches&&allowed);
   const button=card.querySelector('.sk-wb-save');
   if(button){const active=saved.has(id);button.setAttribute('aria-pressed',String(active));button.textContent=active?'★':'☆';button.setAttribute('aria-label',(active?'Remove saved ':'Save ')+(card.dataset.wbName||'tool'));}
  });
  gridParents.forEach(parent=>{const hasVisible=[...parent.querySelectorAll('.sk-wb-card')].some(card=>!card.hidden);let empty=parent.querySelector('.sk-wb-empty');if(!hasVisible){if(!empty){empty=document.createElement('p');empty.className='sk-wb-empty';parent.appendChild(empty);}empty.textContent=mode==='saved'?'No saved tools yet. Tap ☆ on a tool to save it.':mode==='recent'?'No recently opened tools yet. Open a tool to see it here.':'No matching tools. Try another search.';}else if(empty)empty.remove();});
 }
 $('skWorkbenchSearch')?.addEventListener('input',render);
 $('skWorkbenchShowAll')?.addEventListener('click',()=>{mode='all';render();});
 $('skWorkbenchShowSaved')?.addEventListener('click',()=>{mode='saved';render();});
 $('skWorkbenchShowRecent')?.addEventListener('click',()=>{mode='recent';render();});
 cards.forEach(card=>{
  const id=card.dataset.wbId;
  card.querySelector('.sk-wb-save')?.addEventListener('click',()=>{if(saved.has(id))saved.delete(id);else saved.add(id);safeWrite(savedKey,[...saved]);render();});
  card.querySelector('a')?.addEventListener('click',()=>{recent=[id,...recent.filter(item=>item!==id)].slice(0,12);safeWrite(recentKey,recent);});
 });
 const notes=$('skWorkbenchNotes'),notesStatus=$('skWorkbenchNotesStatus');
 if(notes){try{notes.value=localStorage.getItem(notesKey)||'';}catch(_){}
  notes.addEventListener('input',()=>{try{localStorage.setItem(notesKey,notes.value);if(notesStatus)notesStatus.textContent='Saved on this device only.';}catch(_){if(notesStatus)notesStatus.textContent='Browser storage is unavailable. Copy your notes to keep them.';}});
 }
 $('skWorkbenchClearNotes')?.addEventListener('click',()=>{if(notes)notes.value='';try{localStorage.removeItem(notesKey);if(notesStatus)notesStatus.textContent='Local notes cleared.';}catch(_){if(notesStatus)notesStatus.textContent='Could not clear browser storage.';}});
 const prompt=$('skWorkbenchPrompt'),promptStatus=$('skWorkbenchPromptStatus');
 $('skWorkbenchCopyPrompt')?.addEventListener('click',async()=>{const value=(prompt?.value||'').trim();if(!value){if(promptStatus)promptStatus.textContent='پہلے اپنا سوال لکھیں۔';return;}try{await navigator.clipboard.writeText(value);if(promptStatus)promptStatus.textContent='Prompt copied. Open an AI service and paste it yourself.';}catch(_){if(promptStatus)promptStatus.textContent='Clipboard permission unavailable. Select the prompt text and copy it manually.';}});
 render();
})();