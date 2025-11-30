// Service Worker for AGCMS - Offline functionality and caching
const CACHE_NAME = 'agcms-v1';
const STATIC_CACHE = 'agcms-static-v1';
const DYNAMIC_CACHE = 'agcms-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/members',
  '/attendance',
  '/messaging',
  '/offline',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static files');
      return cache.addAll(STATIC_FILES).catch((err) => {
        console.log('[Service Worker] Cache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
          })
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || !url.origin.includes(location.origin)) {
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseClone = response.clone();
          
          // Cache successful GET requests
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Return from cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline JSON for API requests
            if (request.headers.get('accept')?.includes('application/json')) {
              return new Response(
                JSON.stringify({ 
                  error: 'Offline', 
                  message: 'You are currently offline. Please check your connection.' 
                }),
                {
                  headers: { 'Content-Type': 'application/json' },
                  status: 503,
                }
              );
            }
          });
        })
    );
    return;
  }

  // Static files - cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance' || event.tag === 'sync-members') {
    event.waitUntil(syncData(event.tag));
  }
});

async function syncData(tag) {
  // This would sync pending operations when back online
  console.log('[Service Worker] Syncing:', tag);
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification('AGCMS', options)
  );
});

