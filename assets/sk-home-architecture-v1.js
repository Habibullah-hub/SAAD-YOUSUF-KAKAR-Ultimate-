/* SYK Cyber Hub — homepage orientation, active navigation and accessible return-to-top. */
(()=>{'use strict';
 const root=document.body;if(!root||!root.classList.contains('sk-architecture-v1'))return;
 const links=[...document.querySelectorAll('.category-menu a[href^="#"]')];
 const targets=links.map(a=>({a,id:a.getAttribute('href').slice(1),el:document.getElementById(a.getAttribute('href').slice(1))})).filter(x=>x.el);
 const mark=id=>{for(const x of targets){if(x.id===id)x.a.setAttribute('aria-current','location');else x.a.removeAttribute('aria-current');}};
 if('IntersectionObserver'in window&&targets.length){
  const io=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(visible[0])mark(visible[0].target.id);},{rootMargin:'-18% 0px -68% 0px',threshold:[0,.15,.35,.6]});
  targets.forEach(x=>io.observe(x.el));
 }
 let top=document.querySelector('.sk-home-back-top');
 if(!top){top=document.createElement('button');top.type='button';top.className='sk-home-back-top';top.setAttribute('aria-label','Back to top');top.title='Back to top';top.textContent='↑';document.body.append(top);}
 const update=()=>top.classList.toggle('is-visible',window.scrollY>650);
 window.addEventListener('scroll',update,{passive:true});update();
 top.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
 document.querySelectorAll('.sk-start-link,.sk-featured-grid a').forEach(a=>a.addEventListener('click',()=>{const id=(a.getAttribute('href')||'').slice(1);if(id)mark(id);}));
})();
