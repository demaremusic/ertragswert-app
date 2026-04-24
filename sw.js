const CACHE_NAME = 'ertragswert-v1';
const FILES_TO_CACHE = [
  './',
  './Ertragswertberechnung_Immobilie-11.html',
  './manifest.json'
];

// Installation: Dateien cachen
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Cache geöffnet');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivierung: alte Caches löschen
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch: zuerst Cache, dann Netzwerk
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    }).catch(function() {
      // Fallback falls offline und nicht gecacht
      return caches.match('./Ertragswertberechnung_Immobilie-11.html');
    })
  );
});
