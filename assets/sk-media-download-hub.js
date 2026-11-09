/* SK Cyber Hub — safe direct-media helper. No proxy, scraping or platform extraction. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const form=$('skMediaUrlForm'),input=$('skMediaUrl'),fileInput=$('skMediaFile'),status=$('skMediaStatus'),result=$('skMediaResult'),voice=$('skMediaVoice');
if(!form||!input||!result)return;
let localObjectUrl='';
const MAX_BYTES=100*1024*1024;
const types={video:['mp4','webm','mov','m4v'],audio:['mp3','m4a','wav','ogg','aac','flac'],image:['jpg','jpeg','png','webp','gif','avif']};
function safeHttps(raw){try{const u=new URL(String(raw||'').trim());if(u.protocol!=='https:'||u.username||u.password)return null;return u;}catch(_){return null;}}
function showMessage(title,message,action){result.replaceChildren();result.hidden=false;const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=message;result.append(h,p);if(action){const row=document.createElement('div');row.className='sk-media-result-actions';const b=document.createElement('button');b.type='button';b.textContent=action.label;b.addEventListener('click',action.run);row.append(b);result.append(row);}}
function extOf(url){return (url.pathname.split('.').pop()||'').toLowerCase();}
function mediaType(ext){for(const [kind,list] of Object.entries(types))if(list.includes(ext))return kind;return '';}
function renderPreview(src,kind){let el;if(kind==='image'){el=document.createElement('img');el.alt='Media preview';}else if(kind==='audio'){el=document.createElement('audio');el.controls=true;}else{el=document.createElement('video');el.controls=true;el.playsInline=true;el.preload='metadata';}el.className='sk-media-preview';el.src=src;return el;}
function downloadBlob(blob,name){if(blob.size>MAX_BYTES){showMessage('File is too large','For phone memory safety, this helper limits fetched files to 100 MB. Use the source website’s normal download option.');return;}const objectUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=objectUrl;a.download=name||'sk-media-download';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),30000);}
async function downloadRemote(url,kind,ext){
 status.textContent='Checking whether this direct media file permits a browser download…';
 try{
  const response=await fetch(url.href,{mode:'cors',credentials:'omit'});
  if(!response.ok)throw new Error('The host did not allow the file request.');
  const blob=await response.blob();if(blob.size>MAX_BYTES)throw new Error('The file is larger than 100 MB.');
  if(!/^(video|audio|image)\//.test(blob.type))throw new Error('The link did not return a media file.');
  const name=decodeURIComponent(url.pathname.split('/').pop()||('sk-media.'+ext));
  downloadBlob(blob,name);status.textContent='Download prepared by your browser. No file was sent to SK servers.';
 }catch(_){
  status.textContent='The host blocks browser-side fetching or the file is too large. Use the direct media link below; no proxy or third-party converter was used.';
  showMessage('Direct media link found','Preview may work here. If the host blocks downloads, use its own download control or save option.',{label:'Open direct media',run:()=>{window.open(url.href,'_blank','noopener,noreferrer');}});
 }
}
function analyze(raw){
 const url=safeHttps(raw);if(!url){showMessage('Use a secure HTTPS link','Paste a direct HTTPS media-file URL. HTTP and unsafe links are not accepted.');return;}
 const host=url.hostname.toLowerCase();
 if(/(^|\.)(youtube\.com|youtu\.be|instagram\.com|tiktok\.com|facebook\.com)$/i.test(host)){
  showMessage('Official platform link detected','This is a platform page, not a direct media file. SK does not rip, bypass restrictions or remove platform protections. Use the platform’s official download/save option, or paste a direct file you own.',{label:'Open platform in SK Reader',run:()=>{if(window.SKReader?.openUrl)window.SKReader.openUrl(url.href);else window.open(url.href,'_blank','noopener,noreferrer');}});return;
 }
 const ext=extOf(url),kind=mediaType(ext);
 if(!kind){showMessage('Direct media file not detected','Use a direct .mp4, .webm, .mp3, .m4a, .wav, .jpg, .png or .webp file link. A normal webpage URL cannot be converted into a media file.');return;}
 result.replaceChildren();result.hidden=false;result.append(renderPreview(url.href,kind));
 const h=document.createElement('h3');h.textContent=(kind==='video'?'Video':kind==='audio'?'Audio':'Photo')+' preview';result.append(h);
 const p=document.createElement('p');p.textContent='Direct '+kind+' file · '+url.hostname+' · HTTPS';result.append(p);
 const row=document.createElement('div');row.className='sk-media-result-actions';const b=document.createElement('button');b.type='button';b.textContent='Download file';b.addEventListener('click',()=>downloadRemote(url,kind,ext));const open=document.createElement('a');open.href=url.href;open.target='_blank';open.rel='noopener noreferrer';open.textContent='Open source file';row.append(b,open);result.append(row);
 status.textContent='Direct media file recognised. Preview is loaded from the source host.';
}
form.addEventListener('submit',e=>{e.preventDefault();analyze(input.value);});
fileInput?.addEventListener('change',()=>{
 const file=fileInput.files?.[0];if(!file)return;
 if(!/^(video|audio|image)\//.test(file.type)){showMessage('Unsupported file','Choose a video, audio or image file.');return;}
 if(localObjectUrl)URL.revokeObjectURL(localObjectUrl);localObjectUrl=URL.createObjectURL(file);
 const kind=file.type.split('/')[0];result.replaceChildren();result.hidden=false;result.append(renderPreview(localObjectUrl,kind));
 const h=document.createElement('h3');h.textContent='Your device file is ready';result.append(h);
 const p=document.createElement('p');p.textContent=file.name+' · '+Math.round(file.size/1024)+' KB · stays on this device';result.append(p);
 const row=document.createElement('div');row.className='sk-media-result-actions';const a=document.createElement('a');a.href=localObjectUrl;a.download=file.name;a.textContent='Save a copy';row.append(a);result.append(row);
 status.textContent='Local preview created. Your file was not uploaded to SK Cyber Hub.';
});
voice?.addEventListener('click',()=>{
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition){status.textContent='Voice recognition is not available in this browser. Paste or type the link instead.';return;}
 const rec=new Recognition();rec.lang=navigator.language||'en-US';rec.interimResults=false;rec.maxAlternatives=1;
 rec.onresult=event=>{const phrase=event.results?.[0]?.[0]?.transcript||'';if(/^https:\/\//i.test(phrase.trim()))input.value=phrase.trim();input.focus();status.textContent='Voice command heard: '+phrase+'. Paste or confirm the direct media URL, then tap Check media link.';};
 rec.onerror=()=>{status.textContent='Voice input was unavailable. You can paste or type the media link.';};
 try{rec.start();}catch(_){status.textContent='Voice input could not start. Paste or type the media link instead.';}
});
window.SKMediaHub={analyze};
})();