/* =============================================================
   GALLERY — the prints.   (the second gallery; the first is the
   mantapa ring in gallery.js, kept whole and still selectable)

   WHICH ONE SHOWS is one word in data/wedding.config.js:

       galleryStyle: "prints"     this file
       galleryStyle: "ring"       the turning ring of arches

   To compare them without editing anything, add ?gallery=ring or
   ?gallery=prints to the address.

   WHAT THIS ONE IS. A pile of printed photographs on the page, the
   way a photographer hands them over: cream paper, a hairline of
   gold, a line written under each in a pen. They are DEALT onto
   the page one after another when the section is reached, landing
   a little askew on top of each other.

   HANDLING IT
     · take the top print with a finger and throw it — it leaves
       the way it was thrown, comes back in underneath the pile,
       and the next one is on top;
     · tap the top print to open it full-screen; tap one peeking
       out from under it to bring that one up;
     · the arrows, the reel of marks above the pile and the arrow
       keys do the same; the left arrow brings the last one back;
     · left alone in view, the top print throws itself every few
       seconds (three), to one side and then the other, and the reel above
       fills as it waits. Any touch stops that for a moment.

   THE PHOTOGRAPHS ARE CUT-OUTS ON WHITE, as in the ring: each is
   multiplied onto its paper, so the white becomes the print and
   there is no photograph edge anywhere. Contained, never cropped.

   Everything — which photographs, their order, their captions —
   comes from `gallery` in data/wedding.config.js, exactly as the
   ring reads it.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  function pad(v) { return v < 10 ? '0' + v : String(v); }
  function mod(a, n) { return ((a % n) + n) % n; }

  var CHEVRON = function (dir) {
    return '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
             '<path d="' + (dir < 0 ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5') + '" fill="none" ' +
                   'stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
           '</svg>';
  };

  /* How each print lies in the pile: a lean and a nudge of its own,
     so the pile is untidy the same way every time. */
  var JIT = [
    { r: -3.1, x: -1.0 }, { r: 2.6, x: 1.0 }, { r: -1.9, x: -0.6 }, { r: 3.4, x: 0.8 },
    { r: -2.7, x: -0.9 }, { r: 1.7, x: 0.5 }, { r: -3.6, x: -1.0 }, { r: 2.2, x: 0.7 }
  ];

  function prints(mount) {
    var items = RH.config.gallery || [];
    var n = items.length;
    if (!n) return;

    var cardsHtml = items.map(function (it, i) {
      var wh = (it.w && it.h) ? ' width="' + it.w + '" height="' + it.h + '"' : '';
      return '' +
        '<div class="print is-away" data-i="' + i + '">' +
          '<div class="print__photo">' +
            '<span class="print__floor" aria-hidden="true"></span>' +
            '<img src="' + RH.esc(it.src) + '" alt="" decoding="async" draggable="false"' + wh + '>' +
          '</div>' +
          '<p class="print__cap" aria-hidden="true"></p>' +
          '<span class="print__sheen" aria-hidden="true"></span>' +
        '</div>';
    }).join('');

    var segsHtml = items.map(function (it, i) {
      return '<button class="prints__seg" type="button" data-i="' + i + '"></button>';
    }).join('');

    var view = RH.el(
      '<section class="sheet sheet--gallery sheet--prints" id="gallery" data-seq="150">' +
        '<p class="t-kicker" data-caps data-rv="soft" data-i18n="gallery.kicker"></p>' +
        '<h2 class="t-title" data-caps data-rv="ink" data-i18n="gallery.title"></h2>' +
        RH.ornament(true) +

        '<div class="prints__reel">' + segsHtml + '</div>' +

        '<div class="prints" tabindex="0" role="region" aria-roledescription="carousel">' +
          '<span class="prints__light" aria-hidden="true"></span>' +
          cardsHtml +
        '</div>' +

        '<div class="mantapa__bar prints__bar">' +
          '<button class="mantapa__nav" type="button" data-dir="-1">' + CHEVRON(-1) + '</button>' +
          '<div class="mantapa__cap" aria-hidden="true"><span class="mantapa__no"></span></div>' +
          '<button class="mantapa__nav" type="button" data-dir="1">' + CHEVRON(1) + '</button>' +
        '</div>' +
        '<p class="mantapa__hint" data-i18n="gallery.hintPrints"></p>' +
        '<p class="u-sr" aria-live="polite"></p>' +
      '</section>'
    );
    mount.appendChild(view);

    var stage = view.querySelector('.prints');
    var cards = [].slice.call(view.querySelectorAll('.print'));
    var segs  = [].slice.call(view.querySelectorAll('.prints__seg'));
    var navs  = [].slice.call(view.querySelectorAll('.mantapa__nav'));
    var capNo = view.querySelector('.mantapa__no');
    var live  = view.querySelector('[aria-live]');
    var calm  = RH.calm;

    function caption(i) { return RH.L(items[i].caption) || ''; }

    function paint() {
      stage.setAttribute('aria-label', RH.t('gallery.title'));
      navs[0].setAttribute('aria-label', RH.t('gallery.prev'));
      navs[1].setAttribute('aria-label', RH.t('gallery.next'));
      cards.forEach(function (el, i) {
        el.querySelector('img').alt = RH.t('gallery.photo') + ' ' + (i + 1) + ' — ' + caption(i);
        el.querySelector('.print__cap').textContent = caption(i);
        segs[i].setAttribute('aria-label', RH.t('gallery.photo') + ' ' + (i + 1));
      });
      announce();
    }

    /* -------------------------------------------------------------
       THE PILE — who is on top, and where everyone else lies
       ------------------------------------------------------------- */
    var top = 0;                 /* the print on top of the pile          */
    var W = 230;                 /* a print's width, from the room it has */
    var flying = {};             /* prints in the air: the pile leaves them be */

    function size() {
      var room = stage.clientWidth || 340;
      W = Math.round(Math.max(190, Math.min(270, room * 0.64)));
      stage.style.setProperty('--w', W + 'px');
    }

    function depth(i) { return mod(i - top, n); }

    function slot(i) {
      var d = depth(i), j = JIT[i % JIT.length], k = W / 230;
      if (d === 0) return { x: 0, y: 0, r: j.r * 0.4, s: 1, dim: 0 };
      if (d === 1) return { x: j.x * 20 * k, y: 9, r: j.r * 1.9, s: 0.965, dim: 0.06 };
      return { x: j.x * 30 * k, y: 17, r: j.r * 2.8, s: 0.93, dim: 0.12 };
    }

    function place(i) {
      var el = cards[i], p = slot(i), d = depth(i);
      el.style.setProperty('--x', p.x.toFixed(1) + 'px');
      el.style.setProperty('--y', p.y.toFixed(1) + 'px');
      el.style.setProperty('--r', p.r.toFixed(2) + 'deg');
      el.style.setProperty('--s', p.s);
      el.style.setProperty('--dim', p.dim);
      el.style.zIndex = String(n - d);
      el.classList.toggle('is-top', d === 0);
    }

    function lay() {
      for (var i = 0; i < n; i++) if (!flying[i]) place(i);
      for (var k = 0; k < n; k++) {
        segs[k].classList.toggle('is-on', k === top);
        segs[k].setAttribute('aria-current', k === top ? 'true' : 'false');
        if (k !== top) segs[k].style.setProperty('--p', k < top ? 1 : 0);
      }
      capNo.textContent = pad(top + 1) + ' / ' + pad(n);
      announce();
    }

    function announce() {
      var text = caption(top);
      live.textContent = RH.t('gallery.photo') + ' ' + (top + 1) + ' ' + RH.t('gallery.of') + ' ' + n +
                         (text ? ' — ' + text : '');
    }

    /* where a print goes when it is thrown: clear of the screen on
       the side it left by, still turning */
    function off(dir, lift) {
      var reach = (stage.clientWidth || 340) / 2 + W * 0.9;
      return 'translate3d(' + (dir * reach).toFixed(0) + 'px,' + (lift || -30) + 'px,0) rotate(' + (dir * 26) + 'deg)';
    }

    /* The top print leaves; the pile moves up at once; the print
       comes back in underneath when it has gone. */
    var FLY = 440;
    function throwTop(dir, lift) {
      var i = top, el = cards[i];
      if (flying[i]) return;
      top = mod(top + 1, n);
      elapsed = 0;

      if (calm) { lay(); return; }

      flying[i] = true;
      el.classList.remove('is-held', 'is-top');
      el.classList.add('is-flying');
      el.style.transform = off(dir, lift);
      lay();

      setTimeout(function () {
        delete flying[i];
        el.classList.remove('is-flying');
        place(i);                 /* now the bottom of the pile */
        el.style.transform = '';  /* and it slides in under it  */
      }, FLY);
    }

    /* The last print thrown comes back onto the top, from the left. */
    function bringBack() {
      var i = mod(top - 1, n), el = cards[i];
      if (flying[i]) return;
      elapsed = 0;
      if (calm) { top = i; lay(); return; }
      el.classList.add('is-held');
      el.style.transform = off(-1, -20);
      el.style.zIndex = String(n + 1);
      void el.offsetWidth;
      top = i;
      lay();
      el.classList.remove('is-held');
      el.style.transform = '';
    }

    function goTo(i) {
      if (i === top) return;
      elapsed = 0;
      top = i;
      lay();
    }

    function open(i) {
      if (!RH.viewer) return;
      RH.viewer.open(items[i].src, {
        from: cards[i].querySelector('.print__photo'),
        alt: RH.t('gallery.photo') + ' ' + (i + 1) + ' — ' + caption(i),
        caption: caption(i)
      });
    }

    /* -------------------------------------------------------------
       ON ITS OWN — the reel fills, then the top print goes
       ------------------------------------------------------------- */
    var AUTO   = 3000;           /* how long each print is left on top   */
    var RESUME = 2600;           /* the quiet after a touch              */
    var elapsed = 0, lastT = 0, raf = 0;
    var lastTouch = -1e9, autoDir = 1;
    var onScreen = false, arrived = false, arriving = false, dragging = false;

    function touch() { lastTouch = performance.now(); elapsed = 0; }
    function viewing() { return document.documentElement.classList.contains('is-viewing'); }

    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    function tick(now) {
      raf = 0;
      var dt = lastT ? Math.min(now - lastT, 60) : 16;
      lastT = now;
      var playing = !calm && arrived && !arriving && onScreen && !dragging &&
                    !viewing() && now - lastTouch > RESUME;
      if (playing) {
        elapsed += dt;
        if (elapsed >= AUTO) {
          autoDir = -autoDir;
          throwTop(autoDir, -46);
        }
      }
      segs[top].style.setProperty('--p', (elapsed / AUTO).toFixed(3));
      if (onScreen) kick(); else lastT = 0;
    }

    /* -------------------------------------------------------------
       THE FINGER
       ------------------------------------------------------------- */
    var pid = null, startX = 0, startY = 0, dx = 0, dy = 0, moved = 0, downAt = 0;
    var held = null, hitIdx = -1, samples = [];

    stage.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      var hit = e.target.closest ? e.target.closest('.print') : null;
      hitIdx = hit ? +hit.getAttribute('data-i') : -1;
      pid = e.pointerId;
      startX = e.clientX; startY = e.clientY;
      dx = dy = moved = 0;
      downAt = performance.now();
      samples = [[downAt, 0]];
      dragging = true;
      held = (hitIdx === top && !flying[top]) ? cards[top] : null;
      if (held) held.classList.add('is-held');
      try { stage.setPointerCapture(pid); } catch (err) { /* older engines */ }
      touch();
    });

    stage.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;
      moved = Math.max(moved, Math.abs(dx), Math.abs(dy));
      if (!held) return;
      /* it follows the finger and leans the way it is being taken,
         as a print held by its lower edge would */
      held.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + (dy * 0.35).toFixed(1) + 'px,0) ' +
                             'rotate(' + (dx * 0.07).toFixed(2) + 'deg) scale(1.03)';
      var t = performance.now();
      samples.push([t, dx]);
      while (samples.length > 2 && t - samples[0][0] > 90) samples.shift();
    });

    function release(e, cancelled) {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false;
      try { stage.releasePointerCapture(pid); } catch (err) { /* never captured */ }
      touch();

      var el = held;
      held = null;
      var still = moved < 7;

      if (el) {
        var first = samples[0], last = samples[samples.length - 1];
        var v = (last[0] - first[0]) > 0 ? (last[1] - first[1]) / (last[0] - first[0]) : 0;
        var thrown = !cancelled && (Math.abs(dx) > W * 0.3 || Math.abs(v) > 0.45);
        if (thrown) {
          throwTop((Math.abs(v) > 0.45 ? v : dx) < 0 ? -1 : 1, dy * 0.35 - 20);
          return;
        }
        /* not far enough: it is put back where it was */
        el.classList.remove('is-held');
        el.style.transform = '';
      }

      if (!still || cancelled) return;
      if (performance.now() - downAt > 380) return;     /* a hold opens nothing */
      if (hitIdx === top) open(top);
      else if (hitIdx >= 0) goTo(hitIdx);
    }
    stage.addEventListener('pointerup', function (e) { release(e, false); });
    stage.addEventListener('pointercancel', function (e) { release(e, true); });

    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); touch(); throwTop(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); touch(); bringBack(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(top); }
    });

    navs.forEach(function (b) {
      b.addEventListener('click', function () {
        touch();
        if (+b.getAttribute('data-dir') > 0) throwTop(1); else bringBack();
      });
    });
    segs.forEach(function (b) {
      b.addEventListener('click', function () { touch(); goTo(+b.getAttribute('data-i')); });
    });

    /* -------------------------------------------------------------
       ARRIVAL — dealt onto the page, the bottom of the pile first
       ------------------------------------------------------------- */
    function arrive() {
      if (arrived) return;
      arrived = true;
      if (calm) {
        cards.forEach(function (el) { el.classList.remove('is-away'); });
        stage.classList.add('is-dealt');
        return;
      }
      arriving = true;
      var GAP = 150;
      cards.forEach(function (el, i) {
        var order = n - 1 - depth(i);          /* 0 lands first */
        /* each comes in from its own side, from below, turning */
        var side = (order % 2) ? 1 : -1;
        el.style.setProperty('--ax', (side * ((stage.clientWidth || 340) * 0.7)).toFixed(0) + 'px');
        el.style.setProperty('--ar', (side * 34) + 'deg');
        setTimeout(function () { el.classList.remove('is-away'); }, 80 + order * GAP);
      });
      setTimeout(function () {
        arriving = false;
        stage.classList.add('is-dealt');
        lastTouch = performance.now() - RESUME;   /* and the reel starts */
        elapsed = 0;
        kick();
      }, 80 + n * GAP + 700);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        for (var k = 0; k < entries.length; k++) {
          onScreen = entries[k].isIntersecting;
          if (onScreen) arrive();
        }
        if (!onScreen) elapsed = 0;
        kick();
      }, { threshold: 0.4 }).observe(stage);
    } else {
      onScreen = true;
      arrive();
    }

    /* ---- start ---- */
    size();
    lay();
    window.addEventListener('resize', function () { size(); lay(); }, { passive: true });
    RH.onLang(paint);
    RH.applyI18n(view);
    paint();
  }

  /* -------------------------------------------------------------
     WHICH GALLERY — the config's word, or the address's
     ------------------------------------------------------------- */
  var ring = RH.components.gallery;      /* gallery.js, loaded before this */

  RH.components.gallery = function (mount) {
    var style = RH.config.galleryStyle || 'prints';
    var asked = /[?&]gallery=(ring|prints)\b/.exec(window.location.search);
    if (asked) style = asked[1];
    if (style === 'ring' && typeof ring === 'function') return ring(mount);
    return prints(mount);
  };
})();
