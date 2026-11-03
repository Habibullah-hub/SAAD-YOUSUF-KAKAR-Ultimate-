/* SK CYBER HUB — transparent creator monetization center */
(()=>{'use strict';
const $=id=>document.getElementById(id),root=$('skCreatorProgram');if(!root)return;
let db=null,user=null,isAdmin=false;
const text=(id,value)=>{const n=$(id);if(n)n.textContent=value;};
const node=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n;};
const safeUrl=v=>{try{const u=new URL(String(v||'').trim());return u.protocol==='https:'?u.href:'';}catch(_){return '';}};
const money=(v,c)=>new Intl.NumberFormat(undefined,{style:'currency',currency:c||'USD'}).format(Number(v)||0);
function statusLabel(s){return ({pending:'Under review',approved:'Approved',rejected:'Not approved',suspended:'Paused'})[s]||s;}
function setStatus(msg){text('skCreatorProgramStatus',msg);}
function show(n,yes){if(n)n.hidden=!yes;}
async function start(){
 db=window.SK_SUPABASE_CLIENT||null;
 if(!db){setStatus('Database connection is not ready. Connect the SK Supabase database first.');return;}
 const {data,error}=await db.auth.getSession();if(error)throw error;
 user=data?.session?.user||null;
 if(!user){setStatus('Apply کرنے، creator status دیکھنے اور اپنی confirmed earnings دیکھنے کے لیے مفت Member Login کریں۔');show($('skCreatorApplicationForm'),false);show($('skCreatorLedger'),false);return;}
 const profile=await db.from('sk_profiles').select('role').eq('id',user.id).maybeSingle();
 if(profile.error)throw profile.error;
 isAdmin=profile.data?.role==='admin';
 show($('skCreatorApplicationForm'),!isAdmin);
 show($('skCreatorAdminPanel'),isAdmin);
 show($('skCreatorLedger'),!isAdmin);
 if(isAdmin){setStatus('Owner Admin: review creator applications and record only revenue that has actually been confirmed.');await loadAdmin();return;}
 await loadMember();
}
async function loadMember(){
 const app=await db.from('sk_creator_applications').select('creator_type,country,channel_url,status,admin_note,created_at').eq('user_id',user.id).maybeSingle();
 if(app.error)throw app.error;
 if(app.data){
  $('skCreatorApplicationForm').hidden=true;
  const status=node('div','sk-creator-status-card');
  status.append(node('b','', 'Creator application: '+statusLabel(app.data.status)),node('p','',app.data.admin_note||'Your application is saved. Approval is not automatic and does not guarantee earnings.'));
  const host=$('skCreatorApplicationStatus');host.replaceChildren(status);host.hidden=false;
 }else{$('skCreatorApplicationForm').hidden=false;$('skCreatorApplicationStatus').hidden=true;}
 const ledger=await db.from('sk_creator_ledger').select('source,currency,gross_amount,creator_amount,status,description,created_at,paid_at').eq('creator_id',user.id).order('created_at',{ascending:false}).limit(100);
 if(ledger.error)throw ledger.error;
 const list=$('skCreatorLedgerList');list.replaceChildren();
 if(!ledger.data?.length){list.append(node('p','sk-creator-muted','ابھی کوئی confirmed creator revenue record نہیں ہے۔ کوئی فرضی رقم یا اندازاً balance نہیں دکھایا جاتا۔'));return;}
 ledger.data.forEach(row=>{const card=node('article','sk-creator-ledger-row');card.append(node('b','',money(row.creator_amount,row.currency)),node('span','',row.source+' · '+row.status),node('small','',row.description||'Confirmed revenue record · '+new Date(row.created_at).toLocaleDateString()));list.append(card);});
}
async function apply(event){
 event.preventDefault();if(!user||isAdmin)return;
 const creator_type=$('skCreatorType').value,country=$('skCreatorCountry').value,channel=safeUrl($('skCreatorChannel').value);
 if($('skCreatorChannel').value.trim()&&!channel){setStatus('Portfolio link must be a valid HTTPS URL.');return;}
 if(!$('skCreatorOriginalAck').checked){setStatus('Please confirm that you will share content you own or have permission to use.');return;}
 const button=$('skCreatorApplyButton');button.disabled=true;setStatus('Saving your creator application…');
 const result=await db.from('sk_creator_applications').insert({user_id:user.id,creator_type,country,channel_url:channel||null,original_content_ack:true,status:'pending'});
 button.disabled=false;
 if(result.error){setStatus(result.error.code==='23505'?'An application already exists for this account.':'Could not save: '+result.error.message);return;}
 setStatus('Application submitted. The owner will review it. Approval and earnings are not guaranteed.');await loadMember();
}
async function loadAdmin(){
 const q=await db.from('sk_creator_applications').select('id,user_id,country,creator_type,channel_url,status,created_at,admin_note').order('created_at',{ascending:false}).limit(100);
 if(q.error)throw q.error;
 const host=$('skCreatorAdminQueue');host.replaceChildren();
 if(!q.data?.length)host.append(node('p','sk-creator-muted','No creator applications yet.'));
 q.data.forEach(app=>{
  const card=node('article','sk-creator-admin-row');
  card.append(node('b','',app.creator_type+' · '+app.country),node('small','',app.user_id+' · '+statusLabel(app.status)));
  if(app.channel_url){const link=node('a','', 'Open creator portfolio ↗');link.href=app.channel_url;link.target='_blank';link.rel='noopener noreferrer';card.append(link);}
  const note=node('input','');note.placeholder='Optional private admin note';note.maxLength=500;note.value=app.admin_note||'';card.append(note);
  const actions=node('div','sk-creator-admin-actions');
  ['approved','rejected','suspended'].forEach(next=>{const b=node('button','',next==='approved'?'Approve':next==='rejected'?'Reject':'Pause');b.type='button';b.addEventListener('click',async()=>{b.disabled=true;const r=await db.from('sk_creator_applications').update({status:next,admin_note:note.value.trim()}).eq('id',app.id);if(r.error){setStatus('Could not update application: '+r.error.message);b.disabled=false;}else{setStatus('Application updated.');await loadAdmin();}});actions.append(b);});
  card.append(actions);host.append(card);
 });
 const ledger=await db.from('sk_creator_ledger').select('id,creator_id,source,currency,creator_amount,status,created_at').order('created_at',{ascending:false}).limit(30);
 if(ledger.error)throw ledger.error;
 const lh=$('skCreatorAdminLedger');lh.replaceChildren();
 (ledger.data||[]).forEach(row=>{const line=node('div','sk-creator-ledger-row');line.append(node('b','',money(row.creator_amount,row.currency)),node('span','',row.source+' · '+row.status),node('small','',row.creator_id));if(row.status!=='paid'){const b=node('button','','Mark paid');b.type='button';b.addEventListener('click',async()=>{b.disabled=true;const r=await db.from('sk_creator_ledger').update({status:'paid',paid_at:new Date().toISOString()}).eq('id',row.id);if(r.error){setStatus(r.error.message);b.disabled=false;}else await loadAdmin();});line.append(b);}lh.append(line);});
}
async function recordRevenue(event){
 event.preventDefault();if(!isAdmin||!user)return;
 const creator=$('skRevenueCreatorId').value.trim(),source=$('skRevenueSource').value,ref=$('skRevenueReference').value.trim(),currency=$('skRevenueCurrency').value.toUpperCase(),gross=Number($('skRevenueGross').value),share=Number($('skRevenueCreator').value),platform=Number($('skRevenuePlatform').value);
 if(!creator||!ref||! /^[A-Z]{3}$/.test(currency)||![gross,share,platform].every(Number.isFinite)||gross<0||share<0||platform<0||Math.round(gross*100)!==Math.round((share+platform)*100)){setStatus('Check creator ID, unique reference, currency and revenue split. Gross must equal creator share plus platform share.');return;}
 const b=$('skRevenueSave');b.disabled=true;
 const r=await db.from('sk_creator_ledger').insert({creator_id:creator,source,source_reference:ref,currency,gross_amount:gross,creator_amount:share,platform_amount:platform,status:'confirmed',description:'Owner-recorded confirmed external revenue',recorded_by:user.id});
 b.disabled=false;
 if(r.error){setStatus('Revenue record not saved: '+r.error.message);return;}
 $('skRevenueReference').value='';$('skRevenueGross').value='';$('skRevenueCreator').value='';$('skRevenuePlatform').value='';
 setStatus('Confirmed revenue record saved. It is visible to the selected creator.');await loadAdmin();
}
$('skCreatorApplicationForm')?.addEventListener('submit',apply);
$('skCreatorRevenueForm')?.addEventListener('submit',recordRevenue);
window.addEventListener('sk:database-ready',()=>start().catch(e=>setStatus('Creator center: '+(e.message||'Database error'))));
if(db)start().catch(e=>setStatus('Creator center: '+(e.message||'Database error')));
})();
