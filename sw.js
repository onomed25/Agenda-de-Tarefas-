const CACHE_NAME = 'agenda-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/chart.html',
  '/styles.css',
  '/script.js',
  '/chart.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto, adicionando arquivos...');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.error('[SW] Erro ao cachear:', err))
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('[SW] Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('[SW] Retornando do cache:', event.request.url);
          return response;
        }
        console.log('[SW] Buscando na rede:', event.request.url);
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          console.log('[SW] Offline, retornando fallback');
          return caches.match('/index.html');
        });
      })
  );
});