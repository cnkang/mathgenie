/// <reference lib="webworker" />
declare const __CACHE_VERSION__: string;
declare const __PRECACHE_URLS__: string[];
const worker = self as unknown as ServiceWorkerGlobalScope;
const PREFIX = "mathgenie-";
const CACHE = `${PREFIX}${__CACHE_VERSION__}`;
const INDEX = "/index.html";
worker.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(__PRECACHE_URLS__)));
  // Wait for existing tabs to close; do not replace their resource version mid-session.
});
worker.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(PREFIX) && name !== CACHE)
          .map((name) => caches.delete(name)),
      );
      await worker.clients.claim();
    })(),
  );
});
worker.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== worker.location.origin ||
    url.pathname === "/sw.js"
  )
    return;
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          return (
            (await (await caches.open(CACHE)).match(INDEX)) ??
            new Response("Application is offline", { status: 503 })
          );
        }
      })(),
    );
    return;
  }
  event.respondWith(
    (async () => {
      const cached = await (await caches.open(CACHE)).match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          event.waitUntil(
            caches
              .open(CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => {}),
          );
        }
        return response;
      } catch {
        return new Response("Resource unavailable offline", { status: 503 });
      }
    })(),
  );
});
