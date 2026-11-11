/* =============================================================
   COUPLE — two niches, facing each other.

   Each of them stands in an arched niche, the shape the mantapa
   behind them is built from, with their details set alongside
   rather than underneath. The two halves are mirrored, so they
   read as facing across the word that joins them.

   Nothing appears at once. The portrait leans in first, then the
   heading, the name, and the parents, in that order, and the
   bride's half only begins after Weds has landed.

   THE THREAD. Once both of them are in, a gold thread is drawn
   from one portrait to the other, through the word that joins
   them. After that, a light leaves each portrait and travels the
   thread toward the other; the two meet at Weds, and the word
   catches the light. It goes on doing that, slowly, for as long
   as the section is on screen.

   Each portrait carries a point of light that circles it, and
   gives under a finger like the photographs do. As the section
   passes, the two halves draw together toward the middle of the
   screen and part again after it.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  RH.components.coupleIntro = function (mount) {
    var g = RH.config.groom;
    var b = RH.config.bride;

    function person(who, cls) {
      /* Each niche leans in from the side its half sits on, so the
         two of them arrive facing one another. */
      var lean = cls === 'is-bride' ? '1' : '-1';
      return '' +
        '<div class="couple__person ' + cls + '">' +
          '<div class="couple__niche" data-rv="drift" style="--rv-x:' + lean + '">' +
            '<span class="couple__orbit" aria-hidden="true"></span>' +
            '<img src="' + RH.esc(who.photo) + '" alt="" loading="lazy" decoding="async">' +
            '<span class="glare glare--round" aria-hidden="true"></span>' +
          '</div>' +
          '<div class="couple__text">' +
            '<p class="couple__role"    data-rv="soft"></p>' +
            '<p class="couple__name"    data-rv="ink"></p>' +
            '<p class="couple__qual"    data-rv="soft"></p>' +
            '<p class="couple__parents" data-rv="soft"></p>' +
          '</div>' +
        '</div>';
    }

    var view = RH.el(
      '<section class="plate" id="couple">' +
        RH.plateArt(24) +
        '<div class="plate__inner">' +
          /* The thread lies under everything else in the section,
             strung between the two portraits. */
          '<svg class="couple__thread" aria-hidden="true" focusable="false">' +
            /* two strands, each from a portrait toward the word, with
               a bead where each stops short of it */
            '<path class="couple__line couple__line--a" pathLength="1"/>' +
            '<path class="couple__line couple__line--b" pathLength="1"/>' +
            '<circle class="couple__bead couple__bead--a" r="2.2"/>' +
            '<circle class="couple__bead couple__bead--b" r="2.2"/>' +
          '</svg>' +
          '<span class="couple__spark couple__spark--a" aria-hidden="true"></span>' +
          '<span class="couple__spark couple__spark--b" aria-hidden="true"></span>' +
          /* where the two lights meet: its own element, so the light
             it gives off is never clipped by the word's reveal */
          '<span class="couple__knot" aria-hidden="true"></span>' +
          /* the stage: a bloom of light at the centre, and the title
             that is set under whoever is standing in it */
          '<span class="couple__halo" aria-hidden="true"></span>' +
          '<div class="couple__marquee" aria-hidden="true">' +
            '<p class="couple__marquee-role"></p>' +
            '<p class="couple__marquee-name"></p>' +
          '</div>' +
          '<p class="t-kicker" data-caps data-rv="soft" data-i18n="couple.kicker"></p>' +
          RH.ornament(true) +
          person(g, 'is-groom') +
          '<p class="couple__weds" data-rv="ink" data-i18n="couple.weds"></p>' +
          person(b, 'is-bride') +
        '</div>' +
      '</section>'
    );
    mount.appendChild(view);

    var groomBox = view.querySelector('.is-groom');
    var brideBox = view.querySelector('.is-bride');

    function fill(box, who, roleKey) {
      box.querySelector('.couple__role').textContent    = RH.t(roleKey);
      box.querySelector('.couple__name').textContent    = RH.L(who.name);
      box.querySelector('.couple__qual').textContent    = RH.L(who.qualification);
      box.querySelector('.couple__parents').textContent = RH.L(who.parents);
      box.querySelector('.couple__niche img').alt       = RH.L(who.name);
    }

    function paint() {
      fill(groomBox, g, 'couple.groom');
      fill(brideBox, b, 'couple.bride');
    }

    RH.onLang(paint);
    RH.applyI18n(view);
    paint();

    var inner  = view.querySelector('.plate__inner');
    var niches = [].slice.call(view.querySelectorAll('.couple__niche'));
    var weds   = view.querySelector('.couple__weds');

    niches.forEach(function (n) { RH.motion.tilt(n, { max: 10 }); });
    RH.motion.depth(view, [view.querySelector('.plate__art'), groomBox, brideBox]);

    /* -------------------------------------------------------------
       THE THREAD — measured, never guessed

       It is one S from the groom's portrait down to the bride's:
       leaving the first straight downward, arriving at the second
       from above, passing through the middle of the section where
       Weds is. But it is never DRAWN across either portrait or the
       word. It is cut in three places, each found by walking the
       curve:

         · where it leaves the groom's frame (and the light circling
           it), and where it reaches the bride's — so nothing starts
           on a face;
         · where it meets an oval round the word Weds, measured from
           the word itself — so the word sits in a clean gap.

       What is left is two strands, each running from a portrait to
       the word, with a bead where it stops. Each light rides its
       own strand from the portrait's edge to the bead, and the two
       arrive at the word together.
       ------------------------------------------------------------- */
    var svg    = view.querySelector('.couple__thread');
    var lineA  = view.querySelector('.couple__line--a');
    var lineB  = view.querySelector('.couple__line--b');
    var beadA  = view.querySelector('.couple__bead--a');
    var beadB  = view.querySelector('.couple__bead--b');
    var sparkA = view.querySelector('.couple__spark--a');
    var sparkB = view.querySelector('.couple__spark--b');
    var knot   = view.querySelector('.couple__knot');
    var canRide = window.CSS && CSS.supports && CSS.supports('offset-path', 'path("M0 0L1 1")');

    function centre(el) {
      /* offsetTop chains rather than rects: the niches carry a
         reveal transform before they arrive. */
      var x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
      while (n && n !== inner) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x: x, y: y };
    }

    function lerp(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
    function f(p) { return p.x.toFixed(1) + ' ' + p.y.toFixed(1); }

    /* a point on the cubic, and the piece of it between two t */
    function at(P, t) {
      var a = lerp(P[0], P[1], t), b = lerp(P[1], P[2], t), c = lerp(P[2], P[3], t);
      return lerp(lerp(a, b, t), lerp(b, c, t), t);
    }
    function split(P, t) {
      var a = lerp(P[0], P[1], t), b = lerp(P[1], P[2], t), c = lerp(P[2], P[3], t);
      var d = lerp(a, b, t), e = lerp(b, c, t), m = lerp(d, e, t);
      return [[P[0], a, d, m], [m, e, c, P[3]]];
    }
    function piece(P, t0, t1) {
      var left = split(P, t1)[0];
      return t1 > 0 ? split(left, t0 / t1)[1] : left;
    }
    function d(Q) { return 'M' + f(Q[0]) + 'C' + f(Q[1]) + ' ' + f(Q[2]) + ' ' + f(Q[3]); }
    function rev(Q) { return [Q[3], Q[2], Q[1], Q[0]]; }

    /* The first t, walking from `from` toward `to`, at which `test`
       comes true — found coarsely, then narrowed by halving. */
    function walk(P, from, to, test) {
      var N = 240, prev = from;
      for (var i = 1; i <= N; i++) {
        var t = from + (to - from) * i / N;
        if (test(at(P, t))) {
          var lo = prev, hi = t;
          for (var k = 0; k < 18; k++) {
            var mid = (lo + hi) / 2;
            if (test(at(P, mid))) hi = mid; else lo = mid;
          }
          return hi;
        }
        prev = t;
      }
      return to;
    }

    function lay() {
      var w = inner.offsetWidth, h = inner.offsetHeight;
      if (!w || !h) return;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);

      var p0 = centre(niches[0]);
      var p3 = centre(niches[1]);
      var reach = (p3.y - p0.y) * 0.62;
      var P = [p0, { x: p0.x, y: p0.y + reach }, { x: p3.x, y: p3.y - reach }, p3];

      /* clear of each portrait, its mount and the light that circles
         it (that ring sits 9px outside the niche) */
      var r0 = niches[0].offsetWidth / 2 + 13;
      var r3 = niches[1].offsetWidth / 2 + 13;

      /* the word: its centre, and an oval round the letters actually
         set — a little wider than the ink, so the strands stop with
         air either side of it */
      var wc = centre(weds);
      var tw = 90, th = 34;
      var tn = weds.firstChild;
      if (tn && tn.nodeType === 3) {
        var range = document.createRange();
        range.selectNodeContents(tn);
        var rr = range.getBoundingClientRect();
        if (rr.width) { tw = rr.width; th = Math.min(rr.height, 44); }
      }
      var rx = tw / 2 + 14, ry = th / 2 + 4;
      function inWord(p) {
        var dx = (p.x - wc.x) / rx, dy = (p.y - wc.y) / ry;
        return dx * dx + dy * dy <= 1;
      }

      var tStart = walk(P, 0, 1, function (p) { return Math.hypot(p.x - p0.x, p.y - p0.y) >= r0; });
      var tEnd   = walk(P, 1, 0, function (p) { return Math.hypot(p.x - p3.x, p.y - p3.y) >= r3; });
      var tA     = walk(P, tStart, tEnd, inWord);
      var tB     = walk(P, tEnd, tStart, inWord);
      if (!(tA < tB)) { tA = tB = (tStart + tEnd) / 2; }

      var A = piece(P, tStart, tA);           /* groom → word */
      var B = rev(piece(P, tB, tEnd));        /* bride → word */
      lineA.setAttribute('d', d(A));
      lineB.setAttribute('d', d(B));
      beadA.setAttribute('cx', A[3].x.toFixed(1)); beadA.setAttribute('cy', A[3].y.toFixed(1));
      beadB.setAttribute('cx', B[3].x.toFixed(1)); beadB.setAttribute('cy', B[3].y.toFixed(1));

      knot.style.left = wc.x.toFixed(1) + 'px';
      knot.style.top = wc.y.toFixed(1) + 'px';

      if (!canRide) return;
      sparkA.style.offsetPath = 'path("' + d(A) + '")';
      sparkB.style.offsetPath = 'path("' + d(B) + '")';
    }

    lay();
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(lay);
      ro.observe(inner);
      /* kept on the element, so nothing lets it be collected */
      inner._rhThread = ro;
    } else {
      window.addEventListener('resize', lay, { passive: true });
    }
    RH.onLang(function () { setTimeout(lay, 60); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lay);

    /* -------------------------------------------------------------
       THE ENTRANCE — one at a time, centre stage

       The artwork behind never changes; only the two of them move.
       The groom's portrait comes up large in the middle of the
       screen, pushing slowly in, and his name is titled under it.
       Then the portrait travels back to its own place, the title
       follows it to where the name is set, and his details are
       written in. Weds lands. The bride does the same, while what
       is already on the page stands back for her. Only then is the
       thread drawn between them.

       Reduced motion, or no observer to start it: none of this —
       the reveal engine has already shown everything, in place.
       ------------------------------------------------------------- */
    var cine = !RH.calm && 'IntersectionObserver' in window;
    if (!cine) {
      view.classList.add('is-bound');
      return;
    }

    /* the reveal engine leaves this section to us */
    inner.setAttribute('data-rv-manual', '');
    view.classList.add('is-cine');

    var halo    = view.querySelector('.couple__halo');
    var marquee = view.querySelector('.couple__marquee');
    var mRole   = view.querySelector('.couple__marquee-role');
    var mName   = view.querySelector('.couple__marquee-name');

    function after(ms, fn) { setTimeout(fn, ms); }
    function show(el, delay) { after(delay || 0, function () { el.classList.add('in'); }); }

    /* where the letters of a line actually sit, not its box: the
       groom's name is set left and the bride's right */
    function inkCentre(el, rightAligned) {
      var c = centre(el);
      var w = el.offsetWidth;
      var range = document.createRange();
      range.selectNodeContents(el);
      var tw = Math.min(range.getBoundingClientRect().width || w, w);
      c.x += rightAligned ? (w - tw) / 2 : (tw - w) / 2;
      return c;
    }

    function star(box, who, roleKey, done) {
      var niche  = box.querySelector('.couple__niche');
      var nameEl = box.querySelector('.couple__name');
      var isBride = box === brideBox;

      /* the stage is the middle of the screen as it is right now,
         lifted a little to leave room for the title under it */
      var w = inner.offsetWidth, h = inner.offsetHeight;
      var size = Math.min(210, w * 0.52);
      var cs = size / niche.offsetWidth;
      var c0 = centre(niche);
      var cx = w / 2;
      var cy = window.innerHeight / 2 - inner.getBoundingClientRect().top - 50;
      /* never up into the heading, never off the foot of the section */
      var orn = inner.querySelector('.orn');
      var roof = orn ? orn.offsetTop + orn.offsetHeight + 34 : 96;
      cy = Math.max(roof + size / 2, Math.min(h - size / 2 - 130, cy));

      niche.style.setProperty('--cx', (cx - c0.x).toFixed(1) + 'px');
      niche.style.setProperty('--cy', (cy - c0.y).toFixed(1) + 'px');
      niche.style.setProperty('--cs', cs.toFixed(3));

      halo.style.left = cx.toFixed(1) + 'px';
      halo.style.top  = cy.toFixed(1) + 'px';

      mRole.textContent = RH.t(roleKey);
      mName.textContent = RH.L(who.name);
      marquee.classList.remove('is-on', 'is-off');
      marquee.style.top = (cy + size / 2 + 30).toFixed(1) + 'px';

      void niche.offsetWidth;            /* start from the stage, not from home */
      view.classList.add('is-starring');
      box.classList.add('is-starring');
      niche.classList.add('is-star', 'in');

      after(520, function () { marquee.classList.add('is-on'); });

      /* ---- and back to their place ---- */
      after(3100, function () {
        /* the title travels to where the name is set, shrinking to
           the size it is set at */
        var mc = centre(mName);
        var nc = inkCentre(nameEl, isBride);
        var ms = parseFloat(getComputedStyle(nameEl).fontSize) /
                 parseFloat(getComputedStyle(mName).fontSize);
        marquee.style.transformOrigin =
          '50% ' + (mName.offsetTop + mName.offsetHeight / 2).toFixed(1) + 'px';
        marquee.style.setProperty('--mx', (nc.x - mc.x).toFixed(1) + 'px');
        marquee.style.setProperty('--my', (nc.y - mc.y).toFixed(1) + 'px');
        marquee.style.setProperty('--ms', ms.toFixed(3));
        marquee.classList.add('is-off');

        niche.classList.remove('is-star');
        niche.classList.add('is-home');
        view.classList.remove('is-starring');

        var lines = box.querySelectorAll('.couple__text [data-rv]');
        for (var i = 0; i < lines.length; i++) show(lines[i], 620 + i * 150);

        after(1450, function () {
          box.classList.remove('is-starring');
          marquee.classList.remove('is-on');
          done();
        });
      });
    }

    function play() {
      /* the self-scrolling showcase waits at this section until both
         of them have been introduced */
      var cap = RH.scrollCap = Math.round(view.getBoundingClientRect().top + window.scrollY);

      var head = inner.querySelectorAll('.t-kicker, .orn');
      for (var i = 0; i < head.length; i++) show(head[i], i * 180);

      after(650, function () {
        star(groomBox, g, 'couple.groom', function () {
          show(weds, 250);
          after(1300, function () {
            star(brideBox, b, 'couple.bride', function () {
              lay();
              after(500, function () { view.classList.add('is-bound'); });
              /* only our own hold: a later section may have set one since */
              after(2600, function () { if (RH.scrollCap === cap) RH.scrollCap = null; });
            });
          });
        });
      });
    }

    var gate = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        gate.disconnect();
        play();
        return;
      }
    /* Late enough that the stage and the title under it are both on
       screen wherever the guest stops; scaled down for a section
       taller than the screen, which could never show that much. */
    }, { threshold: Math.min(0.78, 0.78 * window.innerHeight / Math.max(1, view.offsetHeight)) });
    gate.observe(view);
  };
})();
