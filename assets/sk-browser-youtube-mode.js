/* SYK Browser-only full-screen feed behavior. */
(()=>{'use strict';
const hub=document.getElementById('sykVideoHub'),feed=document.getElementById('sykVideoFeed');
if(!hub||!feed)return;
const activateSound=card=>{
 const frame=card.querySelector('iframe.syk-video-inline-player');
 if(!frame)return;
 try{
  const u=new URL(frame.src);
  if(u.hostname.includes('youtube')){u.searchParams.set('mute','0');u.searchParams.set('autoplay','1');u.searchParams.set('playsinline','1');}
  else if(u.hostname.includes('tiktok.com')){u.searchParams.set('muted','0');u.searchParams.set('autoplay','1');}
  const next=u.href;if(frame.src!==next)frame.src=next;
 }catch(_){}
};
const enter=()=>{
 if(document.fullscreenElement===hub)return;
 const req=hub.requestFullscreen?.();
 if(req&&req.then)req.then(()=>hub.classList.add('syk-feed-fullscreen')).catch(()=>hub.classList.add('syk-feed-fullscreen'));
 else hub.classList.add('syk-feed-fullscreen');
};
feed.addEventListener('click',e=>{
 const card=e.target.closest('.syk-video-card');if(!card)return;
 if(e.target.closest('.syk-video-actions,.syk-video-channel-link'))return;
 enter();
 if(!e.target.closest('.syk-video-poster')&&!card.classList.contains('is-playing')){
  card.querySelector('.syk-video-poster')?.click();
 }
 setTimeout(()=>activateSound(card),250);
},true);
const watch=new MutationObserver(()=>{feed.querySelectorAll('.syk-video-card').forEach(card=>{
 if(card.dataset.sykBrowserMode==='1')return;card.dataset.sykBrowserMode='1';
 card.addEventListener('click',e=>{if(e.target.closest('.syk-video-actions,.syk-video-channel-link'))return;enter();setTimeout(()=>activateSound(card),250);});
 });});
watch.observe(feed,{childList:true,subtree:true});
document.addEventListener('fullscreenchange',()=>{
 if(document.fullscreenElement===hub)hub.classList.add('syk-feed-fullscreen');
 else if(!document.fullscreenElement)hub.classList.remove('syk-feed-fullscreen');
});
})();
