/* =============================================================
   DATE REVEAL — a heart to scratch.

   The date is under gold foil, in a heart. Before it is touched
   the foil catches the light and the heart glows at its edge, so
   it reads as something to be rubbed rather than something to be
   looked at. A finger dragged across it takes the foil off in
   strokes, and under it is a deep kumkum red set with sparks —
   with the day printed across it in bold.

   Once about half the foil is gone the rest lets go on its own,
   the hour lands beneath, and a handful of jasmine and rose opens
   out of the heart before it falls.

   A plain tap still works, and so does Enter or Space: not
   everyone will drag, and not everyone has a pointer at all.

   The scratching is done on a canvas with `destination-out`, so
   the strokes are one composited layer over the answer rather
   than anything being drawn, measured or laid out per frame.

   What is rubbed off comes away as gold leaf, falling from under
   the finger; what is left when the heart lets go crumbles from
   where it actually was, the outline beats outward and the heart
   beats once before the hour lands.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  /* ---- the celebration ----
     Jasmine, rose and ivory petals — the flowers actually strewn
     at a Karnataka wedding. Three shapes, no stars, no discs, no
     confetti. They arrive together, the way a handful thrown into
     the air does, and then come apart from one another on the way
     down: no two the same size, speed, drift or turn. */

  var PETALS = [
    /* mogra / jasmine — small, white, folded */
    '<svg viewBox="0 0 20 26"><path d="M10 .8C4.6 5.4 1.4 11.6 1.4 16.4c0 5 3.9 8.8 8.6 8.8s8.6-3.8 8.6-8.8c0-4.8-3.2-11-8.6-15.6Z" ' +
      'fill="#FFFDF6" stroke="#EBDCC0" stroke-width=".7"/>' +
      '<path d="M10 4.6c-2 4.6-2.4 10.6-1 17" stroke="#F3E6CC" stroke-width=".7" fill="none" stroke-linecap="round"/></svg>',
    /* rose — soft pink, broader, gently cupped */
    '<svg viewBox="0 0 24 22"><path d="M12 .9C5.4.9.9 5 .9 9.9c0 5.6 5.4 9.4 11.1 11.2 5.7-1.8 11.1-5.6 11.1-11.2C23.1 5 18.6.9 12 .9Z" ' +
      'fill="#F9DEE2" stroke="#EDC2CB" stroke-width=".7"/>' +
      '<path d="M12 4.2c-1.8 4-1.8 9.4 0 14.2" stroke="#F2CCD4" stroke-width=".7" fill="none" stroke-linecap="round"/></svg>',
    /* champagne floret — ivory, the colour of the card itself */
    '<svg viewBox="0 0 22 24"><path d="M11 1.1C6.4 4.6 2.2 9.9 2.2 14.6c0 4.6 3.9 8.3 8.8 8.3s8.8-3.7 8.8-8.3C19.8 9.9 15.6 4.6 11 1.1Z" ' +
      'fill="#FBF1DD" stroke="#E7D3AB" stroke-width=".7"/>' +
      '<path d="M11 5c-1.6 4.4-1.8 9.8-.6 14.6" stroke="#EFDFBE" stroke-width=".7" fill="none" stroke-linecap="round"/></svg>'
  ];

  /* ---- the heart ----
     Outlined, not filled: one continuous line drawn the way a card
     engraver draws it, two lobes into a single point, with a second
     line set inside it. The fill behind is only enough to lift it
     off the card. The path is the same one the music control uses,
     so the two hearts on the invitation are the same heart.        */
  var HEART = 'M20 33.2C20 33.2 5.4 23.3 5.4 14.6C5.4 9.8 9.2 6.4 13.5 6.4' +
              'C16.6 6.4 19 8.5 20 11.2C21 8.5 23.4 6.4 26.5 6.4' +
              'C30.8 6.4 34.6 9.8 34.6 14.6C34.6 23.3 20 33.2 20 33.2Z';

  /* The same heart again, this time normalised to a unit box so it
     can clip an element of any size. One shape, three jobs: it
     clips the foil, it strokes the glowing rim, and it cuts the
     red bed underneath. */
  /* The classic silhouette, and the two places it has to be crisp
     are crisp: the tip is a true point, where two curves meet with
     mirrored tangents, and the cleft is a clean V rather than a
     dimple. Rounding either of them is what made the earlier one
     read as a blob. Everything between the two is a single sweep
     per lobe, so there is no join anywhere along the sides. */
  var HEART_UNIT =
    'M.5 .97C.42 .88 .06 .62 .06 .35C.06 .17 .19 .05 .33 .05' +
    'C.41 .05 .47 .10 .5 .155C.53 .10 .59 .05 .67 .05' +
    'C.81 .05 .94 .17 .94 .35C.94 .62 .58 .88 .5 .97Z';

  /* The same outline in hundredths, for the rim that is stroked
     over the join. One shape, never two that nearly agree. */
  var HEART_100 =
    'M50 97C42 88 6 62 6 35C6 17 19 5 33 5' +
    'C41 5 47 10 50 15.5C53 10 59 5 67 5' +
    'C81 5 94 17 94 35C94 62 58 88 50 97Z';

  /* Sparks set in the red, in fixed places at fixed rhythms: a
     setting that re-arranges itself is not the same object twice. */
  function sparks() {
    var out = '';
    for (var i = 1; i <= 7; i++) {
      out += '<span class="scr__spark scr__spark--' + i + '"></span>';
    }
    return out;
  }

  /* ---- gold leaf ----
     What the finger takes off the heart does not vanish: it comes
     away as flakes of leaf that tumble and fall. Each flake is a
     sliver turning on its own axis, so it flashes bright as it
     faces the light and goes thin as it turns edge-on — that turn
     is what makes it read as metal rather than as dust.

     Drawn on one canvas that hangs over and below the heart, and
     the loop runs only while there is a flake in the air.         */
  var LEAF = ['#F6DCA6', '#E7C489', '#D9A45C', '#C08C3C', '#9C6A22'];
  var LEAF_LIT = '#FFF6DE';
  var LEAF_MAX = 240;

  function goldLeaf(canvas) {
    var ctx = canvas.getContext ? canvas.getContext('2d') : null;
    var flakes = [];
    var raf = 0;
    var last = 0;
    var w = 0, h = 0, dpr = 1;

    function fit() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var cw = canvas.clientWidth, ch = canvas.clientHeight;
      if (cw === w && ch === h && canvas.width) return;
      w = cw; h = ch;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    function step(now) {
      var dt = Math.min(now - (last || now), 40);
      last = now;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (var i = flakes.length - 1; i >= 0; i--) {
        var f = flakes[i];
        f.age += dt;
        if (f.age >= f.life) { flakes.splice(i, 1); continue; }

        /* Leaf is light: it falls, but the air holds it back, and
           it never gathers speed past a gentle drift. */
        f.vy = Math.min(f.vy + 0.00042 * dt, 0.16);
        f.vx *= (1 - 0.0022 * dt);
        f.x += (f.vx + Math.sin(f.age * f.wob) * 0.02) * dt;
        f.y += f.vy * dt;
        f.spin += f.vs * dt;
        f.turn += f.vt * dt;

        var face = Math.cos(f.turn);
        var k = f.age / f.life;
        ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
        ctx.fillStyle = Math.abs(face) > 0.86 ? LEAF_LIT : f.tone;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.spin);
        ctx.scale(1, Math.max(Math.abs(face), 0.12));
        ctx.beginPath();
        ctx.moveTo(-f.s, 0);
        ctx.lineTo(0, -f.s * 0.62);
        ctx.lineTo(f.s, 0);
        ctx.lineTo(0, f.s * 0.62);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      if (flakes.length) {
        raf = requestAnimationFrame(step);
      } else {
        raf = 0;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    return {
      /* x, y in the canvas's own CSS pixels. `push` sends a flake
         outward from (ox, oy) as well as letting it fall. */
      shed: function (x, y, n, opts) {
        if (!ctx || RH.calm) return;
        opts = opts || {};
        fit();
        for (var i = 0; i < n && flakes.length < LEAF_MAX; i++) {
          var dx = 0, dy = 0;
          if (opts.from) {
            var len = Math.hypot(x - opts.from.x, y - opts.from.y) || 1;
            dx = (x - opts.from.x) / len;
            dy = (y - opts.from.y) / len;
          }
          var push = opts.push || 0;
          flakes.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.16 + dx * push * (0.5 + Math.random()),
            vy: -0.03 - Math.random() * 0.1 + dy * push * (0.5 + Math.random()),
            s: (opts.size || 2.2) + Math.random() * 2.4,
            spin: Math.random() * Math.PI,
            vs: (Math.random() - 0.5) * 0.012,
            turn: Math.random() * Math.PI,
            vt: 0.006 + Math.random() * 0.014,
            wob: 0.004 + Math.random() * 0.006,
            tone: LEAF[(Math.random() * LEAF.length) | 0],
            age: 0,
            life: 700 + Math.random() * 800 + (opts.longer || 0)
          });
        }
        if (!raf) { last = 0; raf = requestAnimationFrame(step); }
      }
    };
  }

  var showerTimer = null;

  /* Size observers are kept here rather than in a local variable:
     an observer nothing refers to any more may be collected, and a
     collected one stops reporting. */
  var WATCH = [];

  function celebrate(origin) {
    /* Never two showers at once, and never one left behind. */
    var old = document.querySelector('.petals');
    if (old) old.remove();
    if (showerTimer) clearTimeout(showerTimer);

    var box = document.createElement('div');
    box.className = 'petals';
    box.setAttribute('aria-hidden', 'true');

    if (RH.calm) {
      /* A single quiet bloom instead of motion. */
      box.className = 'petals petals--calm';
      for (var c = 0; c < 5; c++) {
        var quiet = document.createElement('span');
        quiet.className = 'petals__quiet';
        quiet.innerHTML = PETALS[c % PETALS.length];
        quiet.style.left = (16 + c * 17) + '%';
        quiet.style.setProperty('--i', c);
        box.appendChild(quiet);
      }
      document.body.appendChild(box);
      showerTimer = setTimeout(function () { box.remove(); showerTimer = null; }, 2400);
      return;
    }

    /* ---- first, the burst ----
       A handful opens outward from the heart itself before anything
       falls. Each seed carries its own angle, reach and spin, so the
       ring never reads as a ring. */
    var last = 0;

    if (origin) {
      var seeds = window.innerWidth < 420 ? 12 : 16;
      var burst = document.createElement('span');
      burst.className = 'petals__burst';
      burst.style.left = origin.x.toFixed(0) + 'px';
      burst.style.top  = origin.y.toFixed(0) + 'px';

      for (var b = 0; b < seeds; b++) {
        var seed = document.createElement('span');
        seed.className = 'petals__seed';

        var spinner = document.createElement('span');
        spinner.className = 'petals__turn';
        spinner.innerHTML = PETALS[b % PETALS.length];
        seed.appendChild(spinner);

        /* Spread by angle, then jittered, so no two leave together
           and the opening is never a clean wheel. */
        var ang  = (b / seeds) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        var far  = 86 + Math.random() * 132;
        var life = 0.9 + Math.random() * 0.5;
        var off  = Math.random() * 0.14;

        seed.style.width = (11 + Math.random() * 10).toFixed(1) + 'px';
        seed.style.setProperty('--bx', (Math.cos(ang) * far).toFixed(0) + 'px');
        /* Flattened a little, and biased downward: it opens out and
           already begins to give in to its own weight. */
        seed.style.setProperty('--by', (Math.sin(ang) * far * 0.78 + 26).toFixed(0) + 'px');
        seed.style.setProperty('--burst', life.toFixed(2) + 's');
        seed.style.setProperty('--wait', off.toFixed(2) + 's');
        seed.style.setProperty('--turn',
          ((Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 200)).toFixed(0) + 'deg');
        seed.style.setProperty('--lean', (Math.random() * 60 - 30).toFixed(0) + 'deg');

        last = Math.max(last, life + off);
        burst.appendChild(seed);
      }
      box.appendChild(burst);
    }

    /* ---- then the fall ----
       It waits for the burst to open before the first of it clears
       the top of the screen, so the two read as one gesture rather
       than two effects fired at once. */
    var count = window.innerWidth < 420 ? 18 : 24;

    for (var i = 0; i < count; i++) {
      /* Three nested layers. The fall carries it down and across,
         the sway rocks it, the turn tumbles it — one composited
         transform each, so none of them has to be cancelled to let
         another run. Flat markup cannot do all three at once. */
      var fall = document.createElement('span');
      fall.className = 'petals__fall';

      var sway = document.createElement('span');
      sway.className = 'petals__sway';

      var turn = document.createElement('span');
      turn.className = 'petals__turn';
      turn.innerHTML = PETALS[i % PETALS.length];

      sway.appendChild(turn);
      fall.appendChild(sway);

      /* Spread by lane rather than pure chance, so no half of the
         screen is ever left bare or crowded. */
      var lane = (i / count) * 100 + (Math.random() * 7 - 3.5);
      var size = 10 + Math.random() * 14;
      var span = 3.9 + Math.random() * 2.7;
      /* One handful thrown at once, not a drizzle: every petal is
         in the air inside half a second. */
      var wait = 0.34 + Math.random() * 0.46;

      fall.style.left = Math.max(1, Math.min(93, lane)).toFixed(1) + '%';
      fall.style.width = size.toFixed(1) + 'px';
      fall.style.setProperty('--fall', span.toFixed(2) + 's');
      fall.style.setProperty('--wait', wait.toFixed(2) + 's');
      fall.style.setProperty('--drift', ((Math.random() - 0.5) * 130).toFixed(0) + 'px');
      fall.style.setProperty('--sway', (2.2 + Math.random() * 1.6).toFixed(2) + 's');
      fall.style.setProperty('--reach', (9 + Math.random() * 16).toFixed(0) + 'px');
      fall.style.setProperty('--turn', ((Math.random() < 0.5 ? -1 : 1) * (150 + Math.random() * 260)).toFixed(0) + 'deg');
      fall.style.setProperty('--lean', (Math.random() * 60 - 30).toFixed(0) + 'deg');

      last = Math.max(last, span + wait);
      box.appendChild(fall);
    }

    document.body.appendChild(box);

    /* Cleared from the longest life actually dealt, not a guess, so
       the page is back to nothing the moment the last one lands. */
    showerTimer = setTimeout(function () {
      box.remove();
      showerTimer = null;
    }, (last + 0.35) * 1000);
  }

  RH.components.dateReveal = function (mount) {
    var w = RH.config.wedding;

    var view = RH.el(
      '<section class="plate" id="date">' +
        RH.plateArt(30) +
        '<div class="plate__inner" data-seq="150">' +
          '<p class="t-kicker" data-caps data-rv="soft" data-i18n="date.kicker"></p>' +
          RH.ornament(true) +

          '<div class="date__stage" data-rv="soft">' +
            /* The shape is declared once, in a unit box, and used
               to clip the foil and cut the red bed beneath it. */
            '<svg class="scr__defs" aria-hidden="true" focusable="false">' +
              '<defs><clipPath id="rhHeartClip" clipPathUnits="objectBoundingBox">' +
                '<path d="' + HEART_UNIT + '"/>' +
              '</clipPath></defs>' +
            '</svg>' +

            '<div class="scr" role="button" tabindex="0" aria-expanded="false">' +
              '<span class="scr__aura" aria-hidden="true"></span>' +

              '<div class="scr__win">' +
                '<span class="scr__bed" aria-hidden="true"></span>' +
                sparks() +
                '<p class="scr__day"></p>' +
                /* The foil. Everything above it shows through only
                   where it has been rubbed away. */
                '<canvas class="scr__foil" aria-hidden="true"></canvas>' +
                '<span class="scr__gloss" aria-hidden="true"></span>' +
                /* one pass of light over the red once it is bare */
                '<span class="scr__shine" aria-hidden="true"></span>' +
              '</div>' +

              /* The rim is drawn over the join, so the foil and the
                 red beneath it share one glowing edge. It is engraved
                 first, as the section arrives, and gilded after. */
              '<svg class="scr__rim" viewBox="0 0 100 100" preserveAspectRatio="none" ' +
                   'aria-hidden="true" focusable="false">' +
                /* Stroked in the box's own units rather than with a
                   non-scaling stroke: Chromium measures a dash against
                   pathLength in one space and draws it in the other,
                   and the engraving would stop part-way round. */
                '<path class="scr__rim-out" d="' + HEART_100 + '" pathLength="1"/>' +
                /* the gold hairline that used to be an inset shadow
                   on a box: as a stroke of the same outline it can
                   only ever be heart-shaped */
                '<path class="scr__rim-in" d="' + HEART_100 + '" pathLength="1" ' +
                      'transform="translate(50 56) scale(.88) translate(-50 -56)"/>' +
              '</svg>' +

              /* The heart's own outline, sent outward twice when it
                 opens: the beat, made visible. */
              '<svg class="scr__ripples" viewBox="0 0 100 100" preserveAspectRatio="none" ' +
                   'aria-hidden="true" focusable="false">' +
                '<path class="scr__ripple" d="' + HEART_100 + '" vector-effect="non-scaling-stroke"/>' +
                '<path class="scr__ripple scr__ripple--2" d="' + HEART_100 + '" vector-effect="non-scaling-stroke"/>' +
              '</svg>' +

              /* the leaf that comes away under the finger */
              '<canvas class="scr__leaf" aria-hidden="true"></canvas>' +

            '</div>' +

            /* One slot under the heart, held at a fixed height and
               used twice: the invitation to rub before, the hour
               after. Neither can reach the heart, and the section
               never changes height between the two. */
            '<div class="date__foot">' +
              '<span class="scr__word" data-i18n="date.reveal"></span>' +
              '<div class="date__reveal">' +
                '<div class="date__rule" aria-hidden="true"></div>' +
                '<p class="date__time"></p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="count-slot"></div>' +
        '</div>' +
      '</section>'
    );
    mount.appendChild(view);

    var stage = view.querySelector('.date__stage');
    var seal  = view.querySelector('.scr');
    var day   = view.querySelector('.scr__day');
    var time  = view.querySelector('.date__time');
    var foil  = view.querySelector('.scr__foil');
    var win   = view.querySelector('.scr__win');
    var leafCv = view.querySelector('.scr__leaf');
    var leaf  = goldLeaf(leafCv);

    /* A point on the screen, in the leaf canvas's own pixels. */
    function onLeaf(cx, cy) {
      var r = leafCv.getBoundingClientRect();
      var sx = r.width  ? leafCv.clientWidth  / r.width  : 1;
      var sy = r.height ? leafCv.clientHeight / r.height : 1;
      return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
    }

    /* The foil that is still on the heart lets go all at once: it
       is read back from the canvas, and the leaf is shed from where
       the gold actually is — a heart rubbed half bare crumbles only
       where it was still covered. */
    function crumble() {
      if (!ctx || !foil.width || RH.calm) return;
      var data;
      try { data = ctx.getImageData(0, 0, foil.width, foil.height).data; }
      catch (e) { return; }

      var r = win.getBoundingClientRect();
      var mid = onLeaf(r.left + r.width / 2, r.top + r.height * 0.45);
      var want = window.innerWidth < 420 ? 70 : 96;

      for (var tries = 0, got = 0; tries < want * 8 && got < want; tries++) {
        var fx = (Math.random() * foil.width) | 0;
        var fy = (Math.random() * foil.height) | 0;
        if (data[(fy * foil.width + fx) * 4 + 3] < 120) continue;
        var p = onLeaf(r.left + fx / foil.width * r.width,
                       r.top  + fy / foil.height * r.height);
        leaf.shed(p.x, p.y, 1, { from: mid, push: 0.14, size: 2.6, longer: 400 });
        got++;
      }
    }

    function paint() {
      day.textContent  = RH.L(w.dateLabel);
      time.textContent = RH.L(w.timeLabel);
      seal.setAttribute('aria-label', RH.t('date.reveal') + ' — ' + RH.L(w.dateLabel));
    }

    RH.onLang(paint);
    RH.applyI18n(view);
    paint();

    var lifted = false;

    function lift() {
      if (lifted) return;
      lifted = true;

      /* Where the burst opens from: the heart, not the card and not
         the middle of the screen. Read before the card changes
         shape, so it is the point the finger actually touched. */
      var r = win.getBoundingClientRect();
      var origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };

      /* Read the foil before it is faded off, so the leaf comes from
         the gold that was really left on the heart. */
      crumble();

      stage.classList.add('is-open');
      view.classList.add('is-brightening');
      seal.setAttribute('aria-expanded', 'true');
      seal.setAttribute('tabindex', '-1');

      /* The petals answer the touch, not the finished sentence: the
         first of them leaves the heart before the card has opened. */
      setTimeout(function () { celebrate(origin); }, RH.calm ? 0 : 150);

      /* The countdown waits for the whole sequence — seal, date,
         rule, hour — to finish before it appears. */
      setTimeout(function () {
        document.dispatchEvent(new CustomEvent('rh:date-revealed'));
      }, RH.calm ? 0 : 2050);
    }

    /* ---------------------------------------------------------
       THE FOIL

       Painted once at the size it is actually shown at, in device
       pixels, so a stroke is a stroke and not a blur. It is only
       ever repainted if the box changes before anybody has
       scratched it; after that the canvas holds the guest's own
       strokes and must not be touched.
       --------------------------------------------------------- */
    var ctx = foil.getContext ? foil.getContext('2d') : null;
    var dpr = 1;
    var painted = false;

    function layFoil() {
      if (!ctx || lifted || painted && seal.classList.contains('is-rubbed')) return;
      /* The layout size, not the drawn one: the heart is scaled in
         as the section arrives, and a measured rect would size the
         foil to a heart that is still growing. */
      var cw = win.clientWidth, ch = win.clientHeight;
      if (cw < 8 || ch < 8) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      foil.width  = Math.round(cw * dpr);
      foil.height = Math.round(ch * dpr);

      var g = ctx.createLinearGradient(0, 0, foil.width, foil.height);
      g.addColorStop(0,    '#F6DCA6');
      g.addColorStop(0.28, '#D9A45C');
      g.addColorStop(0.52, '#C08C3C');
      g.addColorStop(0.74, '#E7C489');
      g.addColorStop(1,    '#9C6A22');

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, foil.width, foil.height);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, foil.width, foil.height);

      /* A little tooling in the metal, so it reads as beaten foil
         rather than as a flat swatch. */
      ctx.strokeStyle = 'rgba(255, 246, 222, .17)';
      ctx.lineWidth = 1 * dpr;
      for (var i = -foil.height; i < foil.width; i += 9 * dpr) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + foil.height, foil.height);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 26 * dpr;
      /* Opaque: under destination-out it is the SOURCE alpha that
         decides how much of the foil is taken away, and the tooling
         above left this at .17 — which rubbed almost nothing off. */
      ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
      painted = true;
    }

    layFoil();
    /* The section is revealed by the scroll, so the box can still
       be zero-sized at mount. */
    if ('ResizeObserver' in window) {
      WATCH.push(new ResizeObserver(function () { layFoil(); }));
      WATCH[WATCH.length - 1].observe(win);
    } else {
      window.addEventListener('resize', layFoil, { passive: true });
    }

    /* ---- rubbing ---- */
    var drag = null;
    var since = 0;

    /* Mapped through the box as it is drawn right now, so a stroke
       lands under the finger whatever scale the heart is at. */
    function at(e) {
      var r = win.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (r.width  ? foil.width  / r.width  : dpr),
        y: (e.clientY - r.top)  * (r.height ? foil.height / r.height : dpr)
      };
    }

    /* How much of the foil is gone. Sampled coarsely and never per
       move: one read of a fraction of the pixels, a few times a
       second, is enough to know when to let the rest go. */
    function cleared() {
      if (!ctx || !foil.width) return 0;
      var data = ctx.getImageData(0, 0, foil.width, foil.height).data;
      var gone = 0, seen = 0;
      for (var i = 3; i < data.length; i += 4 * 24) {
        seen++;
        if (data[i] < 40) gone++;
      }
      return seen ? gone / seen : 0;
    }

    function rub(e) {
      if (!ctx || !painted || lifted) return;
      var p = at(e);
      ctx.beginPath();
      if (drag && drag.last) {
        ctx.moveTo(drag.last.x, drag.last.y);
        ctx.lineTo(p.x, p.y);
      } else {
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 0.1, p.y);
      }
      ctx.stroke();

      /* Leaf in proportion to the ground covered: a slow rub sheds
         a flake or two, a quick stroke a little shower. */
      var q = onLeaf(e.clientX, e.clientY);
      var moved = drag && drag.lastLeaf
        ? Math.hypot(q.x - drag.lastLeaf.x, q.y - drag.lastLeaf.y)
        : 14;
      if (moved >= 5) {
        leaf.shed(q.x, q.y, Math.min(5, Math.round(moved / 7) + 1));
        if (drag) drag.lastLeaf = q;
      }

      if (drag) drag.last = p;
      seal.classList.add('is-rubbed');

      var now = Date.now();
      if (now - since > 160) {
        since = now;
        if (cleared() > 0.42) lift();
      }
    }

    win.addEventListener('pointerdown', function (e) {
      if (lifted) return;
      if (e.button != null && e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, last: null };
      try { win.setPointerCapture(e.pointerId); } catch (err) { /* older engines */ }
      rub(e);
    });

    win.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id || lifted) return;
      drag.moved += Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y);
      drag.x = e.clientX;
      drag.y = e.clientY;
      rub(e);
    });

    function letGo(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      try { win.releasePointerCapture(d.id); } catch (err) { /* never captured */ }
      /* A tap is not a rub. Somebody who simply presses the heart
         is asking the same question, so answer it. */
      if (d.moved < 6) lift();
    }

    win.addEventListener('pointerup', letGo);
    win.addEventListener('pointercancel', letGo);

    /* Enter and Space raise no pointer event, so a key path stays —
       for keyboards, and for anything without Pointer Events. */
    seal.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lift(); }
    });

    /* Reduced motion: the foil is there to be rubbed, but nobody
       should have to work for the date. One press opens it. */
    if (RH.calm) seal.addEventListener('click', lift);
  };
})();
