// Service Worker for MathGenie
// Cast global self to ServiceWorker context without redeclaring ambient "self" from DOM lib
const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = 'mathgenie-v1';
const STATIC_CACHE_URLS: string[] = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
];

// Install event - cache static assets
sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache: Cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Ensure the new SW activates immediately without returning a value
        sw.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames: string[]) => {
        return Promise.all(
          cacheNames.map((cacheName: string) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return undefined;
          })
        );
      })
      .then(() => {
        // Take control immediately without returning from the handler
        sw.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
sw.addEventListener('fetch', (event: FetchEvent) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(sw.location.origin)) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse: Response | undefined) => {
        // If we have a cached response, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((networkResponse: Response) => {
            // Check if we received a valid response
            const isValidResponse =
              !!networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic';

            if (isValidResponse) {
              // Clone the response before caching (response can only be consumed once)
              const responseToCache = networkResponse.clone();

              // Perform caching as a side-effect without altering the returned value
              caches
                .open(CACHE_NAME)
                .then((cache: Cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch((error: Error) => {
                  console.warn('Failed to cache response:', error);
                });
            }

            // Always return the network response (single return point)
            return networkResponse;
          })
          .catch((error: Error) => {
            console.warn('Network request failed:', error);
            // Return a meaningful error response or fallback
            throw error;
          });
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches
            .match('/index.html')
            .then(res => res ?? new Response('Offline', { status: 503, statusText: 'Service Unavailable' }));
        }
        // For other resources, return an explicit offline response
        return Promise.resolve(
          new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          })
        );
      })
  );
});
