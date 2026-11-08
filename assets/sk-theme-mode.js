/* SK Cyber Hub — persistent accessible day/night switch */
(()=>{'use strict';
const KEY='sk-cyber-hub-theme';
const root=document.documentElement;
function apply(mode){
 const day=mode==='day';
 root.dataset.skTheme=day?'day':'night';
 document.body?.classList.toggle('sk-day-mode',day);
 const button=document.getElementById('skThemeModeToggle');
 if(button){button.textContent=day?'☀ Day mode':'☾ Night mode';button.setAttribute('aria-pressed',String(day));button.setAttribute('aria-label',day?'Switch to night mode':'Switch to day mode');}
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.content=day?'#edf3f8':'#080b0a';
}
function init(){
 const nav=document.querySelector('.top .nav-actions');
 if(!nav)return;
 let button=document.getElementById('skThemeModeToggle');
 if(!button){button=document.createElement('button');button.type='button';button.id='skThemeModeToggle';button.addEventListener('click',()=>{const next=root.dataset.skTheme==='day'?'night':'day';try{localStorage.setItem(KEY,next)}catch(_){}apply(next)});const easy=document.getElementById('skEasyModeToggle');nav.insertBefore(button,easy||nav.firstChild);}
 let saved='night';try{saved=localStorage.getItem(KEY)||'night'}catch(_){}
 apply(saved);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();