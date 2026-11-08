import fs from "node:fs";
import { spawnSync } from "node:child_process";

const html = fs.readFileSync("index.html", "utf8");
const errors = [];
if (!/^<!doctype html>/i.test(html.trimStart())) errors.push("index.html is missing an HTML5 doctype.");
if (!/<meta\s+name=["']viewport["']/i.test(html)) errors.push("index.html is missing a responsive viewport meta tag.");
if (!/<title>[^<]+<\/title>/i.test(html)) errors.push("index.html is missing a page title.");
if (html.includes("\\n</style>\\n")) errors.push("index.html contains literal escaped newline markers around a style block; use real line breaks.");
if (!html.includes("window.skRunDirectorySearch=()=>{runSearch();filterApps();}")) errors.push("Header search is missing the unified directory-search entry point.");
if (!html.includes('id="search"') || html.includes('id="searchBtn"')) errors.push("Header search should be input-only without a separate search button.");
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
if (/@supabase\/supabase-js@2(?:["'\/]|$)/i.test(html)) errors.push("Supabase browser SDK must use an exact version, not the floating @2 alias.");
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
  if (!fs.existsSync(icon) || fs.statSync(icon).size < 500) errors.push(`PWA PNG icon is missing or unexpectedly small: ${icon}`);
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
  "assets/sk-easy-mode.js",
  "assets/sk-theme-mode.js",
  "assets/sk-creator-hub.js"
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


/* SK Browser and lightweight experience regression checks. */
for (const [assetPath, page, label] of [
  ["assets/sk-motion-performance.css", html, "homepage motion"],
  ["assets/sk-browser-experience.css", fs.readFileSync("browser.html", "utf8"), "browser experience"]
]) {
  if (!fs.existsSync(assetPath)) errors.push(`Missing ${label} stylesheet: ${assetPath}`);
  else if (!page.includes(assetPath)) errors.push(`The expected page does not link ${assetPath}.`);
}
const browserHtml = fs.existsSync("browser.html") ? fs.readFileSync("browser.html", "utf8") : "";
if (!browserHtml.includes('id="searchForm"') || !browserHtml.includes('id="searchForm3"')) {
  errors.push("SK Browser is missing its global or SK-directory search form.");
}
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v15"')) {
  errors.push("Service worker cache version was not advanced for the updated public shell.");
}
for (const assetPath of ["assets/sk-motion-performance.css", "assets/sk-browser-experience.css"]) {
  if (fs.existsSync(assetPath) && !serviceWorkerSource.includes(assetPath)) {
    errors.push(`Service worker does not allowlist the new public stylesheet: ${assetPath}`);
  }
}
if (!serviceWorkerSource.includes('new URL("browser.html", APP_ROOT).href')) {
  errors.push("SK Browser is not included in the offline public shell allowlist.");
}

/* SK appearance, news, community trend and branded search regressions. */
for (const [assetPath, page, label] of [
  ["assets/sk-theme-mode.css", html, "day/night theme"],
  ["assets/sk-news-premium.css", html, "news layout"]
]) {
  if (!fs.existsSync(assetPath)) errors.push(`Missing ${label} stylesheet: ${assetPath}`);
  else if (!page.includes(assetPath)) errors.push(`Homepage does not load ${assetPath}.`);
}
if (!fs.existsSync("assets/sk-theme-mode.js") || !html.includes("assets/sk-theme-mode.js")) errors.push("Persistent homepage day/night toggle is missing.");
if (!html.includes('id="skAdminButton"') || !html.includes('>SYK</button>')) errors.push("Visible homepage admin logo must use the SYK mark.");
if (!html.includes("YouTube Only") || !html.includes("const mode=forcedMode||modeInput.value||'all';")) errors.push("Related-video search must honor the selected YouTube-only filter.");
if (!html.includes("await initializeSKDatabase()")) errors.push("Admin login must retry database initialization before reporting a connection failure.");
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v15"')) errors.push("Service worker cache version was not advanced for the latest homepage experience.");
for (const assetPath of ["assets/sk-theme-mode.css","assets/sk-theme-mode.js","assets/sk-news-premium.css","assets/syk-neon-refresh.css"]) {
  if (!serviceWorkerSource.includes(assetPath)) errors.push(`Service worker does not allowlist ${assetPath}.`);
}
const browserExperience = fs.readFileSync("browser.html", "utf8");
if (!browserExperience.includes("SYK Browser stays open") || !browserExperience.includes("target='_blank'")) errors.push("External web search must preserve the SK Browser page in its own tab.");
const communityExperience = fs.readFileSync("assets/sk-community.js", "utf8");
if (!communityExperience.includes("SK Community Trending") || !communityExperience.includes("Rank ")) errors.push("Community trending ranks and truthful scope label are missing.");

/* SK Creator Hub owner permission and embed regressions. */
for (const assetPath of ["assets/sk-creator-hub.css","assets/sk-creator-hub.js"]) {
  if (!fs.existsSync(assetPath)) errors.push(`Creator Hub asset is missing: ${assetPath}`);
  else if (!html.includes(assetPath)) errors.push(`Homepage does not load Creator Hub asset ${assetPath}.`);
}
if (!fs.existsSync("supabase/SK-CREATOR-HUB.sql")) errors.push("Creator Hub approval migration is missing.");
if (!html.includes('id="skCreatorHub"') || !html.includes('id="skCreatorForm"')) errors.push("Creator Hub homepage or member submission form is missing.");
if (!html.includes('id="skCreatorOwnerPlayer"') || !html.includes('id="skCreatorMemberVideos"')) errors.push("Owner-first featured video playback or member video feed is missing.");
if (!html.includes('id="skCreatorSubmitToggle"') || !html.includes('id="skCreatorMySubmissions"')) errors.push("Video-only member submit control or submission status panel is missing.");
if (!html.includes('id="skCreatorSaveFeatured"')) errors.push("Owner featured-video-only setting is missing.");
if (!html.includes('id="skCreatorRegisteredMembers"')) errors.push("Owner-only registered members panel is missing.");
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v15"')) errors.push("Service worker cache was not advanced for Creator Hub.");
for (const assetPath of ["assets/sk-creator-hub.css","assets/sk-creator-hub.js"]) if (!serviceWorkerSource.includes(assetPath)) errors.push(`Service worker does not allowlist ${assetPath}.`);

if (errors.length) {
  console.error(errors.join("\n\n"));
  process.exit(1);
}
console.log(`Static checks passed: HTML basics verified; ${checked} inline JavaScript block(s) syntax-checked; no obvious service-role assignment or dynamic-code execution found.`);
