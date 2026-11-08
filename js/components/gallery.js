/* =============================================================
   GALLERY — the mantapa.

   The photographs stand in a ring of temple arches, the way the
   pillars of a mantapa stand round the couple, and the ring turns.
   The arch facing the guest is large and lit; its neighbours turn
   away into a warm haze on either side, and the rest of the ring is
   behind. A gold base ring turns under them like a turntable.

   THE PHOTOGRAPHS ARE CUT-OUTS ON WHITE, and that is used rather
   than hidden: inside each arch the picture is multiplied onto a
   lit niche, so the white simply becomes the niche and the couple
   stand inside the arch with no photograph edge anywhere. A soft
   pool of shadow at the foot of the arch is the floor they stand
   on. Any shape of picture fits — a full-length standing shot, a
   seated pair, a portrait cut at the waist — because the picture is
   contained, never cropped, and its own white margins disappear.

   HANDLING IT
     · swipe sideways to turn the ring; it carries on with the
       flick and settles, with a little give, on the nearest arch;
     · tap the arch in front to open it full-screen; tap one to the
       side to bring it round;
     · the buttons, the beads and the arrow keys do the same;
     · left alone in view, it turns on its own — slowly and without
       a stop, a photograph coming round every six or seven seconds.
       A finger held on it stops it on the spot; after a couple of
       seconds with nothing touched it eases back into its turn.

   ARRIVING. The first time the section is reached, the arches are
   a closed deck at the centre; they fan out into the ring as it
   spins in.

   OPEN, a photograph grows out of its own arch into a full-screen
   arch over a darkened page, and goes back into the right arch
   when closed — whichever one it was swiped to.

   THE COST of all this per frame is one transform on the ring and
   one number per arch (how squarely it faces the guest), read by
   two opacities. Nothing is laid out while it turns.

   Everything — which photographs, their order, their captions —
   comes from `gallery` in data/wedding.config.js.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  function pad(v) { return v < 10 ? '0' + v : String(v); }
  function mod(a, n) { return ((a % n) + n) % n; }
  /* an angle folded into (-180, 180] */
  function fold(a) { a = mod(a + 180, 360) - 180; return a === -180 ? 180 : a; }

  var CHEVRON = function (dir) {
    return '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
             '<path d="' + (dir < 0 ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5') + '" fill="none" ' +
                   'stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
           '</svg>';
  };

  function niche(it) {
    var wh = (it.w && it.h) ? ' width="' + it.w + '" height="' + it.h + '"' : '';
    return '<div class="arch__niche">' +
             '<span class="arch__floor" aria-hidden="true"></span>' +
             '<img src="' + RH.esc(it.src) + '" alt="" decoding="async" loading="lazy"' + wh + '>' +
           '</div>';
  }

  RH.components.gallery = function (mount) {
    var items = RH.config.gallery || [];
    var n = items.length;
    if (!n) return;

    var STEP = 360 / n;

    var arches = items.map(function (it, i) {
      return '' +
        '<div class="arch" data-i="' + i + '" style="--i:' + i + ';--a:' + (i * STEP).toFixed(3) + 'deg">' +
          '<span class="arch__glow" aria-hidden="true"></span>' +
          '<div class="arch__frame">' +
            niche(it) +
            '<span class="arch__veil" aria-hidden="true"></span>' +
          '</div>' +
        '</div>';
    }).join('');

    var beads = items.map(function (it, i) {
      return '<button class="mantapa__bead" type="button" data-i="' + i + '"></button>';
    }).join('');

    var view = RH.el(
      '<section class="sheet sheet--gallery" id="gallery" data-seq="150">' +
        '<p class="t-kicker" data-caps data-rv="soft" data-i18n="gallery.kicker"></p>' +
        '<h2 class="t-title" data-caps data-rv="ink" data-i18n="gallery.title"></h2>' +
        RH.ornament(true) +

        '<div class="mantapa" tabindex="0" role="region" aria-roledescription="carousel">' +
          '<span class="mantapa__light" aria-hidden="true"></span>' +
          /* the turning base the arches stand on */
          '<svg class="mantapa__base" viewBox="0 0 320 64" aria-hidden="true" focusable="false">' +
            '<ellipse class="mantapa__orbit" cx="160" cy="32" rx="152" ry="24"/>' +
            '<ellipse class="mantapa__orbit mantapa__orbit--beads" cx="160" cy="32" rx="140" ry="20"/>' +
          '</svg>' +
          '<div class="mantapa__ring">' + arches + '</div>' +
        '</div>' +

        '<div class="mantapa__bar">' +
          '<button class="mantapa__nav" type="button" data-dir="-1">' + CHEVRON(-1) + '</button>' +
          '<div class="mantapa__cap" aria-hidden="true">' +
            '<span class="mantapa__no"></span>' +
            '<span class="mantapa__line"></span>' +
          '</div>' +
          '<button class="mantapa__nav" type="button" data-dir="1">' + CHEVRON(1) + '</button>' +
        '</div>' +
        '<div class="mantapa__beads">' + beads + '</div>' +
        '<p class="mantapa__hint" data-i18n="gallery.hint"></p>' +
        '<p class="u-sr" aria-live="polite"></p>' +
      '</section>'
    );
    mount.appendChild(view);

    var stage  = view.querySelector('.mantapa');
    var ring   = view.querySelector('.mantapa__ring');
    var els    = [].slice.call(view.querySelectorAll('.arch'));
    var beadEl = [].slice.call(view.querySelectorAll('.mantapa__bead'));
    var capNo  = view.querySelector('.mantapa__no');
    var capLn  = view.querySelector('.mantapa__line');
    var live   = view.querySelector('[aria-live]');
    var navs   = [].slice.call(view.querySelectorAll('.mantapa__nav'));

    /* ---- words ----
       The caption is also the alternative text: someone listening
       hears what the caption says, not "photograph seven". */
    function caption(i) { return RH.L(items[i].caption) || ''; }

    function paint() {
      stage.setAttribute('aria-label', RH.t('gallery.title'));
      navs[0].setAttribute('aria-label', RH.t('gallery.prev'));
      navs[1].setAttribute('aria-label', RH.t('gallery.next'));
      els.forEach(function (el, i) {
        el.querySelector('img').alt = RH.t('gallery.photo') + ' ' + (i + 1) + ' — ' + caption(i);
        beadEl[i].setAttribute('aria-label', RH.t('gallery.photo') + ' ' + (i + 1));
      });
      showCaption(active, true);
    }

    /* -------------------------------------------------------------
       GEOMETRY — sized from the space it is given
       ------------------------------------------------------------- */
    var W = 200, R = 220;

    function size() {
      var room = stage.clientWidth || 340;
      W = Math.round(Math.max(150, Math.min(230, room * 0.53)));
      var H = Math.round(W * 1.42);
      /* far enough out that neighbouring arches never touch, close
         enough that the two either side still show */
      R = Math.round(Math.min(W * 2.3, (W / 2) / Math.tan(Math.PI / Math.max(n, 3)) + W * 0.1));
      stage.style.setProperty('--w', W + 'px');
      stage.style.setProperty('--h', H + 'px');
      stage.style.setProperty('--r', R + 'px');
    }

    /* -------------------------------------------------------------
       THE TURN — one angle, a spring, and the finger
       ------------------------------------------------------------- */
    var rot = 0;          /* degrees; arch i faces the guest at -i*STEP */
    var vel = 0;          /* degrees per ms                              */
    var target = 0;
    var dragging = false;
    var raf = 0, lastT = 0;
    var active = 0;
    var calm = RH.calm;

    /* A little give: it overshoots a hair and settles, like a heavy
       ring on a good bearing. */
    var STIFF = 0.00011;
    var DAMP  = 0.017;

    /* Left alone it turns on its own, smoothly and without stopping
       at each arch — a full turn in about 48 seconds, so a photograph
       comes round to the front every six or seven. It eases in from
       rest rather than lurching off. */
    var CRUISE = -0.0075;     /* degrees per ms                     */
    var RESUME = 2600;        /* the quiet after a touch before it turns again */
    var cruiseV = 0;
    var lastTouch = -1e9, resumeTimer = 0;

    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    function cruising(now) {
      return !calm && arrived && !arriving && onScreen && !viewing && !dragging &&
             now - lastTouch > RESUME;
    }

    /* Any touch stops the turn on the spot and starts the quiet over:
       the ring stays exactly where the finger left it. */
    function touch() {
      lastTouch = performance.now();
      cruiseV = 0;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(kick, RESUME + 40);
    }

    function tick(now) {
      raf = 0;
      var dt = lastT ? Math.min(now - lastT, 40) : 16;
      lastT = now;
      var turning = cruising(now);
      if (!dragging) {
        if (calm) {
          rot = target; vel = 0;
        } else if (turning) {
          cruiseV += (CRUISE - cruiseV) * Math.min(1, dt * 0.0014);
          rot += cruiseV * dt;
          target = rot;
          vel = 0;
        } else {
          /* integrated in small steps, so a slow frame can't kick it */
          for (var s = dt; s > 0; s -= 8) {
            var h = Math.min(8, s);
            vel += ((target - rot) * STIFF - vel * DAMP) * h;
            rot += vel * h;
          }
          if (Math.abs(target - rot) < 0.02 && Math.abs(vel) < 0.0004) { rot = target; vel = 0; }
        }
      }
      render();
      if (dragging || rot !== target || turning) kick();
      else lastT = 0;
    }

    function render() {
      ring.style.setProperty('--rot', rot.toFixed(3) + 'deg');
      stage.style.setProperty('--spin', (rot * 1.4).toFixed(1));
      for (var i = 0; i < n; i++) {
        var rel = fold(i * STEP + rot);
        var f = Math.max(0, Math.cos(rel * Math.PI / 180));
        els[i].style.setProperty('--f', f.toFixed(3));
        els[i].style.setProperty('--hi', Math.pow(f, 8).toFixed(3));
      }
      var now = mod(Math.round(-rot / STEP), n);
      if (now !== active) {
        active = now;
        /* the arrival spin passes every arch; the caption waits for
           the one it settles on */
        if (!arriving) showCaption(active);
      }
    }

    function snap(a) { return Math.round(a / STEP) * STEP; }

    /* the shortest way round to arch i */
    function goTo(i) {
      var want = -i * STEP;
      target = target + fold(want - target);
      kick();
    }
    function step(dir) {
      target = snap(target) - dir * STEP;
      kick();
    }

    /* -------------------------------------------------------------
       THE CAPTION, the beads and the announcement
       ------------------------------------------------------------- */
    var capTimer = 0;
    function showCaption(i, quiet) {
      beadEl.forEach(function (b, k) {
        b.classList.toggle('is-on', k === i);
        b.setAttribute('aria-current', k === i ? 'true' : 'false');
      });
      els.forEach(function (el, k) { el.classList.toggle('is-front', k === i); });

      var text = caption(i);
      var no = pad(i + 1) + ' / ' + pad(n);
      live.textContent = RH.t('gallery.photo') + ' ' + (i + 1) + ' ' + RH.t('gallery.of') + ' ' + n +
                         (text ? ' — ' + text : '');

      if (quiet || calm || !capLn.animate) {
        capNo.textContent = no;
        capLn.textContent = text;
        return;
      }
      /* the line in the caption changes like a page turning: out
         with a lift and a blur, in from below */
      clearTimeout(capTimer);
      capLn.animate([
        { opacity: 1, transform: 'none', filter: 'blur(0)' },
        { opacity: 0, transform: 'translate3d(0,-8px,0)', filter: 'blur(4px)' }
      ], { duration: 180, easing: 'ease-in', fill: 'forwards' });
      capTimer = setTimeout(function () {
        capNo.textContent = no;
        capLn.textContent = text;
        capLn.animate([
          { opacity: 0, transform: 'translate3d(0,10px,0)', filter: 'blur(4px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' }
        ], { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
        capNo.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 400 });
      }, 170);
    }

    /* -------------------------------------------------------------
       THE FINGER
       ------------------------------------------------------------- */
    var startX = 0, startRot = 0, moved = 0, samples = [], pid = null, downAt = 0;

    function degPerPx() { return 57.2958 / R; }

    stage.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      dragging = true;
      pid = e.pointerId;
      startX = e.clientX;
      startRot = rot;
      downAt = performance.now();
      moved = 0;
      vel = 0;
      samples = [[performance.now(), rot]];
      try { stage.setPointerCapture(pid); } catch (err) { /* older engines */ }
      touch();
      kick();
    });

    stage.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      rot = startRot + dx * degPerPx();
      var t = performance.now();
      samples.push([t, rot]);
      while (samples.length > 2 && t - samples[0][0] > 90) samples.shift();
    });

    function release(e, cancelled) {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false;
      try { stage.releasePointerCapture(pid); } catch (err) { /* never captured */ }
      touch();
      var still = moved < 7;
      if (still && (cancelled || performance.now() - downAt > 380)) {
        /* a finger held still on it: it was only stopped, so it stays
           exactly where it was — no jump to the nearest arch, and a
           long press opens nothing */
        rot = startRot;
        target = rot;
        vel = 0;
        kick();
        return;
      }
      if (still) {
        /* a tap, not a turn */
        rot = startRot;
        var hit = e && e.target && e.target.closest ? e.target.closest('.arch') : null;
        if (hit) {
          var i = +hit.getAttribute('data-i');
          if (i === active) open(i);
          else goTo(i);
        }
        target = snap(target);
        kick();
        return;
      }
      /* carry on with the flick, then settle on the nearest arch */
      var first = samples[0], last = samples[samples.length - 1];
      var v = (last[0] - first[0]) > 0 ? (last[1] - first[1]) / (last[0] - first[0]) : 0;
      vel = calm ? 0 : v;
      target = snap(rot + v * 320);
      kick();
    }
    stage.addEventListener('pointerup', function (e) { release(e, false); });
    stage.addEventListener('pointercancel', function (e) { release(e, true); });

    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); touch(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); touch(); step(-1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(active); }
    });

    navs.forEach(function (b) {
      b.addEventListener('click', function () { touch(); step(+b.getAttribute('data-dir')); });
    });
    beadEl.forEach(function (b) {
      b.addEventListener('click', function () { touch(); goTo(+b.getAttribute('data-i')); });
    });

    /* on screen, and whether a photograph is open over it: the turn
       only runs while the ring can be seen */
    var onScreen = false, viewing = false;

    /* -------------------------------------------------------------
       ARRIVAL — a closed deck fans out into the ring
       ------------------------------------------------------------- */
    var arrived = false, arriving = false;
    function arrive() {
      if (arrived) return;
      arrived = true;
      if (calm) { stage.classList.add('is-ring', 'is-settled'); return; }
      arriving = true;
      rot = 150; target = 0; vel = 0;
      render();
      /* one frame with the deck closed, then let the arches open */
      requestAnimationFrame(function () {
        stage.classList.add('is-ring');
        kick();
        setTimeout(function () {
          stage.classList.add('is-settled');
          arriving = false;
          showCaption(active);
          /* a breath on the first arch, then it begins to turn */
          lastTouch = performance.now() - RESUME + 900;
          setTimeout(kick, 940);
        }, 1900);
      });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        for (var k = 0; k < entries.length; k++) {
          onScreen = entries[k].isIntersecting;
          if (onScreen) arrive();
        }
        if (!onScreen) cruiseV = 0;
        kick();
      }, { threshold: 0.25 }).observe(stage);
    } else {
      onScreen = true;
      arrive();
    }

    /* -------------------------------------------------------------
       ONE PHOTOGRAPH, full-screen
       ------------------------------------------------------------- */
    var lb = RH.el(
      '<div class="lb" role="dialog" aria-modal="true" hidden>' +
        '<div class="lb__back"></div>' +
        '<figure class="lb__fig">' +
          '<div class="lb__frame arch__frame">' + niche({ src: items[0].src }) +
            '<span class="glare" aria-hidden="true"></span>' +
          '</div>' +
          '<figcaption class="lb__cap"><span class="lb__no"></span><span class="lb__text"></span></figcaption>' +
        '</figure>' +
        '<button class="lb__close" type="button">' +
          '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
            '<path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
          '</svg>' +
        '</button>' +
        '<button class="lb__nav lb__nav--prev" type="button" data-dir="-1">' + CHEVRON(-1) + '</button>' +
        '<button class="lb__nav lb__nav--next" type="button" data-dir="1">' + CHEVRON(1) + '</button>' +
      '</div>'
    );
    document.body.appendChild(lb);

    var lbBack  = lb.querySelector('.lb__back');
    var lbFrame = lb.querySelector('.lb__frame');
    var lbImg   = lb.querySelector('.lb__frame img');
    var lbCap   = lb.querySelector('.lb__cap');
    var lbNo    = lb.querySelector('.lb__no');
    var lbText  = lb.querySelector('.lb__text');
    var lbClose = lb.querySelector('.lb__close');
    var lbIdx = 0, busy = false;

    /* the open view is never off-screen, so it never waits to load */
    lbImg.loading = 'eager';
    RH.motion.tilt(lbFrame, { max: 7, perspective: 1100 });

    function paintLb() {
      lb.setAttribute('aria-label', RH.t('gallery.photo'));
      lbClose.setAttribute('aria-label', RH.t('gallery.close'));
      lb.querySelector('.lb__nav--prev').setAttribute('aria-label', RH.t('gallery.prev'));
      lb.querySelector('.lb__nav--next').setAttribute('aria-label', RH.t('gallery.next'));
      fillLb(lbIdx);
    }
    function fillLb(i) {
      lbImg.src = items[i].src;
      if (items[i].w) { lbImg.width = items[i].w; lbImg.height = items[i].h; }
      lbImg.alt = RH.t('gallery.photo') + ' ' + (i + 1) + ' — ' + caption(i);
      lbNo.textContent = pad(i + 1) + ' / ' + pad(n);
      lbText.textContent = caption(i);
    }

    /* The open photograph grows out of the arch it was in: the full-
       screen frame is measured where it will rest, then started at
       the arch's own place and size and let go. */
    function flip(fromEl, reverse) {
      var to = lbFrame.getBoundingClientRect();
      var from = fromEl.getBoundingClientRect();
      if (!to.width || !from.width || !lbFrame.animate) return null;
      var s = from.width / to.width;
      var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
      var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
      var away = { transform: 'translate3d(' + dx + 'px,' + dy + 'px,0) scale(' + s + ')', opacity: 0.9 };
      var home = { transform: 'none', opacity: 1 };
      return lbFrame.animate(reverse ? [home, away] : [away, home], {
        duration: reverse ? 460 : 620,
        easing: reverse ? 'cubic-bezier(.5,0,.75,.2)' : 'cubic-bezier(.2,.8,.2,1)',
        fill: 'both'
      });
    }

    var lastFocus = null;
    function open(i) {
      if (viewing) return;
      viewing = true;
      cruiseV = 0;
      lbIdx = i;
      paintLb();
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.documentElement.classList.add('is-viewing');
      var src = els[i].querySelector('.arch__frame');
      void lb.offsetWidth;
      lb.classList.add('is-open');
      if (!calm) {
        src.style.visibility = 'hidden';
        var a = flip(src);
        var done = function () { src.style.visibility = ''; if (a) a.cancel(); };
        if (a) a.onfinish = done; else done();
      }
      lbClose.focus({ preventScroll: true });
    }

    function close() {
      if (!viewing || busy) return;
      /* the ring is already turned to the photograph being viewed,
         so it goes back into the arch it came from */
      var dest = els[lbIdx].querySelector('.arch__frame');
      lb.classList.remove('is-open');
      var finish = function () {
        lb.hidden = true;
        dest.style.visibility = '';
        document.documentElement.classList.remove('is-viewing');
        viewing = false;
        touch();
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      };
      if (calm) { finish(); return; }
      dest.style.visibility = 'hidden';
      var a = flip(dest, true);
      if (a) a.onfinish = function () { finish(); a.cancel(); };
      else finish();
    }

    /* Move to the next or previous photograph while open: the one in
       view slides off with the finger's direction, the next slides
       in from the other side, and the ring behind follows along. */
    function slide(dir) {
      if (busy) return;
      var next = mod(lbIdx + dir, n);
      if (calm || !lbFrame.animate) { lbIdx = next; fillLb(next); goTo(next); return; }
      busy = true;
      var out = lbFrame.animate([
        { transform: 'translate3d(' + (drag.dx || 0) + 'px,0,0)', opacity: 1 },
        { transform: 'translate3d(' + (-dir * 46) + '%,0,0) rotate(' + (-dir * 4) + 'deg)', opacity: 0 }
      ], { duration: 220, easing: 'ease-in', fill: 'forwards' });
      lbCap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
      out.onfinish = function () {
        lbIdx = next;
        fillLb(next);
        goTo(next);
        out.cancel();
        lbFrame.animate([
          { transform: 'translate3d(' + (dir * 46) + '%,0,0) rotate(' + (dir * 4) + 'deg)', opacity: 0 },
          { transform: 'none', opacity: 1 }
        ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = function () { busy = false; };
        lbCap.animate([{ opacity: 0, transform: 'translate3d(0,8px,0)' }, { opacity: 1, transform: 'none' }],
                      { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
      };
    }

    /* swipe inside the open view */
    var drag = { on: false, x: 0, dx: 0, id: null };
    var fig = lb.querySelector('.lb__fig');
    fig.addEventListener('pointerdown', function (e) {
      drag.on = true; drag.x = e.clientX; drag.dx = 0; drag.id = e.pointerId;
    });
    fig.addEventListener('pointermove', function (e) {
      if (!drag.on || e.pointerId !== drag.id || busy) return;
      drag.dx = e.clientX - drag.x;
      if (Math.abs(drag.dx) > 6) {
        lbFrame.style.transform = 'translate3d(' + drag.dx + 'px,0,0) rotate(' + (drag.dx * 0.02) + 'deg)';
      }
    });
    function dragEnd(e) {
      if (!drag.on || (e && e.pointerId !== drag.id)) return;
      drag.on = false;
      lbFrame.style.transform = '';
      if (Math.abs(drag.dx) > 56) slide(drag.dx < 0 ? 1 : -1);
      else if (Math.abs(drag.dx) > 6 && lbFrame.animate) {
        lbFrame.animate([{ transform: 'translate3d(' + drag.dx + 'px,0,0)' }, { transform: 'none' }],
                        { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
      drag.dx = 0;
    }
    fig.addEventListener('pointerup', dragEnd);
    fig.addEventListener('pointercancel', dragEnd);

    lbBack.addEventListener('click', close);
    lbClose.addEventListener('click', close);
    lb.querySelectorAll('.lb__nav').forEach(function (b) {
      b.addEventListener('click', function () { slide(+b.getAttribute('data-dir')); });
    });
    document.addEventListener('keydown', function (e) {
      if (!viewing) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') slide(1);
      else if (e.key === 'ArrowLeft') slide(-1);
      else if (e.key === 'Tab') {
        /* keep the focus inside the open view */
        var f = [].slice.call(lb.querySelectorAll('button'));
        var at = f.indexOf(document.activeElement);
        e.preventDefault();
        f[mod(at + (e.shiftKey ? -1 : 1), f.length)].focus();
      }
    });

    /* ---- start ---- */
    size();
    window.addEventListener('resize', function () { size(); render(); }, { passive: true });
    RH.onLang(function () { paint(); if (viewing) paintLb(); });
    RH.applyI18n(view);
    render();
    paint();
  };
})();
