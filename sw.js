/**
 * 🕋 Hayat - Islamic Life Manager PWA
 * 📡 Service Worker për funksionim Offline & Caching
 */

const CACHE_NAME = 'hayat-cache-v1.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './css/main.css',
    './css/variables.css',
    './css/reset.css',
    './css/base.css',
    './css/components.css',
    './css/animations.css',
    './css/themes.css'
    // Do t'i shtojmë skedarët JS sapo t'i krijojmë
];

// 1. Instalimi i Service Worker (Krijimi i Cache-it)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Duke bërë cache asetet bazë...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. Aktivizimi (Pastrimi i Cache-ve të vjetra kur ka update)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Duke fshirë cache-in e vjetër:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Interceptimi i kërkesave (Offline-First Strategy)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Kthe përgjigjen nga Cache nëse ekziston (Offline Mode)
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Përndryshe, kërkoje nga rrjeti (Online Mode)
                return fetch(event.request).catch(() => {
                    // Këtu mund të kthejmë një faqe "Offline" nëse dështon rrjeti
                    console.warn('[Service Worker] Rrjeti dështoi dhe aseti nuk është në cache.');
                });
            })
    );
});
