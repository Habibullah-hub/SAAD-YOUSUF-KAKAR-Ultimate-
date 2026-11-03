/* SK CYBER HUB — LiveKit-powered public live rooms */
(()=>{'use strict';
const $=id=>document.getElementById(id),root=$('skLivePanel');if(!root)return;
let db=null,user=null,room=null,activeRoom=null,chatChannel=null,roomsChannel=null,authBound=false;
const say=t=>{const n=$('skLiveStatus');if(n)n.textContent=t;};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
function currentDb(){return window.SK_SUPABASE_CLIENT||null;}
function clearMedia(){const host=$('skLiveMedia');host.replaceChildren();}
function attachTrack(track){const media=track.attach();media.autoplay=true;media.playsInline=true;if(track.kind==='audio'){media.style.display='none';} $('skLiveMedia').append(media);}
async function tokenFor(roomName){
 const r=await db.functions.invoke('sk-live-token',{body:{room:roomName}});
 if(r.error)throw new Error(r.error.message||'Live token service is not deployed or configured.');
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
 activeRoom=item;showStage(true);$('skLiveShareScreen').hidden=!hostMode;$('skLiveEnd').hidden=!hostMode;
 if(hostMode){
  await room.localParticipant.enableCameraAndMicrophone();
  for(const pub of room.localParticipant.videoTrackPublications.values()){if(pub.track)attachTrack(pub.track);}
  say('آپ LIVE ہیں۔ جب ختم ہو تو End Live دبائیں۔');
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
 e.preventDefault();if(!user){say('Live شروع کرنے کے لیے Member Login کریں۔');return;}
 if(!navigator.mediaDevices?.getUserMedia){say('اس browser میں camera/microphone دستیاب نہیں۔');return;}
 if(!window.LivekitClient){say('LiveKit client library ابھی لوڈ نہیں ہوئی۔');return;}
 const title=$('skLiveTitle').value.trim(),description=$('skLiveDescription').value.trim();
 if(title.length<3){say('Live کا عنوان کم از کم 3 حروف کا ہو۔');return;}
 const roomName='sklive_'+user.id.slice(0,8)+'_'+crypto.randomUUID().replace(/-/g,'').slice(0,12);
 const r=await db.from('sk_live_rooms').insert({room_name:roomName,host_id:user.id,title,description,status:'live'}).select('*').single();
 if(r.error){say('Live room محفوظ نہیں ہوا: '+r.error.message);return;}
 try{await connectRoom(r.data,true);$('skLiveStartForm').hidden=true;await loadRooms();}
 catch(err){await db.from('sk_live_rooms').update({status:'ended',ended_at:new Date().toISOString()}).eq('id',r.data.id);if(room){room.disconnect();room=null;}activeRoom=null;showStage(false);say('Live شروع نہیں ہوئی: '+(err.message||'Setup incomplete'));}
}
async function joinRoom(item){
 if(!user){say('Live دیکھنے کے لیے مفت Member Login کریں۔');return;}
 if(room){say('پہلے موجودہ Live سے نکلیں۔');return;}
 try{say('Live سے جڑ رہے ہیں…');await connectRoom(item,item.host_id===user.id);}
 catch(e){say('Live join نہیں ہوئی: '+(e.message||'Check LiveKit setup and free quota'));}
}
async function endLive(){
 if(activeRoom?.host_id===user?.id)await db.from('sk_live_rooms').update({status:'ended',ended_at:new Date().toISOString()}).eq('id',activeRoom.id);
 await leaveLive();await loadRooms();
}
async function leaveLive(){
 if(chatChannel){await db.removeChannel(chatChannel);chatChannel=null;}
 if(room){room.disconnect();room=null;}
 activeRoom=null;clearMedia();showStage(false);$('skLiveStartForm').hidden=false;
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
 $('skLiveStartForm').hidden=!user;
 await loadRooms();
 if(roomsChannel)await db.removeChannel(roomsChannel);
 roomsChannel=db.channel('sk-live-room-updates').on('postgres_changes',{event:'*',schema:'public',table:'sk_live_rooms'},()=>loadRooms()).subscribe();
}
$('skLiveStartForm')?.addEventListener('submit',startLive);
$('skLiveLeave')?.addEventListener('click',leaveLive);
$('skLiveEnd')?.addEventListener('click',endLive);
$('skLiveShareScreen')?.addEventListener('click',shareScreen);
$('skLiveChatForm')?.addEventListener('submit',sendChat);
window.addEventListener('sk:database-ready',()=>init().catch(e=>say(e.message)));
if(currentDb())init().catch(e=>say(e.message));
})();
