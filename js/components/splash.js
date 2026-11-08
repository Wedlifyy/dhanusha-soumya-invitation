/* =============================================================
   THE GATE — a lit courtyard at night, and one jewel to open it.

   The invitation opens onto the mandap courtyard itself, held
   back to a warm dark so only the lamps, the garlands and the two
   names carry any light. Everything the guest reads sits in the
   still centre of that picture.

   The jewel is the way in. Touching it beats the piece once and
   hands the screen over to the carved doors: the courtyard fades
   under them, the doors swing open, and the invitation is behind
   them. The gate is what a guest reads; the doors are what they
   walk through.

   The same press starts the music, because that is the only
   gesture a browser will accept for audio.

   Before it is touched, the gate is lit, written and drawn: the
   lamps come up on the dark courtyard, the names are written in a
   letter at a time, and a kolam is drawn round the jewel. Touched,
   a seam of light opens down the join of the doors just before
   they part, and the guest walks through rather than watching a
   screen fade.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  /* Six motes of lamplight, drifting. Cheap: one transform each,
     and they are the only thing moving while the gate waits. */
  function motes() {
    var out = '';
    for (var i = 1; i <= 6; i++) {
      out += '<span class="gate__mote gate__mote--' + i + '"></span>';
    }
    return '<div class="gate__motes" aria-hidden="true">' + out + '</div>';
  }

  /* -------------------------------------------------------------
     THE KOLAM

     A sikku kolam drawn round the jewel the way it is drawn on a
     threshold at dawn: two lines, one continuous stroke each,
     looping in and out of a ring of dots without ever lifting.
     They are the same wave on either side of one circle, so they
     cross sixteen times and close sixteen eyes, with a dot (the
     pulli) set in every eye.

     Both lines start at the top and are drawn in opposite
     directions, so they meet again at the foot — the way two
     hands finish a kolam together. A ring of finer dots sits
     outside it, and one point of light walks round that ring.
     ------------------------------------------------------------- */
  var KOLAM_R = 74;     /* the circle both lines weave about      */
  var KOLAM_A = 8;      /* how far they swing either side of it   */
  var KOLAM_N = 8;      /* waves per turn: 16 crossings, 16 eyes  */

  function kolamLine(sign) {
    var d = '';
    for (var s = 0; s <= 180; s++) {
      /* sign +1 runs clockwise from the top, -1 counter-clockwise.
         The swing is taken from the distance travelled, not from
         the direction, so each line is out where the other is in
         and they braid — a mirrored wave would only retrace the
         first line. */
      var t = sign * s * Math.PI / 90;
      var r = KOLAM_R + KOLAM_A * Math.sin(KOLAM_N * s * Math.PI / 90);
      d += (s ? 'L' : 'M') +
           (r * Math.sin(t)).toFixed(2) + ' ' +
           (-r * Math.cos(t)).toFixed(2);
    }
    return d;
  }

  function kolam() {
    var eyes = '';
    for (var e = 0; e < KOLAM_N * 2; e++) {
      var a = (e + 0.5) * Math.PI / KOLAM_N;
      eyes += '<circle class="gate__pulli" style="--i:' + e + '" r="1.7" ' +
              'cx="' + (KOLAM_R * Math.sin(a)).toFixed(2) + '" ' +
              'cy="' + (-KOLAM_R * Math.cos(a)).toFixed(2) + '"/>';
    }

    var ring = '';
    var RING = 32;
    for (var k = 0; k < RING; k++) {
      var b = k * Math.PI * 2 / RING;
      ring += '<circle class="gate__bead" style="--i:' + k + '" r=".95" ' +
              'cx="' + (92 * Math.sin(b)).toFixed(2) + '" ' +
              'cy="' + (-92 * Math.cos(b)).toFixed(2) + '"/>';
    }

    return '' +
      '<span class="gate__kolam" aria-hidden="true">' +
        '<svg viewBox="-100 -100 200 200" focusable="false">' +
          '<g class="gate__kolam-turn">' +
            '<path class="gate__line" pathLength="1" d="' + kolamLine(1) + '"/>' +
            '<path class="gate__line gate__line--b" pathLength="1" d="' + kolamLine(-1) + '"/>' +
            eyes +
            ring +
          '</g>' +
        '</svg>' +
      '</span>';
  }

  /* A name written in one letter at a time, the way lamps are lit
     down a row. English is split into letters; Kannada only ever
     into words, because a conjunct pulled apart is no longer the
     same letter. The name itself is kept whole for screen readers. */
  function writeName(el, text, start) {
    el.textContent = '';

    var said = document.createElement('span');
    said.className = 'u-sr';
    said.textContent = text;
    el.appendChild(said);

    var shown = document.createElement('span');
    shown.setAttribute('aria-hidden', 'true');
    el.appendChild(shown);

    var byWord = RH.lang() === 'kn';
    var words = String(text).split(/\s+/).filter(Boolean);
    var n = 0;

    words.forEach(function (word, w) {
      var box = document.createElement('span');
      box.className = 'gate__word';
      var parts = byWord ? [word] : Array.from(word);
      parts.forEach(function (ch) {
        var g = document.createElement('span');
        g.className = 'gate__glyph';
        g.style.setProperty('--d', (start + n * (byWord ? 160 : 42)) + 'ms');
        g.textContent = ch;
        box.appendChild(g);
        n++;
      });
      shown.appendChild(box);
      if (w < words.length - 1) shown.appendChild(document.createTextNode(' '));
    });
  }

  RH.components.splash = function (mount) {
    var media = RH.config.media;
    var art = media.entranceArt || media.plate;

    var view = RH.el(
      '<div class="gate" id="splash">' +
        '<div class="gate__scene" aria-hidden="true">' +
          '<img class="gate__art" src="' + RH.esc(art) + '" alt="" decoding="async">' +
          '<span class="gate__dusk"></span>' +
          '<span class="gate__lamp"></span>' +
          /* The courtyard arrives unlit, and the lamps come up. */
          '<span class="gate__veil"></span>' +
        '</div>' +

        /* The doors wait behind the courtyard at opacity 0, so
           nothing of them is seen before they are walked through. */
        '<video class="gate__video" playsinline muted preload="auto" aria-hidden="true">' +
          '<source src="' + RH.esc(media.splashVideo) + '" type="video/mp4">' +
        '</video>' +

        /* The light behind the doors: a seam down the join before
           they part, and the glow that floods through once they do. */
        '<span class="gate__seam" aria-hidden="true"></span>' +
        '<span class="gate__bloom" aria-hidden="true"></span>' +

        motes() +

        '<div class="gate__lang"></div>' +

        '<div class="gate__ui">' +
          '<div class="gate__say">' +
            '<p class="gate__kicker" data-caps data-i18n="splash.kicker"></p>' +
            '<h1 class="gate__names">' +
              '<span class="gate__nm" data-f="groom"></span>' +
              '<span class="gate__and">' +
                '<i aria-hidden="true"></i>' +
                '<em data-i18n="hero.amp"></em>' +
                '<i aria-hidden="true"></i>' +
              '</span>' +
              '<span class="gate__nm" data-f="bride"></span>' +
            '</h1>' +
          '</div>' +

          '<button class="jewel jewel--gate" type="button">' +
            kolam() +
            RH.jewel({ id: 'gate' }) +
            RH.tapHint() +
          '</button>' +

          '<p class="gate__hint" data-caps data-i18n="splash.open"></p>' +
        '</div>' +
      '</div>'
    );
    mount.appendChild(view);

    var video = view.querySelector('.gate__video');
    var jewel = view.querySelector('.jewel');
    var groom = view.querySelector('[data-f="groom"]');
    var bride = view.querySelector('[data-f="bride"]');

    /* The first paint writes the names into the lit courtyard; a
       language switch after that re-writes them straight away. */
    var firstPaint = true;

    function paint() {
      var lead = firstPaint ? 900 : 0;
      writeName(groom, RH.L(RH.config.groom.name), lead);
      writeName(bride, RH.L(RH.config.bride.name), lead + 560);
      jewel.setAttribute('aria-label', RH.t('splash.open'));
      firstPaint = false;
    }

    RH.onLang(paint);
    RH.applyI18n(view);
    paint();

    document.body.classList.add('is-locked');

    /* The doors always open onto the couple. A reload would
       otherwise restore wherever the last visit was scrolled to,
       and the guest would walk through into the middle of the page. */
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
    window.scrollTo(0, 0);

    /* The gate does nothing on its own, so say so with a hand —
       once the lamps are up, the names are written and the kolam
       has been drawn round the jewel. */
    RH.playTapHint(view.querySelector('.tap-hint'), jewel, RH.calm ? 600 : 3600);

    var opened = false;

    function finish() {
      view.classList.add('is-dismissed');
      document.body.classList.remove('is-locked');
      document.dispatchEvent(new CustomEvent('rh:opened'));
      /* Freed only after the fade, so the doors never flash back. */
      setTimeout(function () {
        try { video.pause(); } catch (e) {}
        view.remove();
      }, 1300);
    }

    function open() {
      if (opened) return;
      opened = true;

      /* Same gesture: music first, then the doors. */
      if (RH.audio) RH.audio.start();

      if (RH.calm) { finish(); return; }

      /* The seam opens down the join of the doors, from the height
         the jewel was hanging at, so the light comes out of the
         very point that was touched. */
      var jr = jewel.getBoundingClientRect();
      var vr = view.getBoundingClientRect();
      if (vr.height > 0) {
        view.style.setProperty('--jy',
          (((jr.top + jr.height / 2) - vr.top) / vr.height * 100).toFixed(2) + '%');
      }

      view.classList.add('is-opening');

      var done = false;
      var end = function () {
        if (done) return;
        done = true;
        /* A beat on the fully open doorway before the hero takes
           over, so it reads as walking through rather than a cut. */
        setTimeout(finish, 420);
      };

      video.addEventListener('ended', end, { once: true });
      setTimeout(end, 6200);          // backstop if the video stalls

      var p = video.play();
      if (p && p.catch) p.catch(end);
    }

    /* Pointerdown draws the light through the metal under the
       finger; the click is what commits, so a drag off the jewel
       still cancels. */
    jewel.addEventListener('pointerdown', function () {
      if (!opened) jewel.classList.add('is-lit');
    });
    jewel.addEventListener('pointerup', function () {
      setTimeout(function () { jewel.classList.remove('is-lit'); }, 900);
    });
    jewel.addEventListener('pointercancel', function () {
      jewel.classList.remove('is-lit');
    });
    jewel.addEventListener('click', open);
  };
})();
