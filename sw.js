/* =============================================================
   RagaHru — Service Worker (PWA Offline & Instant Asset Caching)
   ============================================================= */

/* Bump this whenever any file in PRECACHE_ASSETS changes: the fetch
   handler is cache-first, so a stale name serves the previous build. */
const CACHE_NAME = 'ragahru-wedding-v61';

const PRECACHE_ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/tokens.css',
  'css/base.css',
  'css/components.css',
  'css/languages.css',
  'data/wedding.config.js',
  'data/content.i18n.js',
  /* RH:LANGS:START */
  /* RH:LANGS:END */
  'js/lib/state.js',
  'js/lib/meta.js',
  'js/lib/reveal.js',
  'js/lib/motion.js',
  'js/lib/viewer.js',
  'js/lib/calendar.js',
  'js/components/splash.js',
  'js/components/music-button.js',
  'js/components/language-switch.js',
  'js/components/hero.js',
  'js/components/couple-intro.js',
  'js/components/date-reveal.js',
  'js/components/countdown.js',
  'js/components/events.js',
  'js/components/gallery.js',
  'js/components/gallery-prints.js',
  'js/components/location.js',
  'js/components/rsvp.js',
  'js/components/blessing.js',
  'js/components/footer.js',
  'js/app.js',
  /* Media & Background Art */
  'assets/splash/splash-door-opening.mp4',
  'assets/splash/splash-poster.jpg',
  'assets/hero/hero-poster.jpg',
  'assets/sections/date/indian-temple-background.jpeg',
  'assets/brand/ragahru-logo.webp',
  'assets/couple/groom-portrait.jpeg',
  'assets/couple/bride-portrait.jpeg',
  'assets/sections/events/mehendi-medallion.jpg',
  'assets/sections/events/reception-medallion.jpg',
  'assets/sections/events/muhurta-medallion.jpg',
  'assets/sections/events/lagna-medallion.jpg',
  'assets/sections/gallery/g1-closeup.jpg',
  'assets/sections/gallery/g2-embrace.jpg',
  'assets/sections/gallery/g3-standing.jpg',
  'assets/sections/gallery/g4-seated.jpg',
  'assets/sections/gallery/g5-looking-back.jpg',
  'assets/sections/gallery/g6-seated-close.jpg',
  'assets/sections/gallery/g7-tender.jpg',
  'assets/music/wedding-music.mp3'
];

/* Install: precache essential static assets and activate immediately */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url =>
          fetch(url, { cache: 'no-cache' }).then(response => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch(err => {
            console.warn('[SW] Precache skipped for:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* Activate: clean up outdated caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

/* Fetch: Cache-first for media, images, styles, scripts & fonts; Network-first for navigation */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Ignore cross-origin non-CDN requests (like Maps embeds)
  const isHttp = url.protocol.startsWith('http');
  if (!isHttp) return;

  // The RSVP backend's links carry the couple's PIN: never cache them.
  if (url.hostname === 'script.google.com' || url.hostname === 'script.googleusercontent.com') return;

  // The wedding's own words and settings (data/*.js): the latest copy whenever there is a
  // connection, the saved copy only offline — so an edit made to the config reaches every
  // phone on its next visit, with no need to bump the cache name.
  if (url.origin === self.location.origin && /\/data\/(?:lang\/)?[^/]+\.js$/.test(url.pathname)) {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Navigation / HTML requests: Stale-While-Revalidate with offline fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(networkRes => {
          if (networkRes && networkRes.ok) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then(cached => cached || caches.match('index.html'));
        })
    );
    return;
  }

  // Static Assets (Images, Audio, Video, JS, CSS, Google Fonts): Cache-first with dynamic caching
  event.respondWith(
    caches.match(req).then(cachedResponse => {
      if (cachedResponse) {
        // Fetch in background to update cache for non-media files
        if (!req.url.endsWith('.mp4') && !req.url.endsWith('.mp3')) {
          fetch(req).then(networkRes => {
            if (networkRes && networkRes.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes));
            }
          }).catch(() => {});
        }
        return cachedResponse;
      }

      return fetch(req).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, responseToCache));
        return networkResponse;
      }).catch(error => {
        return cachedResponse;
      });
    })
  );
});
