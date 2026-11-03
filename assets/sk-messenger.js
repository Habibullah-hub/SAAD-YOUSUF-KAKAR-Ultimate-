/* SK CYBER HUB — private messenger + direct WebRTC calls */
(()=>{'use strict';
const $=id=>document.getElementById(id),root=$('skConnectPanel');if(!root)return;
let db=null,user=null,activeConversation=null,activePeer=null,messageChannel=null,incomingChannel=null,signalChannel=null,pc=null,localStream=null,activeCall=null,queuedSignals=[],authBound=false;
const say=t=>{const n=$('skConnectStatus');if(n)n.textContent=t;};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const safeName=p=>p?.display_name||'SK Member';
function currentDb(){return window.SK_SUPABASE_CLIENT||null;}
function show(n,v){if(n)n.hidden=!v;}
function renderSignedOut(){say('نجی پیغامات اور کالز کے لیے مفت Member Login کریں۔');show($('skConnectSendForm'),false);$('skConnectSearch').disabled=true;$('skConnectSearchResults').replaceChildren();$('skConnectConversationList').replaceChildren(el('p','sk-connect-muted','Login کے بعد آپ کے conversations یہاں آئیں گے۔'));$('skConnectMessages').replaceChildren();}
async function init(){
 db=currentDb();if(!db){renderSignedOut();return;}
 if(!authBound){db.auth.onAuthStateChange(()=>setTimeout(()=>init(),0));authBound=true;}
 const {data}=await db.auth.getSession();user=data?.session?.user||null;
 if(!user){renderSignedOut();return;}
 const p=await db.from('sk_profiles').select('role').eq('id',user.id).maybeSingle();
 if(p.error){say('Account profile is not ready.');return;}
 show($('skConnectSendForm'),true);$('skConnectMessageText').disabled=false;$('skConnectSend').disabled=false;$('skConnectSearch').disabled=false;
 await loadConversations();await watchIncomingCalls();
}
async function searchMembers(){
 if(!user)return;const q=$('skConnectSearch').value.trim();const host=$('skConnectSearchResults');host.replaceChildren();
 if(q.length<2){host.append(el('p','sk-connect-muted','کم از کم دو حروف لکھیں۔'));return;}
 const r=await db.from('sk_public_profiles').select('id,display_name,bio').ilike('display_name','%'+q.replace(/[%_]/g,'')+'%').neq('id',user.id).limit(12);
 if(r.error){host.append(el('p','sk-connect-muted',r.error.message));return;}
 if(!r.data?.length){host.append(el('p','sk-connect-muted','کوئی ممبر نہیں ملا۔'));return;}
 r.data.forEach(profile=>{const row=el('div','sk-connect-person');row.append(el('span','',safeName(profile)));const b=el('button','', 'Message');b.type='button';b.addEventListener('click',()=>openDirect(profile));row.append(b);host.append(row);});
}
async function openDirect(profile){
 say('Private conversation بن رہی ہے…');
 const r=await db.rpc('sk_create_direct_conversation',{p_other_user:profile.id});
 if(r.error){say('Conversation نہیں بن سکی: '+r.error.message);return;}
 activePeer=profile;await loadConversations();await openConversation(r.data,profile);
}
async function loadConversations(){
 const r=await db.from('sk_conversation_members').select('conversation_id').eq('user_id',user.id);
 const host=$('skConnectConversationList');host.replaceChildren();
 if(r.error){host.append(el('p','sk-connect-muted',r.error.message));return;}
 const ids=[...new Set((r.data||[]).map(x=>x.conversation_id))];
 if(!ids.length){host.append(el('p','sk-connect-muted','ابھی کوئی نجی گفتگو نہیں۔ اوپر کسی ممبر کو تلاش کریں۔'));return;}
 for(const id of ids.slice(0,60)){
  const members=await db.from('sk_conversation_members').select('user_id').eq('conversation_id',id);
  const other=(members.data||[]).find(x=>x.user_id!==user.id)?.user_id;if(!other)continue;
  const profile=await db.from('sk_public_profiles').select('id,display_name,bio').eq('id',other).maybeSingle();
  const p=profile.data||{id:other,display_name:'SK Member'};
  const b=el('button','sk-connect-conversation',safeName(p));b.type='button';b.addEventListener('click',()=>openConversation(id,p));host.append(b);
 }
}
async function openConversation(id,profile){
 activeConversation=id;activePeer=profile;
 $('skConnectActiveName').textContent=safeName(profile);$('skConnectActiveHint').textContent='Private conversation · Only participants can read messages';
 show($('skConnectSendForm'),true);$('skConnectCallAudio').disabled=false;$('skConnectCallVideo').disabled=false;
 $('skConnectCallScreen').disabled=!navigator.mediaDevices?.getDisplayMedia;
 if(messageChannel){await db.removeChannel(messageChannel);messageChannel=null;}
 const q=await db.from('sk_messages').select('id,sender_id,body,created_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(100);
 const host=$('skConnectMessages');host.replaceChildren();
 if(q.error){host.append(el('p','sk-connect-muted',q.error.message));return;}
 (q.data||[]).forEach(addMessage);
 messageChannel=db.channel('sk-messages-'+id).on('postgres_changes',{event:'INSERT',schema:'public',table:'sk_messages',filter:'conversation_id=eq.'+id},payload=>addMessage(payload.new)).subscribe();
 say('Conversation ready. Private messages are not end-to-end encrypted in this version.');
}
function addMessage(msg){
 if(!msg||document.querySelector('[data-sk-message="'+msg.id+'"]'))return;
 const mine=msg.sender_id===user.id,box=el('div',mine?'sk-connect-message mine':'sk-connect-message');box.dataset.skMessage=msg.id;
 box.append(el('p','',msg.body),el('small','',new Date(msg.created_at).toLocaleString()));$('skConnectMessages').append(box);$('skConnectMessages').scrollTop=$('skConnectMessages').scrollHeight;
}
async function sendMessage(e){
 e.preventDefault();if(!activeConversation||!user)return;
 const body=$('skConnectMessageText').value.trim();if(!body)return;
 const b=$('skConnectSend');b.disabled=true;
 const r=await db.from('sk_messages').insert({conversation_id:activeConversation,sender_id:user.id,body});
 b.disabled=false;if(r.error){say('Message نہیں بھیجا گیا: '+r.error.message);return;}
 $('skConnectMessageText').value='';
}
async function watchIncomingCalls(){
 if(incomingChannel){await db.removeChannel(incomingChannel);incomingChannel=null;}
 incomingChannel=db.channel('sk-incoming-calls-'+user.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'sk_call_sessions',filter:'callee_id=eq.'+user.id},payload=>{if(payload.new.status==='ringing')showIncoming(payload.new);}).subscribe();
 const r=await db.from('sk_call_sessions').select('*').eq('callee_id',user.id).eq('status','ringing').order('created_at',{ascending:false}).limit(1);
 if(r.data?.[0])showIncoming(r.data[0]);
}
async function showIncoming(call){
 if(activeCall)return;
 activeCall=call;const p=await db.from('sk_public_profiles').select('display_name').eq('id',call.caller_id).maybeSingle();
 $('skConnectIncomingText').textContent=(p.data?.display_name||'A member')+' is calling ('+call.call_type+').';
 show($('skConnectIncoming'),true);
}
async function sendSignal(recipient,payload){
 const r=await db.from('sk_call_signals').insert({call_id:activeCall.id,sender_id:user.id,recipient_id:recipient,payload});
 if(r.error)throw r.error;
}
async function setupPeer(call,initiator){
 if(signalChannel){await db.removeChannel(signalChannel);signalChannel=null;}
 queuedSignals=[];handlingSignal=false;
 pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
 pc.onicecandidate=e=>{if(e.candidate&&activeCall)sendSignal(initiator?activeCall.callee_id:activeCall.caller_id,{type:'candidate',candidate:e.candidate.toJSON()}).catch(err=>say('Network signal: '+err.message));};
 pc.ontrack=e=>{const remote=$('skConnectRemoteMedia');if(remote.srcObject!==e.streams[0])remote.srcObject=e.streams[0];show(remote,true);};
 pc.onconnectionstatechange=()=>{const state=pc?.connectionState;if(state==='connected')say('Call connected. Media is exchanged through WebRTC.');if(state==='failed')say('Call connection failed. This network may require a TURN relay, which is not configured in the free setup.');};
 signalChannel=db.channel('sk-call-signal-'+call.id+'-'+user.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'sk_call_signals',filter:'recipient_id=eq.'+user.id},payload=>{const row=payload.new;if(row.call_id===call.id)processSignal(row).catch(e=>say(e.message));}).subscribe();
 const media=call.call_type==='video'?await navigator.mediaDevices.getUserMedia({audio:true,video:true}):call.call_type==='screen'&&initiator?await navigator.mediaDevices.getUserMedia({audio:true}):await navigator.mediaDevices.getUserMedia({audio:true});
 localStream=media;
 if(call.call_type==='screen'&&initiator){
  if(!navigator.mediaDevices.getDisplayMedia)throw new Error('Screen sharing is not supported in this browser. Try a supported desktop browser.');
  const screen=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
  screen.getTracks().forEach(t=>{localStream.addTrack(t);pc.addTrack(t,localStream);t.onended=()=>endCall();});
 }
 localStream.getTracks().forEach(t=>{if(!(call.call_type==='screen'&&t.kind==='video'&&initiator))pc.addTrack(t,localStream);});
 $('skConnectLocalMedia').srcObject=localStream;show($('skConnectCallStage'),true);
 if(call.call_type==='audio'){show($('skConnectLocalMedia'),false);show($('skConnectRemoteMedia'),false);}else{show($('skConnectLocalMedia'),true);}
 const signals=await db.from('sk_call_signals').select('*').eq('call_id',call.id).eq('recipient_id',user.id).order('created_at');
 for(const row of (signals.data||[]))await processSignal(row);
 if(initiator){
  const offer=await pc.createOffer();await pc.setLocalDescription(offer);await sendSignal(call.callee_id,{type:'offer',sdp:offer.sdp});
 }
}
async function processSignal(row){
 if(!pc||handlingSignal)return;
 const s=row.payload||{};
 try{
  if(s.type==='offer'){
   await pc.setRemoteDescription(new RTCSessionDescription({type:'offer',sdp:s.sdp}));
   const answer=await pc.createAnswer();await pc.setLocalDescription(answer);await sendSignal(row.sender_id,{type:'answer',sdp:answer.sdp});
   for(const candidate of queuedSignals.splice(0)){try{await pc.addIceCandidate(new RTCIceCandidate(candidate.candidate));}catch(_){}}
  }else if(s.type==='answer'&&pc.signalingState!=='stable'){
   await pc.setRemoteDescription(new RTCSessionDescription({type:'answer',sdp:s.sdp}));
   for(const candidate of queuedSignals.splice(0)){try{await pc.addIceCandidate(new RTCIceCandidate(candidate.candidate));}catch(_){}}
  }else if(s.type==='candidate'&&s.candidate){
   if(!pc.remoteDescription)queuedSignals.push(s);else await pc.addIceCandidate(new RTCIceCandidate(s.candidate));
  }
 }catch(e){say('Call signaling: '+(e.message||'Could not process signal'));}
}
async function startCall(type){
 if(!activeConversation||!activePeer||!user)return;
 if(type==='screen'&&!navigator.mediaDevices?.getDisplayMedia){say('اس براؤزر میں Screen Sharing دستیاب نہیں۔');return;}
 if(!navigator.mediaDevices?.getUserMedia){say('اس browser میں microphone/camera permission دستیاب نہیں۔');return;}
 try{
  const r=await db.from('sk_call_sessions').insert({conversation_id:activeConversation,caller_id:user.id,callee_id:activePeer.id,call_type:type,status:'ringing'}).select('*').single();
  if(r.error)throw r.error;activeCall=r.data;
  show($('skConnectCallStage'),true);say('Calling '+safeName(activePeer)+'…');
  await setupPeer(activeCall,true);
 }catch(e){say('Call start نہیں ہوئی: '+(e.message||'Permission or network error'));await cleanupCall();}
}
async function acceptCall(){
 const call=activeCall;if(!call)return;
 show($('skConnectIncoming'),false);
 try{
  const r=await db.from('sk_call_sessions').update({status:'accepted'}).eq('id',call.id);
  if(r.error)throw r.error;
  const p=await db.from('sk_public_profiles').select('id,display_name').eq('id',call.caller_id).maybeSingle();activePeer=p.data||{id:call.caller_id,display_name:'SK Member'};
  await setupPeer(call,false);say('Call accepted. Connecting…');
 }catch(e){say('Could not accept call: '+(e.message||'Network error'));await cleanupCall();}
}
async function rejectCall(){
 if(activeCall)await db.from('sk_call_sessions').update({status:'declined',ended_at:new Date().toISOString()}).eq('id',activeCall.id);
 await cleanupCall();show($('skConnectIncoming'),false);say('Call declined.');
}
async function endCall(){
 if(activeCall)await db.from('sk_call_sessions').update({status:'ended',ended_at:new Date().toISOString()}).eq('id',activeCall.id);
 await cleanupCall();say('Call ended.');
}
async function cleanupCall(){
 if(signalChannel){await db.removeChannel(signalChannel);signalChannel=null;}
 if(callChannel){await db.removeChannel(callChannel);callChannel=null;}
 if(pc){pc.close();pc=null;}
 if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;}
 const a=$('skConnectLocalMedia'),b=$('skConnectRemoteMedia');if(a)a.srcObject=null;if(b)b.srcObject=null;
 show($('skConnectCallStage'),false);show(a,false);show(b,false);show($('skConnectIncoming'),false);activeCall=null;
}
function bind(){
 $('skConnectSearchButton')?.addEventListener('click',searchMembers);
 $('skConnectSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchMembers();}});
 $('skConnectSendForm')?.addEventListener('submit',sendMessage);
 $('skConnectCallAudio')?.addEventListener('click',()=>startCall('audio'));
 $('skConnectCallVideo')?.addEventListener('click',()=>startCall('video'));
 $('skConnectCallScreen')?.addEventListener('click',()=>startCall('screen'));
 $('skConnectAccept')?.addEventListener('click',acceptCall);
 $('skConnectReject')?.addEventListener('click',rejectCall);
 $('skConnectEnd')?.addEventListener('click',endCall);
}
bind();
window.addEventListener('sk:database-ready',()=>init().catch(e=>say('Messenger: '+(e.message||'Database error'))));
if(currentDb())init().catch(e=>say('Messenger: '+(e.message||'Database error')));
window.addEventListener('beforeunload',()=>{if(pc)pc.close();if(localStream)localStream.getTracks().forEach(t=>t.stop());});
})();
