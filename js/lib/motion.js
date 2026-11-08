/* =============================================================
   RagaHru — MOTION
   The page as a space you move through, not a sheet you scroll.

   Four things live here, shared by every section:

     depth   Each section reports where it sits on the screen —
             --pd, -1 above the middle to 1 below, and --pa, how
             far from the middle either way — and its CSS does the
             rest: the artwork dollies, portraits draw together,
             the venue leans in. One read pass, one write pass,
             one frame, for the whole page.

     tilt    Press a photograph and it gives under the finger: it
             tips toward the touch, a light slides across the
             glass, and it springs back when let go. A mouse does
             the same on hover. The browser keeps the scroll — a
             touch that starts to move is handed back at once.

     dust    A fine gold dust hangs in front of the invitation at
             three depths. Still, it drifts upward like lamp smoke;
             scrolled, the near motes stream past faster than the
             far ones, which is what makes the page read as depth.

     sparks  A touch anywhere lights a ring and a few sparks where
             the finger lands. It answers the guest; it never
             decorates on its own.

   Speed of scroll is shared too (`onFrame`), so a fast flick can
   stretch the gallery and draw a tail on the garland blossom.

   Everything is transform, opacity and one canvas. With reduced
   motion asked for, none of it exists: every call below becomes a
   no-op and the page is exactly as it was.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  var M = RH.motion = {
    depth:   function () {},
    tilt:    function () {},
    onFrame: function () {},
    spark:   function () {},
    burst:   function () {},
    ambient: function () {}
  };

  if (RH.calm) return;

  /* -------------------------------------------------------------
     THE FRAME — scroll position and speed, read once per frame
     ------------------------------------------------------------- */
  var tracked = [];        /* { el, write: [], on, p }            */
  var known = new WeakSet();
  var subs = [];
  var raf = 0;
  var lastY = window.scrollY;
  var lastT = 0;
  var vel = 0;             /* px per ms, smoothed                  */

  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  function frame(now) {
    raf = 0;
    var dt = lastT ? Math.min(now - lastT, 64) : 16;
    lastT = now;

    var y = window.scrollY;
    var v = dt > 0 ? (y - lastY) / dt : 0;
    lastY = y;
    vel += (v - vel) * 0.2;
    if (Math.abs(vel) < 0.003) vel = 0;
    var sv = clamp(vel / 2.6, -1, 1);

    /* Read every rectangle first, then write: one layout, ever. */
    var half = (window.innerHeight || 800) / 2;
    var live = [], ps = [];
    for (var i = 0; i < tracked.length; i++) {
      var t = tracked[i];
      if (!t.on) continue;
      var r = t.el.getBoundingClientRect();
      live.push(t);
      ps.push(clamp((r.top + r.height / 2 - half) / (half + r.height / 2), -1, 1));
    }
    for (var j = 0; j < live.length; j++) {
      var tr = live[j], p = ps[j];
      if (Math.abs(p - tr.p) < 0.0004) continue;
      tr.p = p;
      for (var w = 0; w < tr.write.length; w++) {
        tr.write[w].style.setProperty('--pd', p.toFixed(4));
        tr.write[w].style.setProperty('--pa', Math.abs(p).toFixed(4));
      }
    }

    for (var k = 0; k < subs.length; k++) {
      try { subs[k](sv, now); } catch (e) { /* one bad listener must not stop the rest */ }
    }

    /* Keep going while the speed is still settling, so anything
       stretched by a flick eases back rather than snapping. */
    if (vel !== 0) kick();
    else lastT = 0;
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      for (var k = 0; k < tracked.length; k++) {
        var t = tracked[k];
        if (t.el !== entries[i].target) continue;
        t.on = entries[i].isIntersecting;
        for (var w = 0; w < t.write.length; w++) t.write[w].classList.toggle('mo-live', t.on);
      }
    }
    kick();
  }, { rootMargin: '25% 0px 25% 0px' }) : null;

  /* Track `el` and write --pd / --pa onto each of `write` (the
     element itself if none are given). Writing onto the few
     elements that use the numbers, rather than the whole section,
     keeps each frame's style work small. */
  M.depth = function (el, write) {
    if (!el || known.has(el)) return;
    known.add(el);
    var list = (write && write.length ? write : [el]).filter(Boolean);
    tracked.push({ el: el, write: list, on: !io, p: 9 });
    if (io) io.observe(el);
    kick();
  };

  M.onFrame = function (fn) { subs.push(fn); kick(); };

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick, { passive: true });

  /* -------------------------------------------------------------
     TILT — a photograph that gives under the finger
     ------------------------------------------------------------- */
  M.tilt = function (el, opts) {
    if (!el) return;
    opts = opts || {};
    var max = opts.max || 7;
    var cur = { x: 0, y: 0, s: 0 };
    var goal = { x: 0, y: 0, s: 0 };
    var gx = 50, gy = 50;
    var rect = null;
    var held = false;
    var spin = 0;

    el.classList.add('is-tiltable');
    /* A tip in depth needs a viewpoint: it is set on the parent, so
       the photograph's own transform stays free for its reveal. */
    if (el.parentElement && !el.parentElement.style.perspective) {
      el.parentElement.style.perspective = (opts.perspective || 700) + 'px';
    }

    function write() {
      var m = Math.min(1, Math.sqrt(cur.x * cur.x + cur.y * cur.y));
      /* The axis lies across the line from the centre to the touch,
         so the side under the finger is the side that gives. The
         hair of y keeps the axis from ever being a zero vector. */
      el.style.setProperty('--ax', (-cur.y).toFixed(3));
      el.style.setProperty('--ay', (cur.x + 0.0001).toFixed(4));
      el.style.setProperty('--ta', (m * max * cur.s).toFixed(2) + 'deg');
      el.style.setProperty('--ts', cur.s.toFixed(3));
      el.style.setProperty('--gx', gx.toFixed(1) + '%');
      el.style.setProperty('--gy', gy.toFixed(1) + '%');
    }

    function step() {
      spin = 0;
      cur.x += (goal.x - cur.x) * 0.17;
      cur.y += (goal.y - cur.y) * 0.17;
      cur.s += (goal.s - cur.s) * 0.14;
      var left = Math.abs(goal.x - cur.x) + Math.abs(goal.y - cur.y) + Math.abs(goal.s - cur.s);
      if (left < 0.003) { cur.x = goal.x; cur.y = goal.y; cur.s = goal.s; }
      write();
      if (left >= 0.003) spin = requestAnimationFrame(step);
    }
    function go() { if (!spin) spin = requestAnimationFrame(step); }

    function aim(e) {
      if (!rect) rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var nx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      var ny = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      gx = nx * 100;
      gy = ny * 100;
      goal.x = (nx - 0.5) * 2;
      goal.y = (ny - 0.5) * 2;
      goal.s = 1;
      el.classList.add('is-tilt');
      go();
    }
    function release() {
      held = false;
      rect = null;
      goal.x = 0; goal.y = 0; goal.s = 0;
      el.classList.remove('is-tilt');
      go();
    }

    el.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { rect = null; aim(e); }
    });
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse' || held) aim(e);
    });
    el.addEventListener('pointerdown', function (e) {
      held = true; rect = null; aim(e);
    });
    el.addEventListener('pointerup', function (e) {
      if (e.pointerType !== 'mouse') release(); else held = false;
    });
    el.addEventListener('pointerleave', release);
    /* The browser has taken the touch for a scroll: let go at once. */
    el.addEventListener('pointercancel', release);
    /* The page moving under a held finger also lets go. */
    window.addEventListener('scroll', function () { if (held) release(); }, { passive: true });
  };

  /* -------------------------------------------------------------
     DUST AND SPARKS — one canvas over the invitation
     ------------------------------------------------------------- */
  var cv = null, ctx = null, dpr = 1, W = 0, H = 0;
  var motes = [], sparks = [], rings = [];
  var dustRaf = 0, dustLast = 0, dustY = 0;
  var band = { left: 0, width: 0 };
  var sprite = null;

  /* One soft round of light, drawn once and stamped for every mote:
     a gradient per mote per frame is the expensive way to do this. */
  function makeSprite() {
    var s = document.createElement('canvas');
    s.width = s.height = 64;
    var g = s.getContext('2d');
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0,    'rgba(255, 236, 190, 1)');
    grd.addColorStop(0.22, 'rgba(232, 184, 104, .85)');
    grd.addColorStop(0.55, 'rgba(200, 146, 70, .28)');
    grd.addColorStop(1,    'rgba(200, 146, 70, 0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return s;
  }

  function fit() {
    if (!cv) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    var shell = document.querySelector('.shell');
    var r = shell ? shell.getBoundingClientRect() : { left: 0, width: W };
    band.left = r.left;
    band.width = r.width || W;
  }

  function mote(anywhere) {
    /* Three depths: far motes are large, faint and slow; near ones
       small, bright and quick. */
    var z = Math.random();
    return {
      x: band.left + Math.random() * band.width,
      y: anywhere ? Math.random() * H : H + 10 + Math.random() * 40,
      z: z,
      r: z < 0.33 ? 7 + Math.random() * 7 : (z < 0.75 ? 3 + Math.random() * 3 : 1.4 + Math.random() * 1.6),
      a: z < 0.33 ? 0.07 + Math.random() * 0.06 : (z < 0.75 ? 0.16 + Math.random() * 0.12 : 0.34 + Math.random() * 0.24),
      rise: 0.006 + z * 0.018 + Math.random() * 0.008,
      sway: Math.random() * Math.PI * 2,
      sw: 0.0005 + Math.random() * 0.0009,
      tw: Math.random() * Math.PI * 2
    };
  }

  function drawDust(now) {
    /* The next frame is asked for first, so nothing that goes wrong
       in this one can stop the dust for the rest of the visit. */
    dustRaf = requestAnimationFrame(drawDust);
    var dt = dustLast ? Math.min(now - dustLast, 48) : 16;
    dustLast = now;

    var y = window.scrollY;
    var dy = y - dustY;
    dustY = y;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* ---- the motes ---- */
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      /* Scrolled, each moves with the page by its own depth: the
         near ones nearly keep pace, the far ones hang back. */
      m.y -= m.rise * dt + dy * (0.18 + m.z * 0.62);
      m.sway += m.sw * dt;
      m.tw += 0.0016 * dt;
      var x = m.x + Math.sin(m.sway) * (6 + m.z * 8);

      if (m.y < -30 || m.y > H + 60) { motes[i] = mote(false); if (dy < 0) motes[i].y = -20; continue; }

      var twinkle = 0.75 + Math.sin(m.tw) * 0.25;
      var streak = Math.min(Math.abs(dy) * (0.3 + m.z * 1.1), 46);
      var s = m.r * 2;
      ctx.globalAlpha = m.a * twinkle;
      if (streak > 2) {
        /* A fast scroll draws the near motes out into streaks. */
        ctx.drawImage(sprite, x - m.r, m.y - m.r - (dy > 0 ? 0 : streak), s, s + streak);
      } else {
        ctx.drawImage(sprite, x - m.r, m.y - m.r, s, s);
      }
    }

    /* ---- rings where a finger landed ---- */
    for (var r = rings.length - 1; r >= 0; r--) {
      var g = rings[r];
      g.age += dt;
      /* a ring dealt a later start has not begun yet */
      if (g.age <= 0) continue;
      var k = g.age / g.life;
      if (k >= 1) { rings.splice(r, 1); continue; }
      var e = 1 - Math.pow(1 - k, 3);
      ctx.globalAlpha = (1 - k) * 0.55;
      ctx.strokeStyle = '#D9A45C';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 4 + e * g.reach, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* ---- sparks ---- */
    for (var p = sparks.length - 1; p >= 0; p--) {
      var sp = sparks[p];
      sp.age += dt;
      if (sp.age >= sp.life) { sparks.splice(p, 1); continue; }
      sp.vx *= (1 - 0.003 * dt);
      sp.vy = sp.vy * (1 - 0.003 * dt) + 0.00016 * dt;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      var q = 1 - sp.age / sp.life;
      ctx.globalAlpha = q;
      var ss = sp.r * (0.6 + q * 0.6) * 2;
      ctx.drawImage(sprite, sp.x - ss / 2, sp.y - ss / 2, ss, ss);
    }
    ctx.globalAlpha = 1;
  }

  function startDust() {
    if (cv) return;
    cv = document.createElement('canvas');
    cv.className = 'dust';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    sprite = makeSprite();
    fit();
    dustY = window.scrollY;
    var n = W < 520 ? 22 : 30;
    for (var i = 0; i < n; i++) motes.push(mote(true));
    window.addEventListener('resize', fit, { passive: true });
    dustRaf = requestAnimationFrame(drawDust);
    /* A hidden tab stops the browser's frames already; this only
       makes the restart clean when it comes back. */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { dustLast = 0; dustY = window.scrollY; }
    });
  }

  /* A ring and a few sparks at a point on the screen. */
  M.spark = function (x, y, n) {
    if (!ctx) return;
    rings.push({ x: x, y: y, age: 0, life: 700, reach: 30 });
    var count = n || 7;
    for (var i = 0; i < count; i++) {
      var a = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      var v = 0.05 + Math.random() * 0.11;
      sparks.push({
        x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.03,
        r: 2 + Math.random() * 2.6,
        age: 0, life: 520 + Math.random() * 420
      });
    }
  };

  /* A larger handful, for a moment that deserves it — a reply sent. */
  M.burst = function (x, y) {
    if (!ctx) return;
    rings.push({ x: x, y: y, age: 0, life: 1000, reach: 70 });
    rings.push({ x: x, y: y, age: -160, life: 1100, reach: 110 });
    for (var i = 0; i < 26; i++) {
      var a = Math.random() * Math.PI * 2;
      var v = 0.08 + Math.random() * 0.22;
      sparks.push({
        x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.08,
        r: 2.4 + Math.random() * 3.4,
        age: 0, life: 900 + Math.random() * 700
      });
    }
  };

  /* Started once the doors are open, so the gate keeps its own
     lamplight to itself. */
  M.ambient = function () {
    document.addEventListener('rh:opened', function () {
      startDust();
      document.addEventListener('pointerdown', function (e) {
        var t = e.target;
        /* Not where the finger is already doing something precise:
           typing, rubbing the foil, working the map. */
        if (t && t.closest && t.closest('input, textarea, select, iframe, .scr__win')) return;
        M.spark(e.clientX, e.clientY);
      }, { passive: true, capture: true });
    }, { once: true });
  };
})();
