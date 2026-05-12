/* Vallarta Voz service worker
 * Scope: app-shell caching only.
 * - Pre-caches static shell assets and serves them cache-first when offline.
 * - SPA navigation falls back to the cached `/` document when offline.
 * - Does NOT proxy /api/* calls. Offline intelligence for API surfaces lives
 *   in the React layer (Practice Bar -> lookupInPack from the saved Trip Pack
 *   stored in IndexedDB). Live API endpoints stay network-only.
 * Version-bumped caches let new deploys invalidate stale shell cache while
 * preserving user data (IndexedDB packs + trails are untouched).
 */
const CACHE_VERSION = "v2";
const SHELL_CACHE = `vv-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `vv-runtime-${CACHE_VERSION}`;
const FONT_CACHE = `vv-fonts-${CACHE_VERSION}`;

const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL_URLS).catch(() => {})
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => ![SHELL_CACHE, RUNTIME_CACHE, FONT_CACHE].includes(k)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isShellRequest(url) {
  return (
    url.pathname === "/" ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/src/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(js|css|woff2?|png|svg|ico|jpg|jpeg)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Cross-origin font assets (Google Fonts CSS + woff2) — cache so the app
  // renders correctly offline. Stale-while-revalidate.
  if (url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com") {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const network = fetch(req).then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // App shell: cache-first, network refresh in the background
  if (isShellRequest(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(req, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // SPA navigation fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/").then((c) => c || new Response("Offline", { status: 503 })))
    );
    return;
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
