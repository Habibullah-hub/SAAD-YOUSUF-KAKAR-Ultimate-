/* SK Cyber Hub offline shell.
   Network-first for a small, explicit list of public app-shell pages only.
   Never cache API, authenticated, query-string, or third-party requests. */
const CACHE_NAME = "sk-cyber-hub-shell-v6";
const APP_ROOT = new URL("./", self.location).href;
const PUBLIC_SHELL_URLS = new Set([
  APP_ROOT,
  new URL("browser.html", APP_ROOT).href,
  new URL("games.html", APP_ROOT).href
]);

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SK_SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache only the public home shell during installation.
    await cache.add(APP_ROOT);
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
  if (request.method !== "GET" || request.mode !== "navigate") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin || requestUrl.search) return;
  if (request.headers.has("authorization")) return;
  if (!PUBLIC_SHELL_URLS.has(requestUrl.href)) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type !== "opaque") {
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
