// ZibaQ service worker
// Caches the app shell (HTML/CSS/JS/icons) for fast repeat visits and offline installs.
// Deliberately does NOT cache the order page's dynamic data, so prices/stock/status
// always come fresh when there's a connection.

const CACHE_VERSION = 'zibaq-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './offline.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('zibaq-') && key !== SHELL_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Navigations (page loads): try network first, fall back to cached shell, then offline page.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match('./index.html').then((res) => res || caches.match('./offline.html'))
      )
    );
    return;
  }

  const url = new URL(req.url);
  const isImage = req.destination === 'image';

  if (isImage) {
    // Cache-first for gallery/product images so they still show once loaded before.
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req)
            .then((netRes) => {
              cache.put(req, netRes.clone());
              return netRes;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // App shell files: cache-first, refresh in background.
  if (SHELL_ASSETS.some((asset) => url.pathname.endsWith(asset.replace('./', '/')))) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
