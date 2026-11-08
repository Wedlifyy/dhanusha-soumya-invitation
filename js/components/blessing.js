/* =============================================================
   FINAL QUOTE — the last page of the invitation.

   Nothing here hurries. The rule draws, the blessing arrives a
   word at a time, the line beneath it follows, the names unfold,
   and a single mark closes the card.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  /* -------------------------------------------------------------
     THE MANDALA behind the last page

     Drawn in the finest gold line, ring by ring from the centre
     out, as the page is reached — then it turns, a full turn in
     three minutes, the inner rings against the outer ones. Every
     ring is one path, so each draws as a single stroke.
     ------------------------------------------------------------- */
  function petals(n, r0, r1, bulge, turn) {
    /* n petals, each a pair of curves from radius r0 out to a
       point at r1, swelling by `bulge` of the gap between them. */
    var d = '';
    for (var i = 0; i < n; i++) {
      var a  = (i / n) * Math.PI * 2 + (turn || 0);
      var w  = Math.PI / n;
      var p0 = [Math.cos(a - w) * r0, Math.sin(a - w) * r0];
      var p1 = [Math.cos(a + w) * r0, Math.sin(a + w) * r0];
      var tip = [Math.cos(a) * r1, Math.sin(a) * r1];
      var rc = r0 + (r1 - r0) * bulge;
      var c0 = [Math.cos(a - w * .9) * rc, Math.sin(a - w * .9) * rc];
      var c1 = [Math.cos(a + w * .9) * rc, Math.sin(a + w * .9) * rc];
      d += 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) +
           'Q' + c0[0].toFixed(1) + ' ' + c0[1].toFixed(1) + ' ' + tip[0].toFixed(1) + ' ' + tip[1].toFixed(1) +
           'Q' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1);
    }
    return d;
  }

  function ring(r) {
    return 'M' + r + ' 0A' + r + ' ' + r + ' 0 1 1 ' + (-r) + ' 0A' + r + ' ' + r + ' 0 1 1 ' + r + ' 0';
  }

  function beads(n, r) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      out += '<circle cx="' + (Math.cos(a) * r).toFixed(1) + '" cy="' + (Math.sin(a) * r).toFixed(1) +
             '" r="1.6" style="--i:' + i + '"/>';
    }
    return out;
  }

  function mandala() {
    var layers = [
      ring(18),
      petals(8, 18, 46, .62, 0),
      ring(52),
      petals(16, 52, 84, .58, Math.PI / 16),
      ring(90),
      petals(24, 90, 118, .55, 0),
      ring(124)
    ];
    var paths = layers.map(function (d, i) {
      return '<path class="mandala__line" pathLength="1" style="--i:' + i + '" d="' + d + '"/>';
    }).join('');
    return '' +
      '<div class="mandala" aria-hidden="true">' +
        '<svg viewBox="-140 -140 280 280" focusable="false">' +
          '<g class="mandala__turn">' + paths + '</g>' +
          '<g class="mandala__beads">' + beads(32, 134) + '</g>' +
        '</svg>' +
      '</div>';
  }

  RH.components.blessing = function (mount) {
    var view = RH.el(
      '<section class="plate" id="blessing">' +
        RH.plateArt(26) +
        mandala() +
        '<div class="plate__inner" data-seq="420">' +
          RH.ornament(true) +
          '<h2 class="bless__line" data-rv="words"></h2>' +
          '<p class="bless__sub"  data-rv="soft" data-i18n="blessing.sub"></p>' +
          '<p class="bless__names" data-rv="unfold"></p>' +
          '<span class="bless__close" data-rv="seal" aria-hidden="true"></span>' +
        '</div>' +
      '</section>'
    );
    mount.appendChild(view);

    var line  = view.querySelector('.bless__line');
    var names = view.querySelector('.bless__names');

    function paint() {
      /* The heading is set by hand rather than through data-i18n,
         because it is laid out one word per span. */
      RH.reveal.words(line, RH.t('blessing.line'), 120);

      var joiner = RH.lang() === 'kn' ? ' — ' : ' & ';
      names.textContent = RH.L(RH.config.groom.name) + joiner + RH.L(RH.config.bride.name);
    }

    RH.onLang(paint);
    RH.applyI18n(view);
    paint();

    /* The mandala is drawn once, the first time the page is
       reached. */
    var drawn = false;
    function draw() { if (!drawn) { drawn = true; view.classList.add('is-drawn'); } }
    if (RH.calm || !('IntersectionObserver' in window)) {
      draw();
    } else {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { io.disconnect(); draw(); }
      }, { threshold: 0.3 });
      io.observe(view);
    }
  };
})();
