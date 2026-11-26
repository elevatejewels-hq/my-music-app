/* My Music App service worker — caches the app shell so the UI opens offline.
   Music itself always streams live from the Internet Archive / Audius. */
const CACHE = "mma-shell-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./logo-header.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // App shell: cache-first. Everything else (APIs, streams, artwork): network.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request))
    );
  }
});
