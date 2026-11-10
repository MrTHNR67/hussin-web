self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data?.text() || '' }; }
  const options = {
    body: payload.body || 'راجع حالة الألواح والطقس في سياج.',
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    tag: payload.tag || `siyaj-${payload.kind || 'alert'}`,
    data: { url: payload.url || '/' },
    renotify: false,
  };
  event.waitUntil(self.registration.showNotification(payload.title || 'تنبيه من سياج', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = clients.find((client) => new URL(client.url).origin === self.location.origin);
    if (existing) {
      await existing.focus();
      if ('navigate' in existing) await existing.navigate(target);
      return;
    }
    await self.clients.openWindow(target);
  })());
});
