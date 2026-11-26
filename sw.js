// DESk service worker — makes the app open and run with no internet.
// build.py rewrites VERSION every build, so phones pick up updates automatically.
const VERSION = 'desk-a8713d1ca0';
const SHELL = ['./', 'index.html', 'css/app.css?v=059a075bbe', 'js/desk.js?v=56e51935b5', 'js/jsQR.js', 'manifest.webmanifest', 'favicon.ico', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())) });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== 'desk-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim())) });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  // Fonts: cache after first use so the app looks right offline
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open('desk-fonts').then(async c => { const hit = await c.match(req); if (hit) return hit; const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r }).catch(() => Response.error()));
    return;
  }
  if (url.origin !== location.origin) return; // the sync relay etc. always go to the network
  const isPage = req.mode === 'navigate';
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    const hit = isPage ? (await c.match('index.html')) || (await c.match('./')) : await c.match(req);
    if (hit) return hit;
    try { const r = await fetch(req); if (r.ok && !isPage) c.put(req, r.clone()); return r }
    catch { return isPage ? (await c.match('index.html')) : Response.error() }
  })());
});
