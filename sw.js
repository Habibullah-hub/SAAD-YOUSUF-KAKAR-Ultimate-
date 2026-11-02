/* SK Cyber Hub offline app shell. Dynamic APIs and third-party content are never cached. */
const CACHE_NAME = "sk-cyber-hub-shell-v1";
const APP_ROOT = new URL("./", self.location).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(APP_ROOT);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("sk-cyber-hub-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode !== "navigate") return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(APP_ROOT, response.clone());
      }
      return response;
    } catch (error) {
      return (await caches.match(request)) || (await caches.match(APP_ROOT)) || Response.error();
    }
  })());
});
