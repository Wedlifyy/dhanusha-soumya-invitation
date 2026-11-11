/* =============================================================
   RagaHru — APP
   Mounts each component into its slot, in reading order.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  function slot(name) {
    return document.querySelector('[data-c="' + name + '"]');
  }

  function mount(name, target) {
    var host = target || slot(name);
    var fn = RH.components[name];
    if (!host || typeof fn !== 'function') return;
    try {
      fn(host);
    } catch (err) {
      /* One broken section must never take the invitation down. */
      if (window.console) console.error('[RagaHru] ' + name + ' failed to mount', err);
    }
  }

  function boot() {
    /* The tab, the share sheet and the link-preview tags, all from
       `social` in wedding.config.js. See js/lib/meta.js. */
    if (RH.meta) RH.meta.apply();
    else document.title = RH.t('doc.title');

    /* Controls first: music must exist before the splash can
       start it from the opening touch. */
    mount('musicButton');
    mount('languageSwitch');
    mount('splash');
    mount('languageSwitch', document.querySelector('.gate__lang'));

    mount('hero');
    mount('coupleIntro');
    mount('dateReveal');
    mount('countdown', document.querySelector('.count-slot'));
    mount('events');
    mount('gallery');
    mount('location');
    mount('rsvp');
    mount('blessing');
    mount('footer');

    RH.applyI18n(document);
    RH.reveal.scan(document);
    if (RH.parallaxRefresh) RH.parallaxRefresh();

    /* Every section built on the temple artwork dollies through it
       as it passes. A section that has already asked for depth of
       its own (the couple, the venue) is skipped by the engine. */
    document.querySelectorAll('.plate').forEach(function (plate) {
      RH.motion.depth(plate, [plate.querySelector('.plate__art')]);
    });
    RH.motion.ambient();

    /* The controls stay out of the way until the doors are open. */
    document.addEventListener('rh:opened', function () {
      document.querySelectorAll('.hdr, .dock').forEach(function (el) {
        el.classList.add('is-live');
      });
    }, { once: true });

    /* Language changes can alter line counts; re-measure drift. */
    RH.onLang(function () {
      if (RH.parallaxRefresh) RH.parallaxRefresh();
    });

    initAutoScroll();
    initDock();
  }

  /* -------------------------------------------------------------
     THE DOCK — full on the hero, folded away further down.

     The language switch is fixed in the bottom corner, where below
     the hero it sat across whatever was being read: the calendar
     links, the edge of the map. So once the hero is behind, it
     folds to a small pill.

     Folded, the pill names the language the page is NOT in — the
     one a tap will change it to. A page in English shows "ಕನ್ನಡ";
     tap it and the page is in Kannada and the pill says "English".
     One word, one tap, no doubt about what it does. (With three or
     more languages it offers the next one round.)
     ------------------------------------------------------------- */
  function initDock() {
    var dock = document.querySelector('.dock');
    if (!dock || !dock.querySelector('.lang')) return;

    function offer() {
      var next = RH.langs[(RH.langs.indexOf(RH.lang()) + 1) % RH.langs.length];
      dock.querySelectorAll('.lang__btn').forEach(function (b) {
        b.classList.toggle('is-next', b.getAttribute('data-lang') === next);
      });
    }

    function fold() {
      dock.classList.toggle('is-compact', window.scrollY > window.innerHeight * 0.5);
    }

    window.addEventListener('scroll', fold, { passive: true });
    RH.onLang(offer);
    offer();
    fold();
  }

  /* -------------------------------------------------------------
     AUTO-SCROLL — a single showcase, offered once.

     If a guest does nothing for the first six seconds after the
     doors open, the invitation walks itself down the page and back
     to the top. That happens at most once per visit: the moment
     they touch anything — then, during it, or afterwards — the
     showcase is retired for good. Nobody who is already reading
     should have the page taken out of their hands, and nobody
     should have it happen twice.
     ------------------------------------------------------------- */
  function initAutoScroll() {
    if (RH.calm) return;

    var IDLE_TIME = 6000;        /* 6s no action */
    var PAUSE_AT_BOTTOM = 2000;  /* 2s pause at end */
    var EVENTS = ['touchstart', 'touchmove', 'wheel', 'mousedown', 'keydown', 'pointerdown'];

    var idleTimer = null;
    var pauseTimer = null;
    var rafId = null;
    var isAutoScrolling = false;
    var isReturning = false;
    var lastTimestamp = 0;
    var isLive = false;
    var spent = false;          /* the one showcase has been used up */

    function stopAutoScroll() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (pauseTimer) {
        clearTimeout(pauseTimer);
        pauseTimer = null;
      }
      isAutoScrolling = false;
      isReturning = false;
    }

    /* Stops whatever is running and makes sure nothing is offered
       again for the rest of the visit. */
    function retire() {
      spent = true;
      stopAutoScroll();
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
      EVENTS.forEach(function (ev) {
        window.removeEventListener(ev, retire, { passive: true });
      });
    }

    function startAutoScroll() {
      if (!isLive || spent) return;
      stopAutoScroll();
      isAutoScrolling = true;
      isReturning = false;
      lastTimestamp = performance.now();
      rafId = requestAnimationFrame(stepDown);
    }

    function stepDown(now) {
      if (!isAutoScrolling || isReturning) return;
      var delta = Math.min(now - (lastTimestamp || now), 50);
      lastTimestamp = now;

      var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (maxScroll <= 10) {
        retire();
        return;
      }

      var nextY = window.scrollY + (0.07 * delta);

      /* A section playing something that must be watched through
         (the couple's entrance) sets RH.scrollCap to its own top: the
         showcase walks down to it, waits there, and carries on when
         the cap is lifted. */
      if (RH.scrollCap != null && nextY >= RH.scrollCap) {
        if (window.scrollY < RH.scrollCap) window.scrollTo(0, RH.scrollCap);
        rafId = requestAnimationFrame(stepDown);
        return;
      }

      if (nextY >= maxScroll - 4) {
        window.scrollTo(0, maxScroll);
        isAutoScrolling = false;
        pauseTimer = setTimeout(function () {
          if (!isLive || spent) return;
          startReturnToTop();
        }, PAUSE_AT_BOTTOM);
        return;
      }

      window.scrollTo(0, nextY);
      rafId = requestAnimationFrame(stepDown);
    }

    function startReturnToTop() {
      stopAutoScroll();
      isAutoScrolling = true;
      isReturning = true;
      lastTimestamp = performance.now();
      rafId = requestAnimationFrame(stepUp);
    }

    function stepUp(now) {
      if (!isAutoScrolling || !isReturning) return;
      var delta = Math.min(now - (lastTimestamp || now), 50);
      lastTimestamp = now;

      var nextY = window.scrollY - (0.18 * delta);
      if (nextY <= 3) {
        window.scrollTo(0, 0);
        /* Back where it started, and that was the one turn it gets. */
        retire();
        return;
      }

      window.scrollTo(0, nextY);
      rafId = requestAnimationFrame(stepUp);
    }

    /* Listening starts only once the doors are open. The tap that
       opened them is a pointer event of its own, and it must not be
       mistaken for a guest declining the showcase. */
    document.addEventListener('rh:opened', function () {
      isLive = true;
      EVENTS.forEach(function (ev) {
        window.addEventListener(ev, retire, { passive: true });
      });
      idleTimer = setTimeout(startAutoScroll, IDLE_TIME);
    }, { once: true });
  }

  /* Register Service Worker for instantaneous offline caching */
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        if (window.console) console.log('[RagaHru] Service Worker active:', reg.scope);
      }).catch(function (err) {
        if (window.console) console.warn('[RagaHru] Service Worker registration skipped:', err);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
