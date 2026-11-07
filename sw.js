// Faz o app abrir sem internet. Arquivos do app: tenta a rede primeiro (para pegar
// atualizações) e usa a cópia salva quando estiver offline.
const CACHE = 'pedidos-v16';
const ARQUIVOS = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png',
  './logo.png', './logo-pdf.jpg', './fotos.json',
  './pdf.js', './jspdf.umd.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);

  // Planilha (Apps Script): nunca guardar em cache.
  if (u.hostname.endsWith('google.com') || u.hostname.endsWith('googleusercontent.com')) return;

  if (u.origin === location.origin) {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request, { ignoreSearch: true })
          .then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Fontes do Google: guarda depois do primeiro uso.
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const c = res.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return res;
    })));
  }
});
