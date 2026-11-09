/* SK Cyber Hub — in-app search cards (local directory + public Wikipedia summaries) */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const DIRECTORY=[
 {title:'Apps & APKs',desc:'Explore Android apps and approved downloads.',href:'./#apps',keys:'apps apk android downloads'},
 {title:'AI Tools',desc:'Discover AI tools for writing, images and video.',href:'./#tools',keys:'ai artificial intelligence tools'},
 {title:'Creator Studio',desc:'Creator resources and SYK Creator Video Hub.',href:'./#creator-studio',keys:'creator video hub studio'},
 {title:'World News',desc:'Open the World News section inside SK Cyber Hub.',href:'./#news',keys:'news headlines world'},
 {title:'Islam360',desc:'Open the Islam360 Quran and Islamic resources service.',href:'https://webapp.theislam360.com/',keys:'islam360 islam quran hadith prayer salah'},
 {title:'Games',desc:'Explore games and entertainment resources.',href:'./#games',keys:'games play entertainment'},
 {title:'Software',desc:'Browse software and desktop resources.',href:'./#software',keys:'software windows desktop'},
 {title:'Community',desc:'Visit member posts and community features.',href:'./#community',keys:'community members profile'},
 {title:'Privacy & Settings',desc:'Review privacy and platform settings.',href:'./#security-privacy',keys:'settings privacy security'}
];
let panel,input,list,status,requestNo=0;
function ensurePanel(){
 if(panel)return;
 const hero=document.querySelector('#homeView .hero');if(!hero)return;
 panel=document.createElement('section');panel.id='skInAppSearchResults';panel.className='sk-inapp-search section';panel.hidden=true;
 const head=document.createElement('div');head.className='sk-inapp-search-head';
 const title=document.createElement('h2');title.textContent='Search results inside SK Cyber Hub';
 const close=document.createElement('button');close.type='button';close.className='sk-inapp-search-close';close.textContent='Close';close.setAttribute('aria-label','Close search results');
 head.append(title,close);
 status=document.createElement('p');status.className='sk-inapp-search-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 list=document.createElement('div');list.className='sk-inapp-search-grid';
 panel.append(head,status,list);hero.after(panel);
 close.addEventListener('click',()=>{panel.hidden=true;});
}
function card(item){
 const article=document.createElement('article');article.className='sk-inapp-search-card';
 if(item.image){const img=document.createElement('img');img.loading='lazy';img.alt='';img.src=item.image;article.append(img);}
 const body=document.createElement('div');body.className='sk-inapp-search-copy';
 const h=document.createElement('h3');h.textContent=item.title||'Search result';
 const p=document.createElement('p');p.textContent=item.desc||'Open this result inside SK Cyber Hub.';
 const action=document.createElement('button');action.type='button';action.textContent=item.action||'Open result';
 action.addEventListener('click',()=>{
  if(item.external&&window.SKReader?.openUrl){window.SKReader.openUrl(item.href);return;}
  if(item.href)location.href=item.href;
 });
 body.append(h,p,action);article.append(body);return article;
}
function localMatches(q){
 const terms=q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return DIRECTORY.filter(x=>terms.every(t=>(x.title+' '+x.desc+' '+x.keys).toLocaleLowerCase().includes(t)))
  .map(x=>({...x,external:/^https:\/\//.test(x.href),action:/^https:\/\//.test(x.href)?'Open in SK Reader':'Explore inside SK'}));
}
async function encyclopedia(q,seq){
 const lang=(navigator.language||'en').split('-')[0].toLowerCase();
 const wiki=['ur','ar','en'].includes(lang)?lang:'en';
 const endpoint='https://'+wiki+'.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(q)+'&gsrlimit=6&prop=extracts%7Cpageimages%7Cinfo&exintro=1&explaintext=1&exsentences=2&piprop=thumbnail&pithumbsize=360&inprop=url&format=json&origin=*';
 const response=await fetch(endpoint,{headers:{Accept:'application/json'}});
 if(!response.ok)throw new Error('Search provider unavailable');
 const data=await response.json();if(seq!==requestNo)return [];
 return Object.values(data.query?.pages||{}).sort((a,b)=>(a.index||0)-(b.index||0)).map(p=>({
  title:p.title,desc:(p.extract||'Wikipedia article').slice(0,420),href:p.fullurl||('https://'+wiki+'.wikipedia.org/?curid='+p.pageid),
  image:p.thumbnail?.source,external:true,action:'Read inside SK Reader'
 }));
}
async function search(raw){
 const q=String(raw||'').trim();if(!q)return;
 ensurePanel();if(!panel)return;
 const seq=++requestNo;panel.hidden=false;list.replaceChildren();
 const locals=localMatches(q);locals.forEach(x=>list.append(card(x)));
 status.textContent=locals.length+' SK Cyber Hub section result'+(locals.length===1?'':'s')+' found. Looking for article summaries…';
 try{
  const articles=await encyclopedia(q,seq);if(seq!==requestNo)return;
  articles.forEach(x=>list.append(card(x)));
  status.textContent=(locals.length+articles.length)+' in-app result'+(locals.length+articles.length===1?'':'s')+' for “'+q+'”.';
  if(!locals.length&&!articles.length){status.textContent='No matching cards found. Try a shorter keyword or browse the directory.';}
 }catch(_){
  if(seq!==requestNo)return;
  status.textContent=locals.length+' internal result'+(locals.length===1?'':'s')+' found. Article search is temporarily unavailable; no redirect was made.';
  if(!locals.length){const empty=document.createElement('p');empty.className='sk-inapp-search-empty';empty.textContent='No local match. Check your spelling or try again later.';list.append(empty);}
 }
 panel.scrollIntoView({behavior:document.body.classList.contains('sk-low-effects')?'auto':'smooth',block:'start'});
}
window.SKSearch={search};
document.addEventListener('DOMContentLoaded',()=>{
 const q=$('q');
 const initial=new URLSearchParams(location.search).get('q');if(initial&&q){q.value=initial;search(initial);}
});
})();