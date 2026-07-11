/**
 * Hayat Service Worker (sw.js)
 * Mundëson funksionimin offline të aplikacionit
 */

const CACHE_NAME = 'hayat-cache-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './js/app.js',
  './js/router.js',
  './js/core/storage.js',
  './js/core/utils.js',
  'https://unpkg.com/lucide@latest' // Cache the icon library
];

// Install Event - Caches core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching Core Assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// Activate Event - Cleans up old caches
self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing Old Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event - Network first, falling back to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Update cache with new response
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request);
      })
  );
});
