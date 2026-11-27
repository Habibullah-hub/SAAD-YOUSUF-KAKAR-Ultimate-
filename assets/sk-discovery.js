(()=>{'use strict';
const root=document.getElementById('skNextGrid'),button=document.getElementById('skShuffleDiscoveries');
if(!root||!button)return;
const items=[
 {id:'browser',title:'⌕ SYK Browser',desc:'Search the web and explore useful destinations.',href:'./browser.html',label:'DISCOVER',topics:['tools','apps']},
 {id:'apps',title:'📱 Apps & Games',desc:'Find apps, games and official download sources.',href:'#apps',label:'PLAY & EXPLORE',topics:['apps','games']},
 {id:'ai',title:'✦ AI Tools Studio',desc:'Explore AI tools and check their real free-plan limits.',href:'#tools',label:'CREATE',topics:['ai','creator']},
 {id:'videos',title:'🎥 SYK Video Hub',desc:'Watch owner features and approved member videos.',href:'#skCreatorHub',label:'WATCH',topics:['creator','learning']},
 {id:'academy',title:'📚 Global Academy',desc:'Discover lessons, courses and learning resources.',href:'#documents',label:'LEARN',topics:['learning']},
 {id:'islamic',title:'🌙 Islamic Center',desc:'Visit the Quran and daily reminder resources.',href:'#sykDailyNaseeha',label:'REFLECT',topics:['learning']},
 {id:'news',title:'🌍 World News',desc:'Explore current topics and trusted publisher links.',href:'#news',label:'STAY INFORMED',topics:['news']},
 {id:'community',title:'👥 SYK Community',desc:'Share ideas, meet members and join conversations.',href:'#community',label:'CONNECT',topics:['creator','work']},
 {id:'messenger',title:'💬 Messenger & Calls',desc:'Open the SYK connection and messaging area.',href:'#sk-connect',label:'CONNECT',topics:['work']},
 {id:'live',title:'🔴 SYK Live',desc:'Find live rooms when a real stream is available.',href:'#sk-live',label:'LIVE',topics:['creator','news']},
 {id:'tools',title:'⚡ Instant Tools',desc:'Use practical tools for everyday tasks.',href:'#quick-tools',label:'GET THINGS DONE',topics:['tools','work']},
 {id:'jobs',title:'💼 Jobs & Opportunities',desc:'Explore work options and verify every opportunity.',href:'#jobs',label:'GROW',topics:['work']},
 {id:'deals',title:'🎁 Deals & Freebies',desc:'Discover offers and read their conditions carefully.',href:'#deals',label:'EXPLORE VALUE',topics:['apps','work']},
 {id:'security',title:'🛡️ Security & Privacy',desc:'Learn practical ways to protect accounts and devices.',href:'#security-privacy',label:'STAY SAFE',topics:['security','tools']},
 {id:'world',title:'◎ SYK World Network',desc:'Explore global stories, learning and opportunities.',href:'#sk-world-network',label:'GO GLOBAL',topics:['news','learning','work']}
];
const seenKey='sk_v100_discovery_seen_session';
let seen=[];try{seen=JSON.parse(sessionStorage.getItem(seenKey)||'[]');if(!Array.isArray(seen))seen=[];}catch(_){}
function interests(){try{const x=JSON.parse(localStorage.getItem('skcyberhub_discovery_mix_v1')||'[]');return Array.isArray(x)?x:[];}catch(_){return[];}}
function draw(){
 const prefs=interests();
 let pool=items.filter(x=>!seen.includes(x.id));
 if(pool.length<3){seen=[];pool=items.slice();}
 const preferred=prefs.length?pool.filter(x=>x.topics.some(t=>prefs.includes(t))):[];
 const chosen=[];
 while(chosen.length<3&&preferred.length){const i=Math.floor(Math.random()*preferred.length);const item=preferred.splice(i,1)[0];chosen.push(item);pool=pool.filter(x=>x.id!==item.id);}
 while(chosen.length<3&&pool.length){const i=Math.floor(Math.random()*pool.length);chosen.push(pool.splice(i,1)[0]);}
 seen=[...seen,...chosen.map(x=>x.id)].slice(-items.length);
 try{sessionStorage.setItem(seenKey,JSON.stringify(seen));}catch(_){}
 root.replaceChildren();
 chosen.forEach(item=>{
  const a=document.createElement('a');a.className='sk-next-card';a.href=item.href;
  const label=document.createElement('span');label.className='sk-next-label';label.textContent=item.label;
  const title=document.createElement('b');title.textContent=item.title;
  const desc=document.createElement('small');desc.textContent=item.desc;
  const action=document.createElement('span');action.className='sk-next-open';action.textContent='Explore now ↗';
  a.append(label,title,desc,action);root.append(a);
 });
}
button.addEventListener('click',draw);draw();
})();