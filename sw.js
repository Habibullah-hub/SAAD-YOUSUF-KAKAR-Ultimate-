/* SK Cyber Hub PWA shell — versioned, same-origin only. */
const CACHE_PREFIX = "sk-cyber-hub-shell-";
const CACHE_NAME = CACHE_PREFIX + "v1";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/sk-cyber-hub.svg"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SK_SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin) return;
  if (url.pathname.includes("/rest/v1/") || url.pathname.includes("/auth/v1/") || url.pathname.includes("/functions/v1/")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(new URL("./index.html", scope).href, response.clone());
        }
        return response;
      } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request)) || (await cache.match(new URL("./index.html", scope).href)) || Response.error();
      }
    })());
    return;
  }

  if (url.pathname.endsWith("/manifest.webmanifest") || url.pathname.endsWith("/sk-cyber-hub.svg")) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    })());
  }
});
