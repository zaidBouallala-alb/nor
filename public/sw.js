const CACHE_NAME = 'noor-cache-v2'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/logo.svg']

/* ── Install: pre-cache app shell ─────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined),
  )
  self.skipWaiting()
})

/* ── Activate: clean old caches ───────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      ),
  )
  self.clients.claim()
})

/* ── Fetch strategies ─────────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  /* 1. Navigation requests → network-first, fallback to cached index.html
        This is the KEY fix for page reload on phone — any route like
        /quran, /prayer-times etc. will always get index.html back so
        React Router can handle the route client-side. */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest index.html
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone))
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  /* 2. Vite hashed assets (JS/CSS in /assets/) → cache-first
        These filenames contain content hashes, so they're immutable.
        Once cached they never need to be re-fetched. */
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      }),
    )
    return
  }

  /* 3. Same-origin static files (logo, manifest, etc.) → stale-while-revalidate */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            }
            return response
          })
          .catch(() => cached)

        return cached || networkFetch
      }),
    )
    return
  }

  /* 4. External API requests → network-first with short cache */
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request)),
  )
})

/* ── Notification click: open app ─────────────────────────── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow('/prayer-times')
    }),
  )
})

