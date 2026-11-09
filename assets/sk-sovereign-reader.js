/* SK Cyber Hub — Sovereign Reader Shell
 * Branded in-app reader wrapper. External pages may refuse iframe embedding;
 * never bypass publisher security headers or proxy content without permission.
 */
(()=>{'use strict';
const ROOT='./';
const esc=(s)=>String(s||'').slice(0,500);
const safeUrl=(raw)=>{try{const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password)return null;return u;}catch(_){return null;}};
let overlay=null,frame=null,status=null,urlInput=null;
function build(){
 if(overlay)return;
 overlay=document.createElement('section');overlay.className='sk-reader-overlay';overlay.id='skSovereignReader';overlay.hidden=true;
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','SK Cyber Hub embedded reader');
 const top=document.createElement('header');top.className='sk-reader-top';
 const brand=document.createElement('div');brand.className='sk-reader-brand';brand.textContent='SK Cyber Hub — Powered by Yousuf Kakar (YK)';
 const close=document.createElement('button');close.type='button';close.className='sk-reader-close';close.textContent='Close ✕';close.addEventListener('click',hide);
 top.append(brand,close);
 const controls=document.createElement('form');controls.className='sk-reader-controls';
 urlInput=document.createElement('input');urlInput.type='url';urlInput.inputMode='url';urlInput.placeholder='https://publisher.example/article';urlInput.setAttribute('aria-label','HTTPS page address');
 const go=document.createElement('button');go.type='submit';go.textContent='Read inside SYK';
 controls.append(urlInput,go);controls.addEventListener('submit',e=>{e.preventDefault();openUrl(urlInput.value);});
 status=document.createElement('p');status.className='sk-reader-status';status.setAttribute('role','status');status.textContent='Reader حفاظتی sandbox میں ہے۔ کچھ publishers embedding کی اجازت نہیں دیتے۔';
 frame=document.createElement('iframe');frame.className='sk-reader-frame';frame.title='External publisher page inside SK Cyber Hub reader';frame.setAttribute('sandbox','allow-scripts allow-forms allow-same-origin');frame.referrerPolicy='no-referrer';frame.loading='lazy';
 const fallback=document.createElement('div');fallback.className='sk-reader-fallback';
 const msg=document.createElement('p');msg.textContent='اگر صفحہ خالی رہے یا publisher نے embedding بند کی ہو تو یہ اس کی اپنی security policy ہے۔ ہم اسے bypass نہیں کریں گے۔';
 const open=document.createElement('a');open.className='sk-reader-open';open.target='_blank';open.rel='noopener noreferrer';open.textContent='اصل پبلشر کو الگ ٹیب میں کھولیں ↗';open.hidden=true;
 fallback.append(msg,open);
 const bottom=document.createElement('footer');bottom.className='sk-reader-bottom';bottom.textContent='SK Cyber Hub — Powered by Yousuf Kakar (YK) · محفوظ ریڈر';
 overlay.append(top,controls,status,frame,fallback,bottom);document.body.append(overlay);
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
}
function show(){build();overlay.hidden=false;document.body.classList.add('sk-reader-open');const close=overlay.querySelector('.sk-reader-close');close.focus();}
function hide(){if(!overlay)return;overlay.hidden=true;document.body.classList.remove('sk-reader-open');if(frame)frame.src='about:blank';}
function openUrl(raw){
 build();const u=safeUrl(raw);if(!u){status.textContent='صرف درست HTTPS ویب ایڈریس قبول ہے۔';return false;}
 const fallback=overlay.querySelector('.sk-reader-fallback a');fallback.href=u.href;fallback.hidden=false;
 urlInput.value=u.href;status.textContent='پبلشر کا صفحہ SYK کے برانڈڈ ریڈر میں لوڈ کرنے کی کوشش ہو رہی ہے۔ اگر embed منع ہو تو اصل پبلشر کا متبادل لنک دستیاب ہے۔';
 frame.src=u.href;show();return true;
}
function openSearch(query){
 const q=esc(query).trim();if(!q)return;
 build();urlInput.value='https://www.google.com/search?q='+encodeURIComponent(q);
 status.textContent='یہ بیرونی سرچ صفحہ embedded دکھانے کی کوشش ہوگی؛ سرچ انجن embedding روک سکتا ہے۔ SYK کی اپنی کیٹلاگ سرچ الگ دستیاب رہے گی۔';
 const u=safeUrl(urlInput.value);const fallback=overlay.querySelector('.sk-reader-fallback a');fallback.href=u.href;fallback.hidden=false;
 frame.src=u.href;show();
}
window.SKReader={openUrl,openSearch,close:hide};
document.addEventListener('DOMContentLoaded',()=>{
 const nav=document.querySelector('.bottom nav');
 if(nav&&!nav.querySelector('[data-sk-reader-nav]')){const b=document.createElement('button');b.type='button';b.className='navbtn';b.dataset.skReaderNav='1';b.innerHTML='<span>▣</span>Reader';b.addEventListener('click',()=>{build();show();urlInput.focus();});nav.append(b);}
 const form=document.getElementById('searchForm');
 if(form)form.addEventListener('submit',e=>{e.preventDefault();const q=document.getElementById('q')?.value||'';if(window.SKReader)openSearch(q);});
 const params=new URLSearchParams(location.search);const initial=params.get('q');if(initial){const q=document.getElementById('q');if(q)q.value=initial;openSearch(initial);}
});
})();