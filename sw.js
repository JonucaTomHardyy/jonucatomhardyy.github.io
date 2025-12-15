const CACHE_NAME = 'tasks-app-v1';
const urlsToCache = ['index.html', 'styles.css', 'script.js', 'manifest.json'];  // Ajoute d'autres fichiers si besoin, comme ton icône

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});