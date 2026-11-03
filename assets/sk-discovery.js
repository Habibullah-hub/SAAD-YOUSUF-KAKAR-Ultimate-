(()=>{'use strict';
const root=document.getElementById('skNextGrid'),button=document.getElementById('skShuffleDiscoveries');if(!root||!button)return;
const items=[
{title:'⌕ SK Search Engine',desc:'Search the SK directory or continue on a wider-web provider.',href:'./search.html',label:'FIND SOMETHING'},
{title:'🎬 Free AI Video Finder',desc:'Compare AI video tools and check free limits before creating.',href:'#smart-free-finder',label:'CREATE'},
{title:'🌍 World News',desc:'Explore current topics and follow stories from different regions.',href:'#news',label:'STAY INFORMED'},
{title:'⚡ Instant Online Tools',desc:'Try practical browser tools for everyday tasks.',href:'#quick-tools',label:'GET THINGS DONE'},
{title:'🎥 Creator Studio',desc:'Build video ideas, captions, scripts and content plans.',href:'#creator-studio',label:'MAKE SOMETHING'},
{title:'📚 Learning & Documents',desc:'Discover learning resources, guides and useful documents.',href:'#documents',label:'LEARN'},
{title:'💼 Jobs & Opportunities',desc:'Explore work options and verify every opportunity carefully.',href:'#jobs',label:'GROW'},
{title:'👥 SK Community',desc:'Meet members, share posts and discover community activity.',href:'#community',label:'CONNECT'},
{title:'🛡️ Security & Privacy',desc:'Find practical ways to protect your accounts and devices.',href:'#security-privacy',label:'STAY SAFE'}
];
let previous=[];
function draw(){
 let pool=items.filter(x=>!previous.includes(x.title));if(pool.length<3){previous=[];pool=items.slice();}
 const chosen=[];while(chosen.length<3&&pool.length){const index=Math.floor(Math.random()*pool.length);chosen.push(pool.splice(index,1)[0]);}
 previous=chosen.map(x=>x.title);
 root.replaceChildren();
 chosen.forEach(item=>{const a=document.createElement('a');a.className='sk-next-card';a.href=item.href;const label=document.createElement('span');label.className='sk-next-label';label.textContent=item.label;const title=document.createElement('b');title.textContent=item.title;const desc=document.createElement('small');desc.textContent=item.desc;a.append(label,title,desc);root.append(a);});
}
button.addEventListener('click',draw);draw();
})();