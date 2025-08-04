// Cache version – bump this when you update assets
const CACHE_NAME = 'wvssm-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.css',
  'https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js'
];

// IMPORTANT: Clean any accidental whitespace in URLs
const cleanedUrls = urlsToCache.map(url => url.trim());

self.addEventListener('install', event => {
  // Cache all critical assets during install
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(cleanedUrls))
      .catch(err => console.error('Cache failed during install:', err))
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );

  // Take control of all clients (pages) immediately
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // === 1. Don't cache non-GET requests (e.g. form submission to Google Sheets)
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // === 2. Try cache first, fallback to network
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, go to network
      return fetch(request).then(networkResponse => {
        // Optionally cache new responses (advanced)
        return networkResponse;
      }).catch(() => {
        // === 3. Fallback for navigation (HTML pages)
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // For other assets (images, CSS, JS), return nothing = fail gracefully
      });
    })
  );
});
