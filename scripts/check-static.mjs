import fs from "node:fs";
import { spawnSync } from "node:child_process";

const html = fs.readFileSync("index.html", "utf8");
const errors = [];
if (!/^<!doctype html>/i.test(html.trimStart())) errors.push("index.html is missing an HTML5 doctype.");
if (!/<meta\s+name=["']viewport["']/i.test(html)) errors.push("index.html is missing a responsive viewport meta tag.");
if (!/<title>[^<]+<\/title>/i.test(html)) errors.push("index.html is missing a page title.");
if (html.includes("\\n</style>\\n")) errors.push("index.html contains literal escaped newline markers around a style block; use real line breaks.");
if (!html.includes("window.skRunDirectorySearch=()=>{runSearch();filterApps();}")) errors.push("Header search is missing the unified directory-search entry point.");
if (!html.includes("window.skRunDirectorySearch?.();if(input.value.trim())render();")) errors.push("Header search button is not connected to the directory search.");
if (html.includes("headerSearch.addEventListener('input'")) errors.push("A legacy header search input handler is still present.");

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
let checked = 0;
for (let i = 0; i < scripts.length; i++) {
  const attrs = scripts[i][1] || "";
  const source = scripts[i][2] || "";
  if (/\bsrc\s*=/i.test(attrs) || !source.trim()) continue;
  if (/application\/(?:ld\+)?json/i.test(attrs)) continue;
  const isModule = /\btype\s*=\s*["']module["']/i.test(attrs);
  const result = spawnSync(process.execPath, isModule ? ["--check", "--input-type=module"] : ["--check"], {
    input: source,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    errors.push(`Inline script ${i + 1} has a JavaScript syntax error:\n${result.stderr || result.stdout}`);
  } else {
    checked++;
  }
}

if (/SUPABASE_SERVICE_ROLE_KEY\s*=/i.test(html) || /service_role\s*[:=]\s*["'][^"']+["']/i.test(html)) {
  errors.push("A possible Supabase service-role secret assignment was found in browser code.");
}
if (/\beval\s*\(|\bnew\s+Function\s*\(/.test(html)) {
  errors.push("Dynamic code execution (eval / new Function) was found in index.html.");
}


const manifestPath = "manifest.webmanifest";
const workerPath = "sw.js";
if (!fs.existsSync(manifestPath)) errors.push("PWA manifest is missing.");
else {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (!manifest.name || !manifest.start_url || !manifest.scope || manifest.display !== "standalone") {
      errors.push("PWA manifest is missing required install metadata.");
    }
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) errors.push("PWA manifest has no app icon.");
  } catch (error) {
    errors.push("PWA manifest is not valid JSON.");
  }
}
if (!fs.existsSync(workerPath)) errors.push("PWA service worker is missing.");
else {
  const worker = spawnSync(process.execPath, ["--check", workerPath], { encoding: "utf8" });
  if (worker.status !== 0) errors.push(`Service worker has a JavaScript syntax error:\n${worker.stderr || worker.stdout}`);
}
if (!html.includes('rel="manifest"') || (!html.includes("serviceWorker.register") && !html.includes('src="./pwa-register.js"'))) {
  errors.push("index.html is missing the PWA manifest or service-worker registration.");
}

const jsAssets = [
  "assets/sk-community.js",
  "assets/sk-discovery.js",
  "assets/sk-platforms.js",
  "assets/sk-messenger.js",
  "assets/sk-live.js",
  "assets/sk-creator-monetization.js"
];
for (const assetPath of jsAssets) {
  if (!fs.existsSync(assetPath)) {
    errors.push(`JavaScript asset is missing: ${assetPath}`);
    continue;
  }
  const result = spawnSync(process.execPath, ["--check", assetPath], { encoding: "utf8" });
  if (result.status !== 0) errors.push(`JavaScript asset has a syntax error (${assetPath}):\\n${result.stderr || result.stdout}`);
}
if (!html.includes('id="skCommunityAnticipation"')) errors.push("Community feed is missing its honest anticipation status.");
if (!html.includes('id="skCommunityHideCounts"')) errors.push("Community count visibility control is missing.");

const engagementSqlPath = "supabase/SK-SOCIAL-ENGAGEMENT-EXTRAS.sql";
if (!fs.existsSync(engagementSqlPath)) errors.push("Social engagement SQL migration is missing.");
else {
  const sql = fs.readFileSync(engagementSqlPath, "utf8");
  if (/\\bas\\s+\\$(?!\\$)|^\\$;$/m.test(sql)) errors.push("Social engagement SQL contains an invalid single-dollar function delimiter.");
}
const pwaRegisterPath = "pwa-register.js";
if (!fs.existsSync(pwaRegisterPath)) errors.push("PWA registration/update script is missing.");
else {
  const registration = spawnSync(process.execPath, ["--check", pwaRegisterPath], { encoding: "utf8" });
  if (registration.status !== 0) errors.push(`PWA registration script has a JavaScript syntax error:\n${registration.stderr || registration.stdout}`);
  if (!html.includes('src="./pwa-register.js"')) errors.push("index.html is not loading the PWA registration/update script.");
}

if (errors.length) {
  console.error(errors.join("\n\n"));
  process.exit(1);
}
console.log(`Static checks passed: HTML basics verified; ${checked} inline JavaScript block(s) syntax-checked; no obvious service-role assignment or dynamic-code execution found.`);
