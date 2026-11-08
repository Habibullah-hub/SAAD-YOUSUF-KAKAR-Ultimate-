/* SK CYBER HUB — LiveKit-powered public live rooms */
(()=>{'use strict';
const $=id=>document.getElementById(id),root=$('skLivePanel');if(!root)return;
let db=null,user=null,room=null,activeRoom=null,chatChannel=null,roomsChannel=null,authBound=false,cameraStream=null,canvasStream=null,drawFrame=0,cameraFacing='user',micEnabled=true,currentFilter='normal';
const say=t=>{const n=$('skLiveStatus');if(n)n.textContent=t;};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
function currentDb(){return window.SK_SUPABASE_CLIENT||null;}
function clearMedia(){const host=$('skLiveMedia');host.replaceChildren();}
const FILTERS={normal:'none',warm:'sepia(.18) saturate(1.18) contrast(1.03)',cool:'saturate(1.15) hue-rotate(9deg)',cinema:'contrast(1.18) saturate(.86) brightness(.96)',mono:'grayscale(1) contrast(1.1)',soft:'brightness(1.07) saturate(1.06) contrast(.94)',vintage:'sepia(.32) contrast(.92) saturate(.82)'};
function stopCameraTracks(){if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;}if(canvasStream){canvasStream.getTracks().forEach(t=>t.stop());canvasStream=null;}if(drawFrame)cancelAnimationFrame(drawFrame);drawFrame=0;const v=$('skLivePreviewVideo');if(v)v.srcObject=null;}
function closeCameraPreview(){stopCameraTracks();$('skLiveSetup').hidden=true;$('skLiveStartForm').hidden=!user;}
function drawCameraFrame(){const video=$('skLivePreviewVideo'),canvas=$('skLivePreviewCanvas');if(!video||!canvas||!cameraStream)return;const w=video.videoWidth||720,h=video.videoHeight||1280;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}const ctx=canvas.getContext('2d');if(ctx&&video.readyState>=2){ctx.save();ctx.filter=FILTERS[currentFilter]||'none';ctx.drawImage(video,0,0,w,h);ctx.restore();}drawFrame=requestAnimationFrame(drawCameraFrame);}
async function openCameraPreview(){
 if(!user){say('LIVE شروع کرنے کے لیے پہلے Login کریں۔');if(typeof window.openAuthModal==='function')window.openAuthModal();return;}
 if(!navigator.mediaDevices?.getUserMedia){say('اس browser میں camera دستیاب نہیں۔ Chrome میں HTTPS کے ذریعے کھولیں۔');return;}
 stopCameraTracks();say('کیمرہ اجازت کا انتظار ہے…');
 try{
  cameraStream=await navigator.mediaDevices.getUserMedia({audio:true,video:{facingMode:{ideal:cameraFacing},width:{ideal:720},height:{ideal:1280},frameRate:{ideal:24,max:30}}});
  const v=$('skLivePreviewVideo');v.srcObject=cameraStream;await v.play();
  $('skLivePreviewCanvas').style.transform=cameraFacing==='user'?'scaleX(-1)':'none';
  $('skLiveSetup').hidden=false;$('skLiveStartForm').hidden=true;
  const mic=cameraStream.getAudioTracks()[0];if(mic)mic.enabled=micEnabled;
  const mb=$('skLiveMicToggle');mb.textContent=micEnabled?'🎙️ مائیک آن':'🔇 مائیک بند';mb.setAttribute('aria-pressed',String(micEnabled));
  if(drawFrame)cancelAnimationFrame(drawFrame);drawCameraFrame();say('کیمرہ تیار ہے۔ فلٹر منتخب کریں، پھر Start SYK LIVE دبائیں۔');
 }catch(err){stopCameraTracks();$('skLiveSetup').hidden=true;$('skLiveStartForm').hidden=false;say('کیمرہ نہیں کھل سکا: '+(err.message||'براہِ کرم camera permission دیں۔'));}
}
async function switchCamera(){cameraFacing=cameraFacing==='user'?'environment':'user';await openCameraPreview();}
function selectFilter(name){if(!FILTERS[name])return;currentFilter=name;document.querySelectorAll('[data-syk-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sykFilter===name)));}
function toggleMic(){micEnabled=!micEnabled;const track=cameraStream?.getAudioTracks()[0];if(track)track.enabled=micEnabled;const b=$('skLiveMicToggle');b.textContent=micEnabled?'🎙️ مائیک آن':'🔇 مائیک بند';b.setAttribute('aria-pressed',String(micEnabled));}
function attachTrack(track){const media=track.attach();media.autoplay=true;media.playsInline=true;if(track.kind==='audio'){media.style.display='none';} $('skLiveMedia').append(media);}
async function tokenFor(roomName){
 const r=await db.functions.invoke('sk-live-token',{body:{room:roomName}});
 if(r.error){const status=r.error.context?.status;const detail=r.data?.error||'';if(status===503||/not configured/i.test(detail))throw new Error('LiveKit ابھی مکمل configure نہیں۔ Supabase → Edge Functions → Secrets میں LIVEKIT_URL، LIVEKIT_API_KEY اور LIVEKIT_API_SECRET شامل کریں۔ کوئی paid upgrade یا card درکار نہیں۔');throw new Error(detail||r.error.message||'Live token service is unavailable.');}
 if(r.data?.error)throw new Error(r.data.error);
 if(!r.data?.serverUrl||!r.data?.token)throw new Error('Live token response is incomplete.');
 return r.data;
}
async function connectRoom(item,hostMode){
 if(!window.LivekitClient)throw new Error('LiveKit client library did not load. Check your connection and retry.');
 const creds=await tokenFor(item.room_name);
 room=new LivekitClient.Room({adaptiveStream:true,dynacast:true});
 room.on(LivekitClient.RoomEvent.TrackSubscribed,(track)=>attachTrack(track));
 room.on(LivekitClient.RoomEvent.TrackUnsubscribed,(track)=>{track.detach().forEach(n=>n.remove());});
 room.on(LivekitClient.RoomEvent.Disconnected,()=>{say('Live session disconnected.');});
 await room.connect(creds.serverUrl,creds.token);
 activeRoom=item;showStage(true);$('skLiveStartForm').hidden=!!hostMode;$('skLiveShareScreen').hidden=!hostMode;$('skLiveShareScreen').disabled=!navigator.mediaDevices?.getDisplayMedia;$('skLiveEnd').hidden=!hostMode;
 if(hostMode){
  if(!cameraStream||!$('skLivePreviewCanvas').captureStream)throw new Error('Camera preview unavailable. Re-open the camera and try again.');
  canvasStream=$('skLivePreviewCanvas').captureStream(24);const videoTrack=canvasStream.getVideoTracks()[0];
  await room.localParticipant.publishTrack(videoTrack,{source:LivekitClient.Track.Source.Camera,simulcast:true});
  const audioTrack=cameraStream.getAudioTracks()[0];if(audioTrack&&micEnabled){await room.localParticipant.publishTrack(audioTrack,{source:LivekitClient.Track.Source.Microphone});}else if(audioTrack){audioTrack.enabled=false;}
  $('skLiveSetup').hidden=true;$('skLiveMedia').append($('skLivePreviewCanvas'));$('skLivePreviewCanvas').style.width='100%';$('skLivePreviewCanvas').style.maxHeight='68vh';$('skLivePreviewCanvas').style.objectFit='contain';
  $('skLivePreviewCanvas').style.transform=cameraFacing==='user'?'scaleX(-1)':'none';
  say('آپ LIVE ہیں۔ فلٹر ناظرین کو بھی نظر آئے گا۔ ختم کرنے کے لیے End Live دبائیں۔');
 }else{
  say('Live stream سے جڑ گئے۔ آپ دیکھ رہے ہیں؛ براڈکاسٹ صرف میزبان کر سکتا ہے۔');
 }
 await loadChat(item.id);
}
function showStage(v){$('skLiveStage').hidden=!v;}
async function loadRooms(){
 db=currentDb();const host=$('skLiveRoomList');host.replaceChildren();
 if(!db){host.append(el('p','sk-connect-muted','SK database connect کریں۔'));return;}
 const r=await db.from('sk_live_rooms').select('id,room_name,host_id,title,description,started_at').eq('status','live').order('started_at',{ascending:false}).limit(30);
 if(r.error){host.append(el('p','sk-connect-muted','Live list: '+r.error.message));return;}
 if(!r.data?.length){host.append(el('p','sk-connect-muted','ابھی کوئی LIVE نہیں۔ جب کوئی ممبر Live شروع کرے گا تو یہاں دکھائی دے گا۔'));return;}
 r.data.forEach(item=>{
  const card=el('article','sk-live-room-card');card.append(el('b','',item.title),el('p','sk-connect-muted',item.description||'SK Live creator'));
  const b=el('button','',item.host_id===user?.id?'Resume / Open Live':'Join LIVE');b.type='button';b.addEventListener('click',()=>joinRoom(item));card.append(b);host.append(card);
 });
}
async function startLive(e){
 e?.preventDefault?.();if(!user){say('LIVE شروع کرنے کے لیے پہلے Login کریں۔');$('skLiveLoginGate').hidden=false;return;}
 if(!cameraStream||!$('skLivePreviewCanvas').captureStream){say('پہلے کیمرہ کھولیں اور preview دیکھیں۔');return;}
 const title=$('skLiveTitle').value.trim(),description=$('skLiveDescription').value.trim();
 if(title.length<3){say('Live کا عنوان کم از کم 3 حروف کا ہو۔');return;}
 if(!window.LivekitClient){say('LiveKit client library ابھی لوڈ نہیں ہوئی۔');return;}
 say('Live سروس کی تیاری چیک ہو رہی ہے…');
 const check=await db.functions.invoke('sk-live-token',{body:{action:'check'}});
 if(check.error||check.data?.configured!==true){const detail=check.data?.error||check.error?.message||'LiveKit configuration missing';say('ابھی Live شروع نہیں ہو سکتی: '+detail+'۔ Supabase → Edge Functions → Secrets میں LIVEKIT_URL، LIVEKIT_API_KEY اور LIVEKIT_API_SECRET درکار ہیں۔ ابھی کوئی Live room محفوظ نہیں کیا گیا۔');return;}
 const roomName='sklive_'+user.id.slice(0,8)+'_'+crypto.randomUUID().replace(/-/g,'').slice(0,12);
 const r=await db.from('sk_live_rooms').insert({room_name:roomName,host_id:user.id,title,description,status:'live'}).select('*').single();
 if(r.error){say('Live room محفوظ نہیں ہوا: '+r.error.message+'۔ ڈیٹا بیس schema refresh کرکے دوبارہ کوشش کریں۔');return;}
 try{await connectRoom(r.data,true);$('skLiveStartForm').hidden=true;$('skLiveSetup').hidden=true;$('skLiveLoginGate').hidden=true;await loadRooms();}
 catch(err){await db.from('sk_live_rooms').update({status:'ended',ended_at:new Date().toISOString()}).eq('id',r.data.id);if(room){room.disconnect();room=null;}activeRoom=null;showStage(false);stopCameraTracks();$('skLiveSetup').hidden=true;$('skLiveStartForm').hidden=false;say('Live شروع نہیں ہوئی: '+(err.message||'Setup incomplete'));}
}
async function joinRoom(item){
 if(!user){say('Live دیکھنے کے لیے مفت Login کریں۔');return;}
 if(room){say('پہلے موجودہ Live سے نکلیں۔');return;}
 try{say('Live سے جڑ رہے ہیں…');await connectRoom(item,item.host_id===user.id);}
 catch(e){if(room){room.disconnect();room=null;}activeRoom=null;showStage(false);clearMedia();say('Live join نہیں ہوئی: '+(e.message||'Check LiveKit setup and free quota'));}
}
async function endLive(){
 if(activeRoom?.host_id===user?.id)await db.from('sk_live_rooms').update({status:'ended',ended_at:new Date().toISOString()}).eq('id',activeRoom.id);
 await leaveLive();$('skLiveStartForm').hidden=!user;$('skLiveLoginGate').hidden=!!user;await loadRooms();
}
async function leaveLive(){
 const wasHost=activeRoom?.host_id===user?.id;
 if(chatChannel){await db.removeChannel(chatChannel);chatChannel=null;}
 if(room){room.disconnect();room=null;}
 activeRoom=null;clearMedia();showStage(false);if(wasHost)stopCameraTracks();$('skLiveSetup').hidden=true;$('skLiveStartForm').hidden=!!wasHost;
}
async function loadChat(roomId){
 if(chatChannel){await db.removeChannel(chatChannel);chatChannel=null;}
 const host=$('skLiveChat');host.replaceChildren();
 const r=await db.from('sk_live_chat').select('id,user_id,body,created_at').eq('room_id',roomId).order('created_at',{ascending:true}).limit(80);
 if(r.error){host.append(el('p','',r.error.message));return;}
 const ids=[...new Set((r.data||[]).map(x=>x.user_id))];let profiles=[];
 if(ids.length){const p=await db.from('sk_public_profiles').select('id,display_name').in('id',ids);profiles=p.data||[];}
 const names=new Map(profiles.map(p=>[p.id,p.display_name||'Member']));
 (r.data||[]).forEach(x=>appendChat(x,names.get(x.user_id)||'Member'));
 chatChannel=db.channel('sk-live-chat-'+roomId).on('postgres_changes',{event:'INSERT',schema:'public',table:'sk_live_chat',filter:'room_id=eq.'+roomId},async payload=>{
  const p=await db.from('sk_public_profiles').select('display_name').eq('id',payload.new.user_id).maybeSingle();
  appendChat(payload.new,p.data?.display_name||'Member');
 }).subscribe();
}
function appendChat(row,name){const p=el('p','',name+': '+row.body);$('skLiveChat').append(p);$('skLiveChat').scrollTop=$('skLiveChat').scrollHeight;}
async function sendChat(e){
 e.preventDefault();if(!activeRoom||!user)return;const body=$('skLiveChatText').value.trim();if(!body)return;
 const r=await db.from('sk_live_chat').insert({room_id:activeRoom.id,user_id:user.id,body});
 if(r.error){say('Chat message نہیں گیا: '+r.error.message);return;}$('skLiveChatText').value='';
}
async function shareScreen(){
 if(!room||!activeRoom||activeRoom.host_id!==user?.id)return;
 try{await room.localParticipant.setScreenShareEnabled(true);}catch(e){say('Screen share: '+(e.message||'This browser does not support it.'));}
}
async function init(){
 db=currentDb();if(!db){say('Supabase database connect کریں۔');return;}
 if(!authBound){db.auth.onAuthStateChange(()=>setTimeout(()=>init().catch(e=>say(e.message)),0));authBound=true;}
 const s=await db.auth.getSession();user=s.data?.session?.user||null;
 $('skLiveLoginGate').hidden=!!user;
 $('skLiveStartForm').hidden=!user;
 $('skLiveSetup').hidden=true;
 await loadRooms();
 if(roomsChannel)await db.removeChannel(roomsChannel);
 roomsChannel=db.channel('sk-live-room-updates').on('postgres_changes',{event:'*',schema:'public',table:'sk_live_rooms'},()=>loadRooms()).subscribe();
}
$('skLiveOpenCamera')?.addEventListener('click',openCameraPreview);
$('skLiveGoLive')?.addEventListener('click',startLive);
$('skLiveSwitchCamera')?.addEventListener('click',switchCamera);
$('skLiveMicToggle')?.addEventListener('click',toggleMic);
$('skLiveCloseCamera')?.addEventListener('click',closeCameraPreview);
document.querySelectorAll('[data-syk-filter]').forEach(b=>b.addEventListener('click',()=>selectFilter(b.dataset.sykFilter)));
$('skLiveLoginButton')?.addEventListener('click',()=>{if(typeof window.openAuthModal==='function')window.openAuthModal();else say('اوپر Login بٹن سے پہلے اپنے SYK اکاؤنٹ میں داخل ہوں۔');});
$('skLiveLeave')?.addEventListener('click',leaveLive);
$('skLiveEnd')?.addEventListener('click',endLive);
$('skLiveShareScreen')?.addEventListener('click',shareScreen);
$('skLiveChatForm')?.addEventListener('submit',sendChat);
window.addEventListener('sk:database-ready',()=>init().catch(e=>say(e.message)));
if(currentDb())init().catch(e=>say(e.message));
})();
