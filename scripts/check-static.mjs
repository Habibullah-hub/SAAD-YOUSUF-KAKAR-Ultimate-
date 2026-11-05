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

// Dependency and public-share safety checks.
if (/cdn\.tailwindcss\.com/i.test(html)) errors.push("Production HTML must not load the Tailwind Play CDN.");
if (/\\@supabase\/supabase-js@2(?:["'\\/]|$)/i.test(html)) errors.push("Supabase browser SDK must use an exact version, not the floating @2 alias.");
if (/xlsx@0\.18\.5/i.test(html)) errors.push("Legacy SheetJS 0.18.5 CDN reference remains; use CSV import or a reviewed current build.");
if (!html.includes('assets/sk-tailwind-compat.css')) errors.push("Local Tailwind compatibility stylesheet is not loaded.");
if (!fs.existsSync("assets/sk-tailwind-compat.css")) errors.push("Local Tailwind compatibility stylesheet is missing.");
if (!html.includes('assets/sk-share.js')) errors.push("Safe share controller is not loaded.");
if (!fs.existsSync("assets/sk-share.js")) errors.push("Safe share controller is missing.");
else {
  const shareCheck = spawnSync(process.execPath, ["--check", "assets/sk-share.js"], { encoding: "utf8" });
  if (shareCheck.status !== 0) errors.push(`Share controller has a JavaScript syntax error:\\n${shareCheck.stderr || shareCheck.stdout}`);
}
for (const icon of ["assets/sk-cyber-hub-icon-192.png", "assets/sk-cyber-hub-icon-512.png"]) {
  if (!fs.existsSync(icon) || fs.statSync(icon).size < 1000) errors.push(`PWA PNG icon is missing or unexpectedly small: ${icon}`);
}
const platformMessagingPath = "supabase/SK-PLATFORM-MESSAGING.sql";
const messengerPath = "supabase/SK-MESSENGER-CALLS-FOUNDATION.sql";
if (fs.existsSync(platformMessagingPath) && fs.existsSync(messengerPath)) {
  const platformSql = fs.readFileSync(platformMessagingPath, "utf8");
  const messengerSql = fs.readFileSync(messengerPath, "utf8");
  if (/create table(?: if not exists)? public\.sk_messages\b/i.test(platformSql)) errors.push("SK Mail must not create the private Messenger table name public.sk_messages.");
  if (!/create table(?: if not exists)? public\.sk_inbox_messages\b/i.test(platformSql)) errors.push("SK Mail migration must create public.sk_inbox_messages.");
  if (!/create table(?: if not exists)? public\.sk_messages\b/i.test(messengerSql)) errors.push("Private Messenger migration must retain public.sk_messages.");
}

const jsAssets = [
  "assets/sk-community.js",
  "assets/sk-discovery.js",
  "assets/sk-platforms.js",
  "assets/sk-messenger.js",
  "assets/sk-live.js",
  "assets/sk-creator-monetization.js",
  "assets/sk-easy-mode.js"
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
if (!html.includes('id="skEasyModeToggle"')) errors.push("Accessible Easy Mode toggle is missing.");
if (!html.includes('href="./assets/sk-easy-mode.css"')) errors.push("Easy Mode stylesheet is not loaded.");
if (!html.includes('src="./assets/sk-easy-mode.js"')) errors.push("Easy Mode behavior script is not loaded.");

const pwaRegisterPath = "pwa-register.js";
if (!fs.existsSync(pwaRegisterPath)) errors.push("PWA registration/update script is missing.");
else {
  const registration = spawnSync(process.execPath, ["--check", pwaRegisterPath], { encoding: "utf8" });
  if (registration.status !== 0) errors.push(`PWA registration script has a JavaScript syntax error:\n${registration.stderr || registration.stdout}`);
  if (!html.includes('src="./pwa-register.js"')) errors.push("index.html is not loading the PWA registration/update script.");
}


const serviceWorkerSource = fs.existsSync(workerPath) ? fs.readFileSync(workerPath, "utf8") : "";
if (serviceWorkerSource && !serviceWorkerSource.includes("PUBLIC_SHELL_URLS")) {
  errors.push("Service worker must use an explicit allowlist for public navigation caching.");
}
if (serviceWorkerSource && !serviceWorkerSource.includes('request.headers.has("authorization")')) {
  errors.push("Service worker must bypass requests carrying an Authorization header.");
}
const installHandler = serviceWorkerSource
  .split('self.addEventListener("install"')[1]
  ?.split('self.addEventListener("activate"')[0] || "";
if (installHandler.includes("self.skipWaiting(")) {
  errors.push("Service worker must not skip the waiting phase during install; updates are user-controlled.");
}

if (errors.length) {
  console.error(errors.join("\n\n"));
  process.exit(1);
}
console.log(`Static checks passed: HTML basics verified; ${checked} inline JavaScript block(s) syntax-checked; no obvious service-role assignment or dynamic-code execution found.`);
