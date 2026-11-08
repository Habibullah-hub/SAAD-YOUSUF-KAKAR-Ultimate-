/* SYK Cyber Hub — persistent accessible day/night switch */
(()=>{'use strict';
const KEY='sk-cyber-hub-theme';
const root=document.documentElement;
function apply(mode){
 const day=mode==='day';
 root.dataset.skTheme=day?'day':'night';
 document.body.classList.toggle('sk-day-mode',day);
 const button=document.getElementById('skThemeModeToggle');
 if(button){button.textContent=day?'☀ دن کا موڈ':'☾ رات کا موڈ';button.setAttribute('aria-pressed',String(day));button.setAttribute('aria-label',day?'رات کا موڈ لگائیں':'دن کا موڈ لگائیں');}
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.content=day?'#edf3fa':'#070916';
}
function init(){
 const nav=document.querySelector('.top .nav-actions')||document.querySelector('.top .nav');
 if(!nav)return;
 let button=document.getElementById('skThemeModeToggle');
 if(!button){
  button=document.createElement('button');button.type='button';button.id='skThemeModeToggle';
  button.addEventListener('click',()=>{const next=root.dataset.skTheme==='day'?'night':'day';try{localStorage.setItem(KEY,next)}catch(_){}apply(next);});
  const easy=document.getElementById('skEasyModeToggle');
  if(easy&&easy.parentElement===nav)nav.insertBefore(button,easy.nextSibling);else nav.appendChild(button);
 }
 let saved='night';try{saved=localStorage.getItem(KEY)||'night'}catch(_){}
 apply(saved);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();