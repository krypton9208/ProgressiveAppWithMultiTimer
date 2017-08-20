var cacheName = 'Client-List';
var folderName = 'ProgressiveAppWithMultiTimer';
var filesToCache = [
  folderName + '/',
  folderName + '/index.html',
  folderName + '/service-worker.js',
  folderName + '/favicon.ico',
  folderName + '/manifest.json',
  folderName + '/images/icons/icon-16x16.png',
  folderName + '/images/icons/icon-24x24.png',
  folderName + '/images/icons/icon-32x32.png',
  folderName + '/images/icons/icon-48x48.png',
  folderName + '/images/icons/icon-64x64.png',
  folderName + '/images/icons/icon-128x128.png',
  folderName + '/images/icons/icon-256x256.png',
  folderName + '/images/icons/icon-512x512.png',
  folderName + '/scripts/app.js',
  folderName + '/scripts/guidHelper.js',
  folderName + '/styles/inline.css',
  folderName + '/styles/css/bootstrap.min.css'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});