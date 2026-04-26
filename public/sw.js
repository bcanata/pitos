const STATIC_CACHE = 'pitos-static-v1';
const RUNTIME_CACHE = 'pitos-runtime-v1';
const API_CACHE = 'pitos-api-v1';
const ALL_CACHES = [STATIC_CACHE, RUNTIME_CACHE, API_CACHE];
const MAX_API_ENTRIES = 50;

const PRECACHE_URLS = [
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/apple-touch-icon.png',
];

// Paths that should never be intercepted
const SKIP_PATTERNS = ['/api/auth/', '/api/cron/', '/sse', '/api/push/'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;
  if (request.method !== 'GET') return;

  const path = url.pathname;
  if (SKIP_PATTERNS.some((p) => path.includes(p))) return;

  if (request.mode === 'navigate') {
    e.respondWith(handleNavigation(request));
    return;
  }

  if (path.startsWith('/api/channels/') || path.startsWith('/api/teams/')) {
    e.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (
    path.startsWith('/_next/static/') ||
    path.startsWith('/icons/') ||
    path.startsWith('/splash/') ||
    /\.(png|jpg|jpeg|svg|ico|woff2|woff)$/.test(path)
  ) {
    e.respondWith(cacheFirst(request));
    return;
  }
});

async function handleNavigation(request) {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);
    const response = await fetch(request, { signal: ctrl.signal });
    clearTimeout(tid);
    return response;
  } catch {
    const cached = await caches.match('/offline');
    return (
      cached ??
      new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok && !response.headers.get('cache-control')?.includes('no-store')) {
        await cache.put(request, response.clone());
        const keys = await cache.keys();
        if (keys.length > MAX_API_ENTRIES) {
          await Promise.all(
            keys.slice(0, keys.length - MAX_API_ENTRIES).map((k) => cache.delete(k))
          );
        }
      }
      return response;
    })
    .catch(() => null);

  // Serve cache immediately if available; otherwise await network
  if (cached) return cached;

  const response = await networkPromise;
  return (
    response ??
    new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}
