import fs from "node:fs";
import { spawnSync } from "node:child_process";

const html = fs.readFileSync("index.html", "utf8");
const errors = [];
if (!/^<!doctype html>/i.test(html.trimStart())) errors.push("index.html is missing an HTML5 doctype.");
if (!/<meta\s+name=["']viewport["']/i.test(html)) errors.push("index.html is missing a responsive viewport meta tag.");
if (!/<title>[^<]+<\/title>/i.test(html)) errors.push("index.html is missing a page title.");
if (html.includes("\\n</style>\\n")) errors.push("index.html contains literal escaped newline markers around a style block; use real line breaks.");
if (!html.includes("window.skRunDirectorySearch=()=>{runSearch();filterApps();}")) errors.push("Header search is missing the unified directory-search entry point.");
if (!html.includes('id="search"') || !html.includes('id="searchBtn"') || !html.includes('class="searchbox syk-home-header-search"')) errors.push("Homepage header must include its visible unified search field and Search button.");
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
  "assets/sk-creator-hub.js",
  "assets/sk-browser-video-hub.js",
  "assets/sk-sovereign-reader.js",
  "assets/sk-directory-spotlight.js"
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
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v28"')) {
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
if (!html.includes('id="skAdminButton"') || !html.includes('alt="SYK"')) errors.push("Visible homepage admin logo must use the SYK mark.");
if (!html.includes("YouTube Only") || !html.includes("const mode=forcedMode||modeInput.value||'all';")) errors.push("Related-video search must honor the selected YouTube-only filter.");
if (!html.includes("await initializeSKDatabase()")) errors.push("Admin login must retry database initialization before reporting a connection failure.");
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v28"')) errors.push("Service worker cache version was not advanced for the latest homepage experience.");
for (const assetPath of ["assets/sk-theme-mode.css","assets/sk-theme-mode.js","assets/sk-news-premium.css","assets/syk-neon-refresh.css"]) {
  if (!serviceWorkerSource.includes(assetPath)) errors.push(`Service worker does not allowlist ${assetPath}.`);
}
const browserExperience = fs.readFileSync("browser.html", "utf8");
if (!browserExperience.includes("window.SKReader.openSearch(q)") || !browserExperience.includes("SKReader")) errors.push("Global browser search must open the branded in-app reader shell.");

if (!browserHtml.includes('id="sykVideoHub"') || !browserHtml.includes('id="sykVideoForm"')) errors.push("SYK Browser home is missing its video-only Creator Hub.");
if (!browserHtml.includes('id="sykAdminMediaForm"') || !browserHtml.includes('id="sykVideoDialog"')) errors.push("SYK Browser is missing owner media publishing or the video popup player.");
if (!browserHtml.includes('sk-browser-video-hub.js')) errors.push("SYK Browser video hub controller is not loaded.");
if (!fs.existsSync("supabase/SK-BROWSER-VIDEO-HUB.sql")) errors.push("Owner-managed video/image/channel media migration is missing.");
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
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v27"')) errors.push("Service worker cache was not advanced for Creator Hub.");
for (const assetPath of ["assets/sk-creator-hub.css","assets/sk-creator-hub.js"]) if (!serviceWorkerSource.includes(assetPath)) errors.push(`Service worker does not allowlist ${assetPath}.`);


const browser = fs.readFileSync("browser.html","utf8");
if (!html.includes("SYK Browser is the default public landing page")) errors.push("SYK Browser default homepage redirect is missing.");
if (!browser.includes('id="sykVideoHub"')) errors.push("SYK Browser video feed is missing.");
if (!browser.includes('id="sykVideoSearch"')) errors.push("SYK Browser video search control is missing.");

/* SYK Islamic reminder, Islam360 navigation and Live camera regressions. */
if (!html.includes('data-sk-bottom="islam360"') || !html.includes('https://webapp.theislam360.com/')) errors.push("Islam360 direct launch is missing from the fixed bottom navigation.");
if (!html.includes('id="sykDailyNaseeha"') || !html.includes('id="sykDailyTranslationToggle"')) errors.push("Public daily Quran reminder or Urdu translation toggle is missing.");
for (const assetPath of ["assets/syk-daily-islamic.css","assets/syk-daily-islamic.js"]) {
  if (!fs.existsSync(assetPath)) errors.push(`Daily Quran reminder asset is missing: ${assetPath}`);
  else if (!html.includes(assetPath)) errors.push(`Homepage does not load daily Quran reminder asset ${assetPath}.`);
  if (!serviceWorkerSource.includes(assetPath)) errors.push(`Service worker does not allowlist daily Quran reminder asset ${assetPath}.`);
}
const dailyQuran = fs.readFileSync("assets/syk-daily-islamic.js","utf8");
if (!dailyQuran.includes("quranenc.com/api/v1/translation/aya/urdu_junagarhi") || !dailyQuran.includes("quran-uthmani")) errors.push("Daily Quran reminder must use the attributed Urdu QuranEnc translation and Uthmani Arabic fallback.");
if (!html.includes('id="skLivePreviewCanvas"') || !html.includes('id="skLiveGoLive"')) errors.push("SYK Live camera preview and explicit Go Live control are missing.");
if (!html.includes('data-syk-filter="soft"') || !html.includes('id="skLiveSwitchCamera"')) errors.push("SYK Live camera filters or front/back camera switch are missing.");
const liveExperience = fs.readFileSync("assets/sk-live.js","utf8");
if (!liveExperience.includes("captureStream(24)") || !liveExperience.includes("publishTrack(videoTrack")) errors.push("SYK Live camera filters are not included in the broadcast stream.");
if (!liveExperience.includes("skLiveLoginGate")) errors.push("SYK Live login gate is missing.");
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v27"')) errors.push("Service worker cache was not advanced for the new SYK features.");


/* Premium profile, header, triple-tap admin and Quran typography regressions. */
if (!html.includes('assets/sk-premium-interactions.css') || !html.includes('assets/sk-premium-interactions.js')) errors.push("Premium interaction assets are not loaded.");
if (!html.includes('data-sk-admin-gesture="triple"') || /id="skAdminButton"[^>]*onclick=/.test(html)) errors.push("Admin logo must not open login on a single click.");
if (!html.includes('id="sykDailyFoldToggle"') || !html.includes('class="syk-daily-content"')) errors.push("Quran fold/unfold control is missing.");
const premiumJs = fs.readFileSync("assets/sk-premium-interactions.js", "utf8");
if (!premiumJs.includes("1250") || !premiumJs.includes("skAccountUnreadBadge") || !premiumJs.includes("sk_inbox_messages")) errors.push("Triple-tap admin or real notification badge behavior is missing.");

if (!premiumJs.includes("onAuthStateChange") || !premiumJs.includes("sk_creator_admin_alerts")) errors.push("Profile notification refresh or owner alert integration is missing.");
if (!fs.readFileSync("assets/sk-premium-interactions.css", "utf8").includes("Noto Naskh Arabic")) errors.push("Quran Arabic typography fallback stack is missing.");


// P0 multilingual typography, public Supabase key guard, and modal regression checks.
const p0CssPath = "assets/sk-p0-rtl-modal.css";
if (!fs.existsSync(p0CssPath)) errors.push("P0 Urdu/Arabic and Admin modal stylesheet is missing.");
else {
  const p0Css = fs.readFileSync(p0CssPath, "utf8");
  if (!p0Css.includes('font-family: "Amiri"')) errors.push("Arabic Amiri font rule is missing.");
  if (!p0Css.includes('font-family: "Noto Nastaliq Urdu"')) errors.push("Urdu Noto Nastaliq font rule is missing.");
  if (!p0Css.includes("#authModal > .sk-admin-modal-panel")) errors.push("Android Admin modal sizing rule is missing.");
}
for (const pagePath of ["index.html", "browser.html"]) {
  const page = fs.readFileSync(pagePath, "utf8");
  if (!page.includes('assets/sk-p0-rtl-modal.css')) errors.push(`${pagePath} does not load the shared P0 typography/modal stylesheet.`);
}
if (!html.includes("function getPublicSupabaseKeyRole(value)")) errors.push("Supabase client initialization must validate public key type before connecting.");
if (!html.includes("keyRole !== 'publishable' && keyRole !== 'anon'")) errors.push("Supabase browser client must reject secret/service-role keys.");
if (!html.includes("safeProjectUrl = parsed.origin")) errors.push("Stored Supabase URL must be normalized to an HTTPS project origin.");
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v27"') || !serviceWorkerSource.includes('"assets/sk-p0-rtl-modal.css"')) errors.push("Service worker must version and cache the P0 stylesheet.");


/* Neural Core and Privacy Center safety/regression checks. */
for (const asset of ["assets/sk-neural-core.js", "assets/sk-privacy-center.js"]) {
  if (!fs.existsSync(asset)) errors.push("Missing browser feature module: " + asset);
  else {
    const result = spawnSync(process.execPath, ["--check", asset], { encoding: "utf8" });
    if (result.status !== 0) errors.push("Feature module syntax error (" + asset + "): " + (result.stderr || result.stdout));
  }
}
const browserPage = fs.readFileSync("browser.html", "utf8");
for (const id of ["sykDigitalLab", "skMiniGenerate", "skPrivacyRun", "skPrivacyClear"]) {
  if (!browserPage.includes('id="' + id + '"')) errors.push("Browser page missing feature mount: " + id);
}
const privacySource = fs.readFileSync("assets/sk-privacy-center.js", "utf8");
if (/localStorage\.clear\s*\(|sessionStorage\.clear\s*\(/.test(privacySource)) errors.push("Privacy Center must never clear all local/session storage.");
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v27"') || !serviceWorkerSource.includes('"assets/sk-neural-core.js"') || !serviceWorkerSource.includes('"assets/sk-privacy-center.js"')) errors.push("Service worker must version/cache Neural Core and Privacy Center modules.");

if (errors.length) {
  console.error(errors.join("\n\n"));
  process.exit(1);
}
console.log(`Static checks passed: HTML basics verified; ${checked} inline JavaScript block(s) syntax-checked; no obvious service-role assignment or dynamic-code execution found.`);


/* Phase 1 sovereign reader and design-system checks. */
for (const asset of ["assets/sk-sovereign-reader.js","assets/sk-sovereign-reader.css"]) if (!fs.existsSync(asset)) errors.push("Missing Phase 1 reader asset: "+asset);
const readerSource = fs.existsSync("assets/sk-sovereign-reader.js") ? fs.readFileSync("assets/sk-sovereign-reader.js","utf8") : "";
if (!readerSource.includes("u.protocol") || !readerSource.includes("setAttribute") || !readerSource.includes("no-referrer")) errors.push("Reader must enforce HTTPS, iframe sandbox and no-referrer policy.");
if (!readerSource.includes("اصل پبلشر")) errors.push("Reader must provide an explicit publisher fallback.");
if (!browserExperience.includes("assets/sk-sovereign-reader.css") || !browserExperience.includes("assets/sk-sovereign-reader.js")) errors.push("Browser page is missing the branded reader assets.");
if (!serviceWorkerSource.includes("sk-sovereign-reader.css") || !serviceWorkerSource.includes("sk-sovereign-reader.js")) errors.push("Service worker does not cache the Phase 1 reader assets.");


/* Directory Spotlight, fixed five-item dock and low-effects regression checks. */
const spotlightJsPath = "assets/sk-directory-spotlight.js";
const spotlightCssPath = "assets/sk-directory-spotlight.css";
for (const asset of [spotlightJsPath, spotlightCssPath]) if (!fs.existsSync(asset)) errors.push("Missing Directory Spotlight asset: " + asset);
else if (asset.endsWith(".js")) { const result = spawnSync(process.execPath, ["--check", asset], { encoding: "utf8" }); if (result.status !== 0) errors.push("Directory Spotlight JavaScript syntax error: " + (result.stderr || result.stdout)); }
if (!html.includes('id="skDirectorySpotlightSearch"') && !html.includes('assets/sk-directory-spotlight.js')) errors.push("Homepage must load the Directory Spotlight controller.");
if (!html.includes('data-sk-profile') || !html.includes('data-sk-bottom="browser"') || !html.includes('data-sk-bottom="community"')) errors.push("Homepage bottom dock must contain Home, Apps, Browser, Community and Profile destinations.");
if (!serviceWorkerSource.includes('"sk-cyber-hub-shell-v28"') || !serviceWorkerSource.includes('assets/sk-directory-spotlight.js') || !serviceWorkerSource.includes('assets/sk-directory-spotlight.css')) errors.push("Service worker must cache the Directory Spotlight assets in the v28 shell.");
