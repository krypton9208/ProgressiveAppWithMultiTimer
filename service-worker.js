var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
  '/',
  '/index.html',
  '/service-worker.js',
  '/favicon.ico',
  '/images/icons/icon-16x16.png',
  '/images/icons/icon-24x24.png',
  '/images/icons/icon-32x32.png',
  '/images/icons/icon-48x48.png',
  '/images/icons/icon-64x64.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-256x256.png',
  '/images/icons/icon-512x512.png',
  '/scripts/app.js',
  '/scripts/guidHelper.js',
  '/styles/inline.css',
  '/styles/css/bootstrap.min.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png'];

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