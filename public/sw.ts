// Service Worker for MathGenie
// Cast global self to ServiceWorker context without redeclaring ambient "self" from DOM lib
const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = 'mathgenie-v1';
const INDEX_HTML = '/index.html';
const OFFLINE_MESSAGE = 'Application is offline';
const TEXT_PLAIN = 'text/plain';
const STATIC_CACHE_URLS: string[] = [
  '/',
  INDEX_HTML,
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
];

const sanitizeError = (error: Error): string => {
  const message = error.message || String(error);
  // A simple sanitizer to prevent log injection and XSS.
  // 1. Escape HTML tags.
  // 2. Replace newlines and tabs with spaces.
  // 3. Remove non-printable characters.
  // 4. Truncate the message.
  return message
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\n\t]/g, ' ')
    .replace(/[^ -~]/g, '?')
    .substring(0, 200);
};

const handleNetworkFailure = async (request: Request): Promise<Response> => {
  const fallbackResponse = await caches.match(request);
  if (fallbackResponse) {
    return fallbackResponse;
  }

  if (request.destination === 'document') {
    const indexResponse = await caches.match(INDEX_HTML);
    if (indexResponse) {
      return indexResponse;
    }
    return new Response(OFFLINE_MESSAGE, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': TEXT_PLAIN },
    });
  }

  return new Response('Resource unavailable offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': TEXT_PLAIN },
  });
};

const handleServiceError = async (request: Request): Promise<Response> => {
  if (request.destination === 'document') {
    const fallbackResponse = await caches.match(INDEX_HTML);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    return new Response('Application Error', {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'Content-Type': TEXT_PLAIN },
    });
  }

  return new Response('Service Error', {
    status: 500,
    statusText: 'Internal Server Error',
    headers: { 'Content-Type': TEXT_PLAIN },
  });
};

// Install event - cache static assets
sw.addEventListener('install', async (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(STATIC_CACHE_URLS);
        // Ensure the new SW activates immediately
        await sw.skipWaiting();
      } catch (error) {
        console.warn('Failed to install service worker:', sanitizeError(error as Error));
        throw error;
      }
    })()
  );
});

// Activate event - clean up old caches
sw.addEventListener('activate', async (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName: string) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
        // Take control immediately
        await sw.clients.claim();
      } catch (error) {
        console.warn('Failed to activate service worker:', sanitizeError(error as Error));
        throw error;
      }
    })()
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
        // Cache hit - return cached response immediately
        if (cachedResponse) {
          return cachedResponse;
        }

        // Cache miss - fetch from network
        return fetch(event.request)
          .then((networkResponse: Response) => {
            // Check if we received a successful response
            if (networkResponse.status === 200 && networkResponse.type === 'basic') {
              // Success response - cache and return
              const responseToCache = networkResponse.clone();

              // Cache response asynchronously
              caches
                .open(CACHE_NAME)
                .then((cache: Cache) => {
                  return cache.put(event.request, responseToCache);
                })
                .catch((error: Error) => {
                  console.warn('Failed to cache response:', sanitizeError(error));
                });

              return networkResponse;
            }

            // Error response (4xx, 5xx) - don't cache, return error response
            if (networkResponse.status >= 400) {
              console.warn(`HTTP error ${networkResponse.status} for ${event.request.url}`);
              return networkResponse;
            }

            // Other response types (redirects, etc.) - return without caching
            return networkResponse;
          })
          .catch((error: Error) => {
            console.warn('Network request failed:', sanitizeError(error));

            // Network failed - try to serve from cache as fallback
            return handleNetworkFailure(event.request);
          });
      })
      .catch((error: Error) => {
        console.warn('Service worker fetch failed:', sanitizeError(error));
        return handleServiceError(event.request);
      })
  );
});