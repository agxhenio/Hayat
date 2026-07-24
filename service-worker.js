/* Hayat — privacy-first app-shell cache. */
const CACHE_NAME = 'hayat-app-shell-v20';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/css/design-tokens.css',
  './assets/icons/hayat-192.png',
  './assets/icons/hayat-512.png',
  './assets/icons/hayat-maskable-512.png',
  './js/app.js',
  './js/config.js',
  './js/data/app-sources.js',
  './js/data/daily-dhikr.js',
  './js/data/mburoja-catalog.js',
  './js/data/mburoja-content.js',
  './js/data/post-prayer-dhikr.js',
  './js/data/quran-surahs.js',
  './js/data/quran-transliteration-sq.js',
  './js/events.js',
  './js/router.js',
  './js/services/articles.js',
  './js/services/location.js',
  './js/services/prayer-times.js',
  './js/services/quran-content.js',
  './js/services/quran-search-index.js',
  './js/services/qibla.js',
  './js/storage/article-cache.js',
  './js/storage/daily-dhikr-progress.js',
  './js/storage/database.js',
  './js/storage/data-export.js',
  './js/storage/data-import.js',
  './js/storage/data-import.js',
  './js/storage/day-planner.js',
  './js/storage/post-prayer-dhikr-progress.js',
  './js/storage/prayer-cache.js',
  './js/storage/prayer-log.js',
  './js/storage/quran-content-cache.js',
  './js/storage/quran-reading.js',
  './js/storage/quran-bookmarks.js',
  './js/storage/settings-storage.js',
  './js/store.js',
  './js/utils/date-time.js',
  './js/utils/post-prayer-dhikr.js',
  './pages/dhikr.js',
  './pages/home.js',
  './pages/more.js',
  './pages/prayer-dhikr.js',
  './pages/prayer.js',
  './pages/quran.js',
  './pages/settings.js',
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(APP_SHELL);
  }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key.indexOf('hayat-') === 0 && key !== CACHE_NAME;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () {
    return self.clients.claim();
  }));
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(function (response) {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put('./index.html', copy); });
      return response;
    }).catch(function () {
      return caches.match('./index.html');
    }));
    return;
  }

  event.respondWith(caches.match(request).then(function (cached) {
    var network = fetch(request).then(function (response) {
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
      }
      return response;
    });
    return cached || network;
  }));
});
