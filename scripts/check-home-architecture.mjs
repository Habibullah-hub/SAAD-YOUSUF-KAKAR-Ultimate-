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
assert(html.includes('assets/sk-home-architecture-v1.js'),"Orientation controller not loaded");
assert(html.includes('id="skCreatorGeneratorStatus"'),"Creator generator status ID not separated");
assert(html.includes('id="skCreatorTitleOutput"'),"Creator generator title output ID not separated");
assert(html.includes('id="skCreatorPlatformGenerator"'),"Creator generator platform ID not separated");
const js=fs.readFileSync("assets/sk-home-architecture-v1.js","utf8");
assert(js.includes("IntersectionObserver")&&js.includes("aria-current"),"Active section navigation missing");
console.log("SYK homepage architecture checks passed: unique static IDs, section order, asset wiring and active navigation.");
