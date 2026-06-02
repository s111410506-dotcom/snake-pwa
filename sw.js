const CACHE = 'snake-pwa-v2';

const PRECACHE_URLS = [
  '/snake-pwa/',
  '/snake-pwa/index.html',
  '/snake-pwa/styles.css',
  '/snake-pwa/app.js',
  '/snake-pwa/manifest.json',
  '/snake-pwa/icons/icon-192.png',
  '/snake-pwa/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
