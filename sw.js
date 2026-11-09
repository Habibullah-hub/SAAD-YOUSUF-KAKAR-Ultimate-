/* SK Cyber Hub offline shell.
   Network-first for a small, explicit list of public app-shell pages only.
   Never cache API, authenticated, query-string, or third-party requests. */
const CACHE_NAME = "sk-cyber-hub-shell-v25";
const APP_ROOT = new URL("./", self.location).href;
const PUBLIC_SHELL_URLS = new Set([
  APP_ROOT,
  new URL("browser.html", APP_ROOT).href,
  new URL("games.html", APP_ROOT).href
]);
const PUBLIC_STATIC_ASSETS = new Set([
  "assets/sk-community.css","assets/sk-p0-rtl-modal.css","assets/sk-community.js",
  "assets/sk-connect.css","assets/sk-creator-monetization.css","assets/sk-creator-monetization.js",
  "assets/sk-digital-workbench.css","assets/sk-digital-workbench.js",
  "assets/sk-discovery.css","assets/sk-discovery.js",
  "assets/sk-easy-mode.css","assets/sk-easy-mode.js",
  "assets/sk-live.js","assets/sk-messenger.js","assets/syk-daily-islamic.css","assets/syk-daily-islamic.js",
  "assets/sk-platforms.css","assets/sk-platforms.js",
  "assets/sk-ultimate-experience-v2.css","assets/sk-world-class-experience-v1.css",
  "assets/sk-motion-performance.css","assets/sk-browser-experience.css",
  "assets/sk-theme-mode.css","assets/sk-theme-mode.js","assets/sk-account-presence.js","assets/sk-premium-interactions.css","assets/sk-premium-interactions.js","assets/sk-news-premium.css","assets/syk-neon-refresh.css",
  "assets/sk-creator-hub.css","assets/sk-creator-hub.js",
  "assets/sk-browser-video-hub.css","assets/sk-browser-video-hub.js","assets/syk-cyber-hub-logo.svg",
  "assets/sk-tailwind-compat.css","assets/sk-share.js","assets/sk-cyber-hub-icon-192.png","assets/sk-cyber-hub-icon-512.png","pwa-register.js"
].map(path => new URL(path, APP_ROOT).href));

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SK_SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache the public home shell and a fixed allowlist of same-origin CSS/JS.
    // Never add API responses, authenticated pages, query-string URLs or third-party files.
    await cache.addAll([...PUBLIC_SHELL_URLS, ...PUBLIC_STATIC_ASSETS]);
    // Do not call skipWaiting here: pwa-register.js offers the user an
    // explicit Update action so an in-progress session is not interrupted.
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name.startsWith("sk-cyber-hub-") && name !== CACHE_NAME)
        .map(name => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin || requestUrl.search) return;
  if (request.headers.has("authorization")) return;

  // Public static assets only: network-first, with a verified same-origin cache fallback.
  if (PUBLIC_STATIC_ASSETS.has(requestUrl.href)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.ok && response.type === "basic") {
          await cache.put(requestUrl.href, response.clone());
        }
        return response;
      } catch (_) {
        return (await cache.match(requestUrl.href)) || Response.error();
      }
    })());
    return;
  }

  // Only these public app-shell navigations are eligible for offline fallback.
  if (request.mode !== "navigate" || !PUBLIC_SHELL_URLS.has(requestUrl.href)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(requestUrl.href, response.clone());
      }
      return response;
    } catch (_) {
      return (await caches.match(requestUrl.href)) ||
        (await caches.match(APP_ROOT)) ||
        Response.error();
    }
  })());
});
