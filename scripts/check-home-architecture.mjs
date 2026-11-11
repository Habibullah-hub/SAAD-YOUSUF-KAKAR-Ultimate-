import fs from "node:fs";
import assert from "node:assert/strict";
const html=fs.readFileSync("index.html","utf8");
const visibleMarkup=html.replace(/<script\b[\s\S]*?<\/script>/gi,"").replace(/<style\b[\s\S]*?<\/style>/gi,"");
const ids=[...visibleMarkup.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
const dup=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
assert.deepEqual(dup,[],"Static HTML must not contain duplicate IDs");
const order=["skUltimateTitle","skStartTitle","skDiscoveryHome","apps","documents","sykDailyNaseeha","video-audio","skCreatorHub","news","earnings-model"];
let last=-1;
for(const id of order){const at=html.indexOf('id="'+id+'"');assert(at>last,"Homepage section order incorrect at "+id);last=at;}
assert(html.includes('assets/sk-home-architecture-v1.css'),"Unified architecture CSS not loaded");
assert(html.includes('id="syk-theme-first-paint"'),"First-paint guard missing; legacy theme may flash");
assert(html.includes("classList.add(\'syk-theme-ready\')"),"Page must reveal only after final theme CSS load or failure");
assert(html.includes("sk-home-architecture-v1.css?v=20261111-2"),"Theme stylesheet cache-bust version missing");
assert(html.includes('assets/sk-home-architecture-v1.js'),"Orientation controller not loaded");
assert(html.includes('id="skCreatorGeneratorStatus"'),"Creator generator status ID not separated");
assert(html.includes('id="skCreatorTitleOutput"'),"Creator generator title output ID not separated");
assert(html.includes('id="skCreatorPlatformGenerator"'),"Creator generator platform ID not separated");
const js=fs.readFileSync("assets/sk-home-architecture-v1.js","utf8");
assert(js.includes("IntersectionObserver")&&js.includes("aria-current"),"Active section navigation missing");
console.log("SYK homepage architecture checks passed: unique static IDs, section order, asset wiring and active navigation.");

const secondary=["browser.html","games.html","search.html","community.html","about.html","privacy.html","disclosure.html","404.html"];
for(const path of secondary){const page=fs.readFileSync(path,"utf8");assert(page.includes('class="syk-subpage"'),path+" must use the shared page shell");assert(page.includes("syk-subpage-design-v1.css"),path+" must load the shared theme");}
assert(fs.readFileSync("sw.js","utf8").includes("sk-cyber-hub-shell-v51"),"Service worker cache must be versioned");
