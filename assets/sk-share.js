/* SK Cyber Hub — accessible share controls; no referral claims or client-generated reward codes. */
(function(){
 'use strict';
 const url='https://habibullah-hub.github.io/SAAD-YOUSUF-KAKAR-Ultimate-/';
 const copyButton=document.getElementById('skShareCopy');
 const shareButton=document.getElementById('skShareNative');
 const field=document.getElementById('skShareUrl');
 const status=document.getElementById('skShareStatus');
 if(field) field.value=url;
 async function copyText(value){
  if(navigator.clipboard && window.isSecureContext){
   await navigator.clipboard.writeText(value);
   return true;
  }
  const area=document.createElement('textarea');
  area.value=value;area.setAttribute('readonly','');
  area.style.position='fixed';area.style.opacity='0';area.style.pointerEvents='none';
  document.body.appendChild(area);area.select();area.setSelectionRange(0,area.value.length);
  let copied=false;
  try{copied=document.execCommand('copy')===true;}
  finally{area.remove();}
  if(!copied) throw new Error('Clipboard copy is not supported here.');
  return true;
 }
 copyButton?.addEventListener('click',async()=>{
  if(!status)return;
  copyButton.disabled=true;
  try{await copyText(url);status.textContent='Link copied. You can now share it with friends.';}
  catch(_){status.textContent='Copy was blocked. Select the website link and copy it manually.';field?.focus();field?.select();}
  finally{copyButton.disabled=false;}
 });
 shareButton?.addEventListener('click',async()=>{
  if(!status)return;
  if(navigator.share){
   try{await navigator.share({title:'SK Cyber Hub',text:'Explore useful digital tools and resources in one place.',url});status.textContent='Share sheet opened.';}
   catch(error){if(error?.name!=='AbortError')status.textContent='Sharing was not completed. You can copy the link instead.';}
  }else{
   try{await copyText(url);status.textContent='Your phone does not support the share sheet here, so the link was copied.';}
   catch(_){status.textContent='Sharing is not supported. Copy the website link manually.';field?.focus();field?.select();}
  }
 });
})();
