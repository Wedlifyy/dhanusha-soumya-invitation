/* =============================================================
   MUSIC — audio engine, and the heart at top-right.

   The control is a small gold heart, the kind embossed on the
   corner of an invitation. It carries one hairline note so its
   purpose is legible, and nothing else. It is deliberately plain:
   the jewelled piece belongs on the gate, where it is the whole
   screen; up here it would only compete with the couple.

   Playing, it LISTENS. The track is read as it plays, and a ring
   of fine gold rays round the heart rises and falls with it —
   low notes at the top, high ones running round to the foot, the
   way a kolam radiates from its centre. The heart beats with the
   bass rather than with a clock, and on a strong beat a small
   gold note slips off it and drifts down into the page.
   Paused: the rays settle into a ring of resting beads, and the
   heart simply rests.

   If the track cannot be read — no Web Audio, a file served from
   another origin, a context the browser will not start — the rays
   move to a gentle invented rhythm instead and the music is never
   touched. Reading audio from another origin without CORS would
   SILENCE it, so that case is never even attempted.

   Browsers block autoplay audio, so playback always begins from
   the same touch that opens the invitation.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  /* One continuous heart outline, drawn as a card engraver would:
     two lobes into a single point. viewBox is square so the glow
     and the artwork stay concentric. */
  var HEART = 'M20 33.2C20 33.2 5.4 23.3 5.4 14.6C5.4 9.8 9.2 6.4 13.5 6.4' +
              'C16.6 6.4 19 8.5 20 11.2C21 8.5 23.4 6.4 26.5 6.4' +
              'C30.8 6.4 34.6 9.8 34.6 14.6C34.6 23.3 20 33.2 20 33.2Z';

  RH.components.musicButton = function (mount) {
    var cfg = (RH.config.music || {});

    var btn = RH.el(
      '<button class="heart" type="button" aria-pressed="false">' +
        '<span class="heart__glow" aria-hidden="true"></span>' +
        /* The ring of rays that listens to the track. */
        '<canvas class="heart__rays" aria-hidden="true"></canvas>' +
        /* Where the notes that slip off the heart are let go. */
        '<span class="heart__notes" aria-hidden="true"></span>' +
        '<svg class="heart__art" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
          '<defs>' +
            '<radialGradient id="rhHeartFill" cx="50%" cy="34%" r="68%">' +
              '<stop offset="0%"   stop-color="#FFFBF0" stop-opacity=".96"/>' +
              '<stop offset="55%"  stop-color="#F7E7C6" stop-opacity=".82"/>' +
              '<stop offset="100%" stop-color="#EBD3A4" stop-opacity=".58"/>' +
            '</radialGradient>' +
            '<linearGradient id="rhHeartEdge" x1="14%" y1="8%" x2="82%" y2="94%">' +
              '<stop offset="0%"   stop-color="#D9A860"/>' +
              '<stop offset="48%"  stop-color="#A06B24"/>' +
              '<stop offset="100%" stop-color="#8A5716"/>' +
            '</linearGradient>' +
          '</defs>' +
          '<path class="heart__fill" d="' + HEART + '" fill="url(#rhHeartFill)"/>' +
          '<path class="heart__edge" d="' + HEART + '" fill="none" ' +
                'stroke="url(#rhHeartEdge)" stroke-width="1.25" ' +
                'stroke-linecap="round" stroke-linejoin="round"/>' +
          /* The smallest legible note — one head, one stem, one flag,
             about six pixels tall. It says "music"; it is not the
             ornament. The heart is. */
          '<g class="heart__note">' +
            '<path d="M19.5 20.4V15.8C20.9 16 22 16.7 21.9 17.9" fill="none" ' +
                  'stroke="#9A6520" stroke-width=".85" stroke-linecap="round" ' +
                  'stroke-linejoin="round"/>' +
            '<circle cx="18.45" cy="20.5" r="1.05" fill="#9A6520"/>' +
          '</g>' +
        '</svg>' +
      '</button>'
    );
    mount.appendChild(btn);

    /* Switched off in config: no engine, no control. */
    if (!cfg.enabled) {
      btn.classList.add('u-hidden');
      RH.audio = { start: function () {}, toggle: function () {}, playing: function () { return false; } };
      return;
    }

    var audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = typeof cfg.volume === 'number' ? cfg.volume : 0.55;
    audio.setAttribute('playsinline', '');
    if (cfg.src) audio.src = cfg.src;

    var playing = false;
    var ready = !!cfg.src;

    /* -------------------------------------------------------------
       THE RAYS — the ring that listens
       ------------------------------------------------------------- */
    var rays     = btn.querySelector('.heart__rays');
    var notesBox = btn.querySelector('.heart__notes');
    var rctx  = rays.getContext ? rays.getContext('2d') : null;
    var RAYS  = 28;
    var SIZE  = 76;          /* CSS px of the ring; the button is 44  */
    var INNER = 19.5;        /* where a ray leaves, just off the heart */
    var rdpr  = Math.min(window.devicePixelRatio || 1, 2);
    if (rctx) { rays.width = rays.height = Math.round(SIZE * rdpr); }

    var actx = null, analyser = null, bins = null, wired = false;
    var heights = new Float32Array(RAYS);
    /* Each ray's own running level. A ray is drawn by how far the
       music has risen ABOVE that — so a track with a loud, steady
       low end does not hold every ray at full length, and a beat
       always reads as a beat however loud the song is mastered. */
    var floor = new Float32Array(RAYS / 2);
    var level = 0, bassAvg = 0, lastBass = 0, lastNote = 0, flash = 0, loop = 0, lastT = 0;

    function sameOrigin(src) {
      try { return new URL(src, location.href).origin === location.origin; }
      catch (e) { return false; }
    }

    /* Called inside the touch that starts the music: a context made
       outside a gesture starts suspended on most phones. The track
       is only routed through it once the context is actually
       running — until then, and if it never runs, the music plays
       exactly as it always did and the rays invent their rhythm. */
    function listen() {
      if (wired || RH.calm || !cfg.src || !sameOrigin(cfg.src)) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      wired = true;
      try { actx = new AC(); } catch (e) { actx = null; return; }
      function route() {
        if (!actx || actx.state !== 'running' || analyser) return;
        try {
          var src = actx.createMediaElementSource(audio);
          var an = actx.createAnalyser();
          an.fftSize = 128;
          an.smoothingTimeConstant = 0.8;
          src.connect(an);
          an.connect(actx.destination);
          bins = new Uint8Array(an.frequencyBinCount);
          analyser = an;
          btn.classList.add('is-listening');
        } catch (e) { analyser = null; }
      }
      if (actx.state === 'running') route();
      else if (actx.resume) actx.resume().then(route).catch(function () {});
    }

    /* The phone can suspend the context itself — a call, the tab
       sent to the background. Any later touch is a gesture that may
       wake it, so every touch on the page offers to. */
    function wake() {
      if (actx && actx.state === 'suspended' && actx.resume) {
        actx.resume().catch(function () {});
      }
    }
    document.addEventListener('pointerdown', wake, { passive: true, capture: true });

    /* Each frame: one height per ray, 0..1, and the strength of the
       bass. The ring is mirrored left to right — low notes at the
       top, high ones running round both sides to the foot — so it
       always reads as one ornament, never as a chart. */
    function measure(now) {
      var half = RAYS / 2, i;
      if (analyser) {
        analyser.getByteFrequencyData(bins);
        for (i = 0; i < half; i++) {
          var b = Math.min(bins.length - 1,
                           1 + Math.floor(Math.pow(i / half, 1.5) * bins.length * 0.7));
          var raw = bins[b] / 255;
          if (!floor[i]) floor[i] = raw;
          floor[i] += (raw - floor[i]) * 0.035;
          var h = 0.22 * raw + 2.6 * Math.max(0, raw - floor[i]);
          heights[i] = heights[RAYS - 1 - i] = h > 1 ? 1 : h;
        }
        return (bins[1] + bins[2] + bins[3]) / 765;
      }
      /* Nothing to read: a slow swell with two waves running round
         it, and a pulse about the pace of a resting heart. */
      var t = now / 1000;
      for (i = 0; i < half; i++) {
        var v = 0.34 + 0.24 * Math.sin(t * 2.1 + i * 0.55) + 0.18 * Math.sin(t * 3.7 - i * 0.9);
        heights[i] = heights[RAYS - 1 - i] = Math.max(0, v) * (1 - i / RAYS * 0.6);
      }
      return 0.3 + Math.pow(Math.max(0, Math.sin(t * Math.PI * 1.5)), 6) * 0.55;
    }

    function drawRest() {
      if (!rctx) return;
      rctx.setTransform(rdpr, 0, 0, rdpr, 0, 0);
      rctx.clearRect(0, 0, SIZE, SIZE);
      var c = SIZE / 2;
      rctx.fillStyle = 'rgba(176, 120, 44, .62)';
      for (var i = 0; i < RAYS; i++) {
        var a = (-90 + (i + 0.5) * 360 / RAYS) * Math.PI / 180;
        rctx.beginPath();
        rctx.arc(c + Math.cos(a) * (INNER + 1.6), c + Math.sin(a) * (INNER + 1.6), 0.95, 0, Math.PI * 2);
        rctx.fill();
      }
    }

    function draw(now) {
      loop = 0;
      if (!playing || document.hidden) return;
      var dt = lastT ? Math.min(now - lastT, 50) : 16;
      lastT = now;

      var bass = measure(now);
      /* The beat is the bass rising above its own recent level:
         quick to strike, slower to let go, like a heart. */
      bassAvg += (bass - bassAvg) * 0.04;
      var pulse = Math.max(0, Math.min(1, (bass - bassAvg * 0.96) * 7));
      level += (pulse - level) * (pulse > level ? 0.5 : 0.12);
      flash *= Math.pow(0.995, dt);
      btn.style.setProperty('--lv', level.toFixed(3));

      /* A strong, rising beat lets a note go — never more than one
         every couple of seconds, and never a crowd of them. */
      if (pulse > 0.6 && bass > lastBass && now - lastNote > 2000) {
        lastNote = now;
        note();
      }
      lastBass = bass;

      rctx.setTransform(rdpr, 0, 0, rdpr, 0, 0);
      rctx.clearRect(0, 0, SIZE, SIZE);
      var c = SIZE / 2;
      rctx.lineCap = 'round';
      for (var i = 0; i < RAYS; i++) {
        var a = (-90 + (i + 0.5) * 360 / RAYS) * Math.PI / 180;
        var h = 1.4 + heights[i] * 11 + flash * 7;
        var cx = Math.cos(a), cy = Math.sin(a);
        rctx.strokeStyle = 'rgba(176, 120, 44, ' + (0.42 + heights[i] * 0.5).toFixed(3) + ')';
        rctx.lineWidth = 1.5;
        rctx.beginPath();
        rctx.moveTo(c + cx * INNER, c + cy * INNER);
        rctx.lineTo(c + cx * (INNER + h), c + cy * (INNER + h));
        rctx.stroke();
        /* a lit bead on the tip of a tall ray */
        if (h > 8) {
          rctx.fillStyle = 'rgba(255, 236, 196, ' + Math.min(1, (h - 8) / 6).toFixed(3) + ')';
          rctx.beginPath();
          rctx.arc(c + cx * (INNER + h + 1), c + cy * (INNER + h + 1), 1.2, 0, Math.PI * 2);
          rctx.fill();
        }
      }
      loop = requestAnimationFrame(draw);
    }

    function run() {
      if (!rctx || RH.calm || loop || !playing) return;
      /* From here the heart beats to the frame loop, not to CSS. */
      btn.classList.add('has-rays');
      lastT = 0;
      loop = requestAnimationFrame(draw);
    }
    function rest() {
      if (loop) { cancelAnimationFrame(loop); loop = 0; }
      btn.style.setProperty('--lv', '0');
      drawRest();
    }

    /* A note in the same hand as the one engraved on the heart. */
    var NOTE = '<svg viewBox="0 0 12 16" focusable="false">' +
                 '<path d="M5.2 12.4V2.4C7.8 2.8 9.8 4.3 9.5 6.6" fill="none" stroke="currentColor" ' +
                       'stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' +
                 '<ellipse cx="3.3" cy="12.6" rx="2.6" ry="1.9" transform="rotate(-22 3.3 12.6)" ' +
                          'fill="currentColor"/>' +
               '</svg>';

    function note() {
      if (notesBox.childElementCount > 2) return;
      var n = document.createElement('span');
      n.className = 'heart__fly';
      n.innerHTML = NOTE;
      /* down and to the left: from the corner, into the page */
      n.style.setProperty('--dx', (-34 - Math.random() * 46).toFixed(0) + 'px');
      n.style.setProperty('--dy', (36 + Math.random() * 44).toFixed(0) + 'px');
      n.style.setProperty('--rot', ((Math.random() - 0.5) * 50).toFixed(0) + 'deg');
      notesBox.appendChild(n);
      setTimeout(function () { n.remove(); }, 2700);
    }

    drawRest();

    /* No track supplied yet. The control stays put and says so,
       rather than vanishing and leaving nothing to configure. */
    audio.addEventListener('error', function () {
      ready = false;
      playing = false;
      paint();
    });
    audio.addEventListener('canplay', function () {
      ready = true;
      paint();
    });

    function paint() {
      btn.classList.toggle('is-playing', playing);
      btn.classList.toggle('is-unavailable', !ready);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      var label = !ready ? RH.t('music.unavailable')
                         : RH.t(playing ? 'music.pause' : 'music.play');
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }

    function start() {
      if (!ready) { paint(); return; }
      /* Still inside the touch: the one moment a listening context
         is allowed to start. */
      listen();
      wake();
      var p = audio.play();
      if (p && p.then) {
        p.then(function () { playing = true; paint(); run(); })
         .catch(function () { playing = false; paint(); rest(); });
      } else {
        playing = true;
        paint();
        run();
      }
    }

    function pause() {
      audio.pause();
      playing = false;
      paint();
      rest();
    }

    btn.addEventListener('click', function () {
      /* A press the finger can feel, independent of the beat — and
         the rays flare out with it. */
      btn.classList.remove('is-tapped');
      void btn.offsetWidth;
      btn.classList.add('is-tapped');
      flash = 1;
      playing ? pause() : start();
    });

    btn.addEventListener('animationend', function (e) {
      if (e.animationName === 'heartTap') btn.classList.remove('is-tapped');
    });

    /* Leaving the tab shouldn't leave music playing behind you. */
    document.addEventListener('visibilitychange', function () {
      if (!playing) return;
      if (document.hidden) {
        audio.pause();
        rest();
      } else {
        wake();
        audio.play().catch(function () {});
        run();
      }
    });

    RH.onLang(paint);
    paint();

    RH.audio = {
      start: start,
      toggle: function () { playing ? pause() : start(); },
      playing: function () { return playing; }
    };
  };
})();
