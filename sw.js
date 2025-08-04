const CACHE_NAME = 'wvssm-cache-v2'; // Bumped version
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Cache failed during install:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // Take control immediately
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests (e.g., POST to Google Apps Script)
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // Try cache first, fallback to network
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).catch(() => {
        // Fallback: return index.html for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
