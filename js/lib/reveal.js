/* =============================================================
   RagaHru — REVEAL ENGINE

   Five reusable reveal types, chosen per element with data-rv:

     soft    opacity + blur + rise            (body copy, details)
     ink     a soft feathered mask soaks
             upward, blur to sharp            (headings, names)
     mask    clip-path wipe                   (images, previews)
     line    an ornamental rule draws out     (dividers)
     scale   settles from slightly oversize   (portraits, photos)

   Sequencing: put data-seq="120" on a parent and its data-rv
   descendants fire in DOM order, 120ms apart, when the parent is
   reached. One observer for the whole page.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;
  var seen = new WeakSet();
  var io = null;

  function fire(el, delay) {
    var own = parseInt(el.getAttribute('data-rv-delay'), 10) || 0;
    el.style.setProperty('--rv-d', (delay + own) + 'ms');
    el.classList.add('in');
  }

  /* A sequenced group resolves as one staged run rather than as
     whatever happens to cross the fold first. */
  function fireGroup(host) {
    var step = parseInt(host.getAttribute('data-seq'), 10) || 130;
    var kids = host.querySelectorAll('[data-rv]');
    for (var i = 0; i < kids.length; i++) {
      fire(kids[i], i * step);
      seen.add(kids[i]);
    }
    host.classList.add('seq-in');
  }

  function build() {
    if (!('IntersectionObserver' in window)) return null;
    return new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        var el = entries[i].target;
        io.unobserve(el);
        if (el.hasAttribute('data-seq')) fireGroup(el);
        else fire(el, 0);
      }
    }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
  }

  RH.reveal = {
    /* words(): re-paints a line as separate words so it can arrive
       one word at a time. Split on spaces only — Kannada conjuncts
       must never be broken apart, so a word is the smallest safe
       unit in both scripts. The element keeps its own data-rv, so
       the observer and reduced motion still treat it as one node.
       Safe to call again on every language change. */
    words: function (el, text, step) {
      if (!el) return;
      el.textContent = '';
      if (RH.calm) { el.textContent = text; return; }

      var parts = String(text).split(/\s+/).filter(Boolean);
      var gap = step || 90;
      for (var i = 0; i < parts.length; i++) {
        var w = document.createElement('span');
        w.className = 'w';
        w.style.setProperty('--w-d', (i * gap) + 'ms');
        w.textContent = parts[i];
        el.appendChild(w);
        if (i < parts.length - 1) el.appendChild(document.createTextNode(' '));
      }
    },

    /* Safe to call repeatedly; watched nodes are skipped. */
    scan: function (root) {
      root = root || document;

      var groups = root.querySelectorAll('[data-seq]');
      var singles = [];
      root.querySelectorAll('[data-rv]').forEach(function (el) {
        if (!el.closest('[data-seq]')) singles.push(el);
      });

      if (!io) io = build();

      if (!io || RH.calm) {
        root.querySelectorAll('[data-rv]').forEach(function (el) { el.classList.add('in'); });
        groups.forEach(function (g) { g.classList.add('seq-in'); });
        return;
      }

      groups.forEach(function (g) {
        if (seen.has(g)) return;
        seen.add(g);
        io.observe(g);
      });

      singles.forEach(function (el) {
        if (el.closest('.hero')) return; /* Hero is animated specifically when doors open */
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    },

    /* Run a sequence by hand — used by the hero once the doors open. */
    play: function (host, step) {
      if (!host) return;
      var kids = host.querySelectorAll('[data-rv]');
      var interval = step || 220;
      for (var i = 0; i < kids.length; i++) {
        kids[i].classList.remove('in');
        kids[i].style.removeProperty('--rv-d');
        seen.add(kids[i]);
      }
      if (kids[0]) void kids[0].offsetWidth;

      for (var j = 0; j < kids.length; j++) {
        (function (el, delay) {
          setTimeout(function () {
            fire(el, 0);
          }, delay);
        })(kids[j], j * interval);
      }
    }
  };

  /* -------- parallax --------
     One rAF loop, capped at 14px. Off entirely for reduced motion.
     Deliberately restrained: the page should breathe, not float. */
  (function () {
    if (RH.calm) return;

    var items = [];
    var ticking = false;

    function collect() {
      items = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    }

    function frame() {
      ticking = false;
      var mid = window.innerHeight / 2;
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > window.innerHeight + 100) continue;
        var f = parseFloat(el.getAttribute('data-parallax')) || 0.045;
        var o = ((r.top + r.height / 2) - mid) * f;
        if (o > 14) o = 14;
        if (o < -14) o = -14;
        el.style.setProperty('--px', o.toFixed(2) + 'px');
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { collect(); onScroll(); }, { passive: true });

    RH.parallaxRefresh = function () { collect(); onScroll(); };
    collect();
  })();
})();
