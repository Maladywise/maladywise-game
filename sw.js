/* Malady Wise service worker: network first, cache as offline fallback. Never serves stale content when online.
   Bump VERSION whenever this file's caching rules change: activate deletes every cache that isn't in KEEP. */
var VERSION = "v2";
var PAGES = "mw-pages-" + VERSION; // pages, scripts, styles, fonts
var MEDIA = "mw-media-" + VERSION; // images and JSON (puzzle files etc.), trimmed to the newest MEDIA_MAX
var MEDIA_MAX = 150, PAGES_MAX = 200;
var KEEP = [PAGES, MEDIA];
self.addEventListener("install", function (e) { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return KEEP.indexOf(k) < 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Oldest entries first (cache keys come back in insertion order; re-caching a URL moves it to the end).
function trim(name, max) {
  return caches.open(name).then(function (c) {
    return c.keys().then(function (ks) { return ks.length > max ? Promise.all(ks.slice(0, ks.length - max).map(function (k) { return c.delete(k); })) : null; });
  });
}
function isMedia(u) { return /\.(png|jpe?g|gif|webp|avif|svg|ico|json|mp3|mp4|webm)$/i.test(u.pathname); }
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  var name = isMedia(u) ? MEDIA : PAGES;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok && res.type === "basic") {
      var copy = res.clone();
      e.waitUntil(caches.open(name).then(function (c) { return c.delete(r).then(function () { return c.put(r, copy); }); })
        .then(function () { return trim(name, name === MEDIA ? MEDIA_MAX : PAGES_MAX); }).catch(function () {}));
    }
    return res;
  }).catch(function () {
    return caches.match(r).then(function (m) {
      if (m) return m;
      if (r.mode !== "navigate") return Response.error();
      return caches.match("/").then(function (h) { return h || Response.error(); });
    });
  }));
});
