const CACHE_NAME = 'vive-calima-v1';

// Assets locales esenciales que se guardarán en el teléfono del usuario
const assetsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// 1. INSTALACIÓN: Guarda los archivos estáticos en la caché local
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caché interna creada con éxito.');
      return cache.addAll(assetsToCache);
    }).then(() => self.skipWaiting()) // Fuerza a activar el service worker de inmediato
  );
});

// 2. ACTIVACIÓN: Limpia versiones viejas de caché para evitar conflictos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de la app de inmediato
  );
});

// 3. INTERCEPCIÓN DE PETICIONES (FETCH): Estrategia de Red con Respaldo de Caché
// Optimizado para móviles: Si hay red, trae lo más nuevo; si falla la señal, usa la caché.
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean locales (como Firebase o Open-Meteo) para no romper su lógica nativa
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, actualizamos la copia de la caché por si hubo cambios
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si el usuario se quedó sin señal (offline), carga el archivo guardado en el teléfono
        return caches.match(event.request);
      })
  );
});
