// Service Worker for MathGenie
const CACHE_NAME = 'mathgenie-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then(cachedResponse => {
        // If we have a cached response, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Check if we received a valid response
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== 'basic'
            ) {
              return networkResponse;
            }

            // Clone the response before caching (response can only be consumed once)
            const responseToCache = networkResponse.clone();

            // Cache the response for future use
            caches
              .open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.warn('Failed to cache response:', error);
              });

            return networkResponse;
          })
          .catch(error => {
            console.warn('Network request failed:', error);
            // Return a meaningful error response or fallback
            throw error;
          });
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
        // For other resources, let the request fail naturally
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
  );
});
