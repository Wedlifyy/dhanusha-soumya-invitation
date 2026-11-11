/* =============================================================
   HERO — the couple walk toward each other under the mandap.

   The video IS the hero. Nothing else is layered over it: no
   still photograph, no cut-out, no second couple image. Type
   sits only in the empty cream arch above the figures, which is
   where the supplied footage leaves room for it.

   THE NAME REVEAL — "the seam of light".

   The names are not faded in. A point of gold appears at the exact
   centre of the plate and draws itself outward into a hairline
   seam; the two names are then UNVEILED from that seam, each one
   opening from its own centre outward while it sharpens out of a
   blur. "Weds" blooms last, into the gap the seam left for
   it. (With the names written in gold dust — below — the same
   beats are kept, later, in data-dust-delay.)

   Everything opens from the same centre line, so the lockup is
   symmetrical at every instant of the animation, and each name is
   its own stacked block — they cannot clash however long a name
   runs or whichever script it is set in.

   THE BEATS ARE HELD HERE, not in the stylesheet. Each line
   carries the millisecond it waits for in `data-rv-delay`, so the
   whole sequence can be read straight down the markup below:

     seam 40 -> groom 280 -> bride 460 -> Weds 900 (+860 in CSS)
             -> invitation 1080 / 1180 -> date 1340 -> venue 1440

   The reveal engine is asked for the smallest step it takes, so it
   releases every line at once and each one waits out its own beat
   rather than a uniform one.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  /* The smallest step the reveal engine accepts. A step of zero
     reads as "unset" and falls back to its own default, so the
     sequence is timed by each line's data-rv-delay instead and the
     step is kept out of the way. */
  var BEAT = 1;

  RH.components.hero = function (mount) {
    var media = RH.config.media;
    var w = RH.config.wedding;

    var view = RH.el(
      '<section class="hero" id="top">' +
        '<img class="hero__still" src="' + RH.esc(media.heroPoster) + '" alt="" ' +
             'aria-hidden="true" decoding="async">' +
        '<video class="hero__media" playsinline muted preload="metadata" aria-hidden="true">' +
          '<source src="' + RH.esc(media.heroVideo) + '" type="video/mp4">' +
        '</video>' +
        '<div class="hero__wash" aria-hidden="true"></div>' +

        '<div class="hero__inner">' +
          /* The gold dust the names are made from (see below). */
          '<canvas class="hero__dust" aria-hidden="true"></canvas>' +
          /* The plate carries a data-rv of its own so the engine
             releases it with everything else, on arrival and again
             on a language switch. */
          '<h1 class="hero__names t-name" data-rv="plate" data-rv-delay="0">' +
            /* Reading order is the printed order: a name, the word
               that joins them, a name. That is what a screen reader
               says and what the eye follows. The order the lines
               ARRIVE in is set by their beats below, not by their
               place in the markup — the seam is written second and
               arrives first.

               Each name sits in its own .hero__line, and that line
               is what OPENS: the name itself never moves relative to
               the plate, so the two can never collide however long
               either of them runs. */
            /* data-dust-delay is the beat each line holds for when the
               names are made from gold dust: the type itself only
               arrives once the dust has formed it. */
            '<span class="hero__line" data-rv="unveil" data-rv-delay="280" data-dust-delay="1900">' +
              '<span class="hero__nm hero__groom" data-caps></span>' +
            '</span>' +
            /* The joining word sits on a broken gold rule. That rule
               is the hero\'s ornament, and now also the seam the names
               are unveiled from — there is no second one under
               them. */
            '<span class="hero__weds" data-rv="weds" data-rv-delay="40" data-dust-delay="1150">' +
              '<i class="hero__weds-rule" aria-hidden="true"></i>' +
              /* the ink is a span of its own, so the pen that writes
                 it can travel over it without being masked with it */
              '<span class="hero__weds-word">' +
                '<span class="hero__weds-ink" data-i18n="couple.weds"></span>' +
              '</span>' +
              '<i class="hero__weds-rule" aria-hidden="true"></i>' +
            '</span>' +
            '<span class="hero__line" data-rv="unveil" data-rv-delay="460" data-dust-delay="2050">' +
              '<span class="hero__nm hero__bride" data-caps></span>' +
            '</span>' +
          '</h1>' +
          '<p class="hero__invite" data-rv="rise" data-rv-delay="1080" data-dust-delay="2450" ' +
             'data-i18n="hero.invite1"></p>' +
          '<p class="hero__invite" data-rv="rise" data-rv-delay="1180" data-dust-delay="2650" ' +
             'data-i18n="hero.invite2"></p>' +
          '<p class="hero__meta">' +
            '<b class="hero__date" data-rv="rise" data-rv-delay="1340" data-dust-delay="2950"></b>' +
            '<span class="hero__venue" data-rv="rise" data-rv-delay="1440" data-dust-delay="3150"></span>' +
          '</p>' +
        '</div>' +

        '<div class="hero__gesture" aria-hidden="true">' +
          '<div class="hero__gesture-icon">' +
            '<svg class="hero__hand-svg" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<path class="hero__hand-arrow" d="M16 8L16 2M12 5L16 1.5L20 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
              '<path class="hero__hand-body" d="M16 13V21C16 22.1 15.1 23 14 23C12.9 23 12 22.1 12 21V15C12 14.2 11.3 13.5 10.5 13.5C9.7 13.5 9 14.2 9 15V22.5C9 26.6 12.4 30 16.5 30C20.6 30 24 26.6 24 22.5V18C24 17.2 23.3 16.5 22.5 16.5C21.7 16.5 21 17.2 21 18V19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</div>' +
          '<span class="hero__gesture-text" data-caps data-i18n="hero.scroll"></span>' +
        '</div>' +
      '</section>'
    );
    mount.appendChild(view);

    var video = view.querySelector('.hero__media');
    var inner = view.querySelector('.hero__inner');
    var gesture = view.querySelector('.hero__gesture');
    var refs = {
      groom: view.querySelector('.hero__groom'),
      bride: view.querySelector('.hero__bride'),
      date:  view.querySelector('.hero__date'),
      venue: view.querySelector('.hero__venue')
    };

    /* -------------------------------------------------------------
       THE NAMES, FROM GOLD DUST

       When the doors open, the names are not there. A cloud of gold
       dust is: it swirls in toward the middle of the arch and draws
       together into the two names, letter by letter from the left,
       the groom's line a breath before the bride's. As the last of
       it lands the engraved type comes up underneath, and the dust
       lifts off it like breath off glass.

       The shapes are the real ones. Each letter is drawn, at the
       very place and size the page has set it, onto a hidden canvas
       in the same face, and the dust is aimed at the gold that
       canvas holds — so English, Kannada, a long name or a short one
       all form exactly where the type will stand. Latin is placed a
       letter at a time, which carries the tracking; Kannada a word
       at a time, because a conjunct pulled apart is not the same
       letter.

       Reduced motion, or no canvas: the names simply arrive.
       ------------------------------------------------------------- */
    var dustCv = view.querySelector('.hero__dust');
    var dctx = dustCv.getContext ? dustCv.getContext('2d') : null;
    var useDust = !RH.calm && !!dctx;
    var dustRaf = 0;

    /* With the names written in dust, the invitation beneath them is
       written a word at a time — so the dictionary key moves to a
       data attribute of its own, where applyI18n will not flatten
       the words back into one line. */
    var invites = [].slice.call(view.querySelectorAll('.hero__invite'));

    if (useDust) {
      view.classList.add('is-dust');
      view.querySelectorAll('[data-dust-delay]').forEach(function (el) {
        el.setAttribute('data-rv-delay', el.getAttribute('data-dust-delay'));
      });
      invites.forEach(function (el) {
        el.setAttribute('data-words', el.getAttribute('data-i18n'));
        el.removeAttribute('data-i18n');
        el.setAttribute('data-rv', 'words');
      });
    }

    function shapes() {
      var box = inner.getBoundingClientRect();
      var W = Math.ceil(box.width), H = Math.ceil(box.height);
      if (!W || !H) return null;
      var off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      var o = off.getContext('2d');
      o.fillStyle = '#000';
      o.textBaseline = 'alphabetic';

      [refs.groom, refs.bride].forEach(function (el, line) {
        var node = el.firstChild;
        if (!node || node.nodeType !== 3) return;
        var cs = getComputedStyle(el);
        o.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        if ('letterSpacing' in o) o.letterSpacing = '0px';
        var asc = o.measureText('H').fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.8;
        var text = node.textContent;
        var upper = cs.textTransform === 'uppercase';
        var latin = !/[^\u0000-ɏ]/.test(text);
        var units = [], m, re = /\S+/g;
        if (latin) {
          for (var i = 0; i < text.length; i++) if (!/\s/.test(text[i])) units.push([i, i + 1]);
        } else {
          while ((m = re.exec(text))) units.push([m.index, m.index + m[0].length]);
        }
        var range = document.createRange();
        units.forEach(function (u) {
          range.setStart(node, u[0]);
          range.setEnd(node, u[1]);
          var r = range.getBoundingClientRect();
          if (!r.width) return;
          var s = text.slice(u[0], u[1]);
          o.fillText(upper ? s.toUpperCase() : s, r.left - box.left, r.top - box.top + asc);
        });
      });

      /* Every third pixel of gold becomes a mote — fewer if the names
         are long, so a phone never carries more than a couple of
         thousand. */
      var data = o.getImageData(0, 0, W, H).data;
      var stepPx = 3, pts;
      for (;;) {
        pts = [];
        for (var y = 0; y < H; y += stepPx) {
          for (var x = 0; x < W; x += stepPx) {
            if (data[(y * W + x) * 4 + 3] > 120) pts.push(x, y);
          }
        }
        if (pts.length / 2 <= 2200 || stepPx >= 6) break;
        stepPx++;
      }
      return pts.length ? { W: W, H: H, pts: pts } : null;
    }

    function ease(k) { return 1 - Math.pow(1 - k, 3); }

    function formDust() {
      if (!useDust) return;
      if (dustRaf) { cancelAnimationFrame(dustRaf); dustRaf = 0; }
      var s = shapes();
      if (!s) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      dustCv.width = Math.round(s.W * dpr);
      dustCv.height = Math.round(s.H * dpr);
      dustCv.style.width = s.W + 'px';
      dustCv.style.height = s.H + 'px';

      var pts = s.pts, count = pts.length / 2;
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (var i = 0; i < pts.length; i += 2) {
        if (pts[i] < minX) minX = pts[i];
        if (pts[i] > maxX) maxX = pts[i];
        if (pts[i + 1] < minY) minY = pts[i + 1];
        if (pts[i + 1] > maxY) maxY = pts[i + 1];
      }
      var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      var spanX = Math.max(1, maxX - minX), midY = cy;
      var reach = Math.max(spanX, maxY - minY) * 0.75;

      var ps = new Array(count);
      for (var k = 0; k < count; k++) {
        /* a hair of scatter off the sampling grid, so the letters
           gather as dust and never read as a dot-matrix sign */
        var tx = pts[k * 2] + (Math.random() - 0.5) * 1.8;
        var ty = pts[k * 2 + 1] + (Math.random() - 0.5) * 1.8;
        /* each mote starts somewhere in a wide cloud round the names
           and is carried in along a curve, so the whole of it swirls
           rather than flying straight */
        var a = Math.random() * Math.PI * 2;
        var d = reach * (0.55 + Math.random() * 0.75);
        var sx = cx + Math.cos(a) * d;
        var sy = cy + Math.sin(a) * d * 0.62;
        var len = Math.hypot(tx - sx, ty - sy) || 1;
        ps[k] = {
          tx: tx, ty: ty, sx: sx, sy: sy,
          /* perpendicular to the flight, all one way: the swirl */
          nx: -(ty - sy) / len, ny: (tx - sx) / len,
          bend: len * (0.18 + Math.random() * 0.22),
          /* written from the left, the second name after the first */
          delay: 120 + ((tx - minX) / spanX) * 640 + (ty > midY ? 200 : 0) + Math.random() * 260,
          dur: 900 + Math.random() * 520,
          tw: Math.random() * Math.PI * 2
        };
      }

      var t0 = 0;
      var LIFT = 2150;       /* when the type has come up under it */
      var GONE = 2900;

      function frame(now) {
        if (!t0) t0 = now;
        var t = now - t0;
        dctx.setTransform(1, 0, 0, 1, 0, 0);
        dctx.clearRect(0, 0, dustCv.width, dustCv.height);
        dctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var fade = t < LIFT ? 1 : Math.max(0, 1 - (t - LIFT) / (GONE - LIFT));
        var lift = t < LIFT ? 0 : (t - LIFT) * 0.012;
        var last = '';

        for (var j = 0; j < count; j++) {
          var p = ps[j];
          var q = (t - p.delay) / p.dur;
          var x, y, col, alpha, size;
          if (q <= 0) {
            /* waiting in the cloud: a faint, drifting twinkle */
            var wob = Math.sin(t * 0.004 + p.tw);
            x = p.sx + wob * 3;
            y = p.sy + Math.cos(t * 0.003 + p.tw) * 3;
            alpha = Math.min(1, t / 400) * (0.28 + 0.2 * wob);
            col = '#E2B062';
            size = 1.5;
          } else if (q < 1) {
            var e = ease(q);
            var arc = Math.sin(Math.PI * e) * p.bend;
            x = p.sx + (p.tx - p.sx) * e + p.nx * arc;
            y = p.sy + (p.ty - p.sy) * e + p.ny * arc;
            alpha = 0.55 + 0.45 * e;
            col = e < 0.85 ? '#E9B85E' : '#B9822F';
            size = 1.9 - e * 0.4;
          } else {
            x = p.tx;
            y = p.ty - lift * (0.6 + (j % 5) * 0.12);
            alpha = 1;
            col = '#8E5A18';
            size = 1.6;
          }
          alpha *= fade;
          if (alpha <= 0.01) continue;
          if (col !== last) { dctx.fillStyle = col; last = col; }
          dctx.globalAlpha = alpha;
          dctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
        dctx.globalAlpha = 1;

        if (t < GONE) dustRaf = requestAnimationFrame(frame);
        else {
          dustRaf = 0;
          dctx.setTransform(1, 0, 0, 1, 0, 0);
          dctx.clearRect(0, 0, dustCv.width, dustCv.height);
        }
      }
      dustRaf = requestAnimationFrame(frame);
    }

    /* The exact face the names are set in has to be loaded before
       its shapes are read, or the dust forms the fallback font. A
       font that has not come within a moment is not waited for: the
       names then simply arrive without it. */
    function whenFontReady(fn) {
      if (!useDust) return;
      if (!document.fonts || !document.fonts.load) { fn(); return; }
      var cs = getComputedStyle(refs.groom);
      var spec = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var done = false;
      var go = function () { if (!done) { done = true; fn(); } };
      var giveUp = setTimeout(function () { done = true; }, 900);
      document.fonts.load(spec, refs.groom.textContent + refs.bride.textContent)
        .then(function () { clearTimeout(giveUp); go(); })
        .catch(function () { clearTimeout(giveUp); go(); });
    }

    function updateText() {
      refs.groom.textContent = RH.L(RH.config.groom.name);
      refs.bride.textContent = RH.L(RH.config.bride.name);
      /* "Weds" itself comes from the dictionary through applyI18n,
         so the hero and the couple chapter always say the same word. */
      refs.date.textContent  = RH.L(w.dateLabel);
      refs.venue.textContent = RH.L(w.venue);
      RH.applyI18n(view);
      invites.forEach(function (el) {
        var key = el.getAttribute('data-words');
        if (key) RH.reveal.words(el, RH.t(key), 75);
      });
    }

    function paint(isLangSwitch) {
      if (isLangSwitch && inner) {
        inner.classList.add('is-transitioning');
        setTimeout(function () {
          updateText();
          /* Every line is put away at once, not faded: the old names
             must be gone before the dust forms the new ones, or the
             two are seen together. */
          view.classList.add('is-reset');
          RH.reveal.play(view, BEAT);
          void view.offsetWidth;
          view.classList.remove('is-reset');
          inner.classList.remove('is-transitioning');
          /* the new names form out of the dust again */
          whenFontReady(formDust);
        }, 160);
      } else {
        updateText();
      }
    }

    RH.onLang(function () { paint(true); });
    paint(false);

    /* The walk plays once and settles on the two of them together.
       Looping would cut them apart again mid-scene. */
    video.loop = !!media.heroLoop;

    /* Scrolled away, the camera pushes in on the couple while the
       names lift off ahead of the page. */
    RH.motion.depth(view, [view]);

    /* The scroll message: it comes up four seconds after the doors
       open — once the names have formed — and keeps moving until the
       page is scrolled, by the guest or by the showcase. Scrolled
       before then, it is never shown at all. */
    var GESTURE_AFTER = 4000;
    var gestureTimer = 0;
    function dismissGesture() {
      clearTimeout(gestureTimer);
      if (gesture) gesture.classList.add('is-dismissed');
      window.removeEventListener('scroll', dismissGesture);
    }

    document.addEventListener('rh:opened', function () {
      if (!RH.calm) {
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* the first frame carries it */ });
      }
      /* Staged text reveal: the hero is already in view when the
         doors open. Every line is released now and holds for its
         own beat — and the names form out of gold dust first. */
      RH.reveal.play(view, BEAT);
      whenFontReady(formDust);

      if (gesture) {
        gestureTimer = setTimeout(function () { gesture.classList.add('is-active'); }, GESTURE_AFTER);
        window.addEventListener('scroll', dismissGesture, { passive: true });
      }
    }, { once: true });
  };
})();
