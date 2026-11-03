const CACHE = 'e-nile-shell-v2';
const ASSETS = ['/', '/index.html', '/app.js', '/style.css', '/logo.jpg'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
    event.respondWith(
        fetch(event.request).then(response => {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
            return response;
        }).catch(() => caches.match(event.request))
    );
});
