// E-Trading · trabajador de avisos: muestra los avisos que llegan y, al tocarlos, abre la pantalla que toca.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('push', e => {
  let d = {}
  try {
    d = e.data ? e.data.json() : {}
  } catch {
    d = { title: 'E-Trading', body: e.data ? e.data.text() : '' }
  }
  // Solo enlaces de la propia app
  const url = typeof d.url === 'string' && d.url.startsWith('/') ? d.url : '/'
  e.waitUntil(
    self.registration.showNotification(String(d.title || 'E-Trading').slice(0, 120), {
      body: String(d.body || '').slice(0, 300),
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: typeof d.tag === 'string' ? d.tag : 'lumi',
      renotify: true,
      data: { url },
    }),
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.startsWith(self.location.origin) && 'focus' in c) {
          c.navigate(url)
          return c.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})
