// Minimal network-first service worker — offline fallback only, no aggressive caching.
// Keeps dev & preview safe: normal requests always go to the network.
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('nihad-offline-v1').then((cache) => cache.addAll([OFFLINE_URL, '/icon.svg'])).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== 'nihad-offline-v1').map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/') || url.searchParams.has('XTransformPort')) return

  // Navigations: network first, offline page fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(
          (cached) =>
            cached ||
            new Response(
              '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — Nihad KP</title><style>body{background:#0d1512;color:#e6f0ea;font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0}div{text-align:center;padding:2rem}h1{font-size:1.4rem}p{opacity:.7;font-size:.9rem}a{color:#34d399}</style></head><body><div><h1>You are offline</h1><p>The site needs a connection to load this page. Reconnect and refresh.</p><a href="/">Try again</a></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            )
        )
      )
    )
  }
})
