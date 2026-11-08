/* =============================================================
   EVENTS — a garland hung down the page, four blossoms on it.

   Not four cards. A champagne cord runs the height of the section
   and every ceremony is knotted to it: a large round medallion on
   one side, its writing on the other, the sides alternating down
   the page. Between one ceremony and the next a small vine grows
   on the cord, so the length between blossoms is planted rather
   than ruled.

   The scroll writes the garland. A blossom travels down the cord
   as the page moves, the gold fills in behind it, each vine grows
   as it is reached, and the ceremony it is standing on lifts,
   lights and has jasmine tied round it. All of it is one
   rAF-throttled listener writing one custom property and one
   class — transforms and opacity only, nothing that can move the
   page.

   Order and content come from `events` in wedding.config.js and
   nothing else, so re-ordering or adding a ceremony needs no
   change here. A ceremony with no `preview` image keeps its place
   on the cord as a plain gold node rather than a broken picture.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI',
               'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  /* -------------------------------------------------------------
     THE TWELVE RASHIS

     In the order of the zodiac, from Mesha. Each carries its name
     in both languages and its sign, drawn as one gold line in a
     24-unit box. An entry in `events` with a `rashi` is not an
     event: it is the lagna, the rising sign of the muhurta, and it
     is shown as a rashi chakra rather than a photograph.
     ------------------------------------------------------------- */
  var RASHI = {
    mesha:      [{ en: 'Mesha',      kn: 'ಮೇಷ' },
                 'M6.5 9.5C5.5 6 7.5 4 9.5 4.6C11.3 5.2 12 7.6 12 10.5V20M12 10.5C12 7.6 12.7 5.2 14.5 4.6C16.5 4 18.5 6 17.5 9.5'],
    vrishabha:  [{ en: 'Vrishabha',  kn: 'ವೃಷಭ' },
                 'M5 4.5C5.8 7.6 8.6 9.4 12 9.4S18.2 7.6 19 4.5M12 9.4A5 5 0 1 0 12 19.4A5 5 0 1 0 12 9.4Z'],
    mithuna:    [{ en: 'Mithuna',    kn: 'ಮಿಥುನ' },
                 'M5.5 4.8C9.6 6.2 14.4 6.2 18.5 4.8M5.5 19.2C9.6 17.8 14.4 17.8 18.5 19.2M9 5.9V18.1M15 5.9V18.1'],
    karka:      [{ en: 'Karka',      kn: 'ಕಟಕ' },
                 'M18.5 9C17 6.2 13.6 5 10 6M5.5 15C7 17.8 10.4 19 14 18M10 8.6A2.4 2.4 0 1 1 5.2 8.6A2.4 2.4 0 1 1 10 8.6ZM18.8 15.4A2.4 2.4 0 1 1 14 15.4A2.4 2.4 0 1 1 18.8 15.4Z'],
    simha:      [{ en: 'Simha',      kn: 'ಸಿಂಹ' },
                 'M8.4 18.6A2.4 2.4 0 1 1 10.4 15.2C10.4 12.2 9 10.6 9 8.2A3.6 3.6 0 0 1 16.2 8.2C16.2 11.8 13.4 13.8 13.4 16.8A1.8 1.8 0 0 0 17 17.4'],
    kanya:      [{ en: 'Kanya',      kn: 'ಕನ್ಯಾ' },
                 'M5 7.5V18M5 9.6C5 7 8.6 7 8.6 9.6V18M8.6 9.6C8.6 7 12.2 7 12.2 9.6V16.4C12.2 19 15 19.6 16.6 17.6M12.2 13.4C13.6 10.6 18 10.4 18 13.2C18 15.6 15.4 18.4 12.6 20'],
    tula:       [{ en: 'Tula',       kn: 'ತುಲಾ' },
                 'M4.5 19.5H19.5M4.5 15.5H8.6A3.8 3.8 0 1 1 15.4 15.5H19.5'],
    vrishchika: [{ en: 'Vrishchika', kn: 'ವೃಶ್ಚಿಕ' },
                 'M4 7.5V18M4 9.6C4 7 7.4 7 7.4 9.6V18M7.4 9.6C7.4 7 10.8 7 10.8 9.6V18M10.8 9.6C10.8 7 14.2 7 14.2 9.6V17C14.2 18.6 15.2 19 16.6 19H19.4M17.6 17.2L19.6 19L17.6 20.8'],
    dhanu:      [{ en: 'Dhanu',      kn: 'ಧನು' },
                 'M5 19L19 5M12 5H19V12M7.6 11.6L12.4 16.4'],
    makara:     [{ en: 'Makara',     kn: 'ಮಕರ' },
                 'M4.5 6.5L7.2 15.5L9.9 6.5L12.2 14.6C12.8 17.6 14.6 19.2 16.4 19.2A2.6 2.6 0 1 0 13.8 16.6C13.8 18.8 12.4 20 10.8 20'],
    kumbha:     [{ en: 'Kumbha',     kn: 'ಕುಂಭ' },
                 'M4 10.2L7 7.7L10 10.2L13 7.7L16 10.2L19 7.7M4 16.3L7 13.8L10 16.3L13 13.8L16 16.3L19 13.8'],
    meena:      [{ en: 'Meena',      kn: 'ಮೀನ' },
                 'M6.5 4.5C10.2 8.4 10.2 15.6 6.5 19.5M17.5 4.5C13.8 8.4 13.8 15.6 17.5 19.5M5.5 12H18.5']
  };
  var RASHI_ORDER = ['mesha', 'vrishabha', 'mithuna', 'karka', 'simha', 'kanya',
                     'tula', 'vrishchika', 'dhanu', 'makara', 'kumbha', 'meena'];

  /* The chakra: twelve sectors in a band round the edge, each with
     its sign, and the lagna's own sector picked out in gold; the
     lagna's sign drawn large at the centre. The band turns; when
     the blossom reaches it, it turns the lagna round to the top and
     the sector lights, while the sign at the centre is drawn in. */
  function chakra(key) {
    var at = RASHI_ORDER.indexOf(key);
    var parts = '';
    function pt(r, deg) {
      var a = deg * Math.PI / 180;
      return (50 + Math.sin(a) * r).toFixed(2) + ' ' + (50 - Math.cos(a) * r).toFixed(2);
    }
    /* the lit sector, drawn round the lagna's place on the band */
    var s0 = at * 30 - 15, s1 = at * 30 + 15;
    var sector = 'M' + pt(35, s0) + 'L' + pt(47, s0) +
                 'A47 47 0 0 1 ' + pt(47, s1) + 'L' + pt(35, s1) +
                 'A35 35 0 0 0 ' + pt(35, s0) + 'Z';
    for (var k = 0; k < 12; k++) {
      var c = pt(41, k * 30).split(' ');
      parts += '<line class="rashi__tick" x1="' + pt(35, k * 30 + 15).split(' ')[0] +
               '" y1="' + pt(35, k * 30 + 15).split(' ')[1] +
               '" x2="' + pt(47, k * 30 + 15).split(' ')[0] +
               '" y2="' + pt(47, k * 30 + 15).split(' ')[1] + '"/>' +
               '<path class="rashi__mini' + (k === at ? ' is-lagna' : '') + '" d="' + RASHI[RASHI_ORDER[k]][1] + '" ' +
               'transform="translate(' + c[0] + ' ' + c[1] + ') rotate(' + (k * 30) + ') scale(.3) translate(-12 -12)"/>';
    }
    return '' +
      '<svg class="rashi" viewBox="0 0 100 100" style="--lagna:' + (at * -30) + 'deg" ' +
           'aria-hidden="true" focusable="false">' +
        '<circle class="rashi__glow" cx="50" cy="50" r="30"/>' +
        '<g class="rashi__wheel">' +
          '<path class="rashi__sector" d="' + sector + '"/>' +
          '<circle class="rashi__ring" cx="50" cy="50" r="47"/>' +
          '<circle class="rashi__ring" cx="50" cy="50" r="35"/>' +
          parts +
        '</g>' +
        '<path class="rashi__sign" pathLength="1" d="' + RASHI[key][1] + '" ' +
              'transform="translate(50 50) scale(1.45) translate(-12 -12)"/>' +
      '</svg>';
  }

  /* Size observers are kept here rather than in a local variable.
     An observer nothing refers to any more may be collected, and a
     collected one stops reporting — the cord would then be measured
     a few times and never again. */
  var WATCHERS = [];

  /* The blossom that rides the cord: six petals and a lit centre,
     small enough to read as a mark rather than a picture. */
  function blossom() {
    var petals = '';
    for (var i = 0; i < 6; i++) {
      petals += '<ellipse cx="13" cy="6.2" rx="3.1" ry="5.2" ' +
                'transform="rotate(' + (i * 60) + ' 13 13)"/>';
    }
    return '' +
      '<span class="garland__mark" aria-hidden="true">' +
        '<svg viewBox="0 0 26 26" focusable="false">' +
          '<g fill="rgba(253, 247, 236, .96)" stroke="var(--gold-lit)" ' +
             'stroke-width=".9" stroke-linejoin="round">' + petals + '</g>' +
          '<circle cx="13" cy="13" r="2.7" fill="var(--gold-lit)"/>' +
          '<circle cx="13" cy="13" r="4.6" fill="none" ' +
                  'stroke="var(--gold-pale)" stroke-width=".8"/>' +
        '</svg>' +
      '</span>';
  }

  /* The vine that links one ceremony to the next. Two pairs of
     leaves either side of the cord and a bead set on it — the
     middle is left open, so the gold fill runs straight through as
     it is drawn.

     It is not there until the blossom reaches it. Then it grows:
     the bead is set, the four stems run out from the cord, and the
     leaves open at their tips — the upper pair a beat before the
     lower, because the blossom is travelling down. Each leaf sits
     in a group of its own, so the opening scale never has to fight
     the leaf's own lean. */
  function vine() {
    function leaf(cx, cy, deg, i) {
      return '<g class="vine__leaf" style="--i:' + i + '">' +
               '<ellipse cx="' + cx + '" cy="' + cy + '" rx="8.4" ry="3.4" ' +
                 'transform="rotate(' + deg + ' ' + cx + ' ' + cy + ')"/>' +
             '</g>';
    }
    function stem(x2, y2, i) {
      return '<path class="vine__stem" style="--i:' + i + '" pathLength="1" ' +
             'd="M20 33 C20 ' + ((33 + y2) / 2).toFixed(1) + ' ' +
             ((20 + x2) / 2).toFixed(1) + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>';
    }
    return '' +
      '<span class="garland__link" aria-hidden="true">' +
        '<svg viewBox="0 0 40 66" focusable="false">' +
          '<g fill="none" stroke="currentColor" stroke-width=".8" ' +
             'stroke-linecap="round" opacity=".7">' +
            stem(11, 17, 0) + stem(29, 17, 0) + stem(12, 49, 1) + stem(28, 49, 1) +
          '</g>' +
          '<g fill="currentColor" fill-opacity=".20" stroke="currentColor" ' +
             'stroke-width=".8">' +
            leaf(11, 17, -26, 0) + leaf(29, 17, 26, 0) +
            leaf(12, 49, 26, 1)  + leaf(28, 49, -26, 1) +
          '</g>' +
          '<g class="vine__bead">' +
            '<rect x="17.2" y="30.2" width="5.6" height="5.6" ' +
                  'transform="rotate(45 20 33)" fill="var(--champagne)" ' +
                  'stroke="currentColor" stroke-width=".9"/>' +
          '</g>' +
        '</svg>' +
      '</span>';
  }

  /* ---- the jasmine string ----
     When the blossom reaches a ceremony a string of jasmine is tied
     round its medallion. It starts at the knot, where the medallion
     meets the cord, and is wound both ways round at once until the
     two ends meet on the far side: a thread drawn first, and the
     buds set along it in the order the thread reaches them.

     `knot` is the angle the knot sits at — 0 for a medallion whose
     cord is to its right, 180 for one whose cord is to its left. */
  var RING_C = 70;      /* centre of the 140-unit box              */
  var RING_R = 62;      /* the thread, just outside the frame ring  */
  var BUDS   = 30;

  function jasmine(knot) {
    var a0 = knot * Math.PI / 180;
    function pt(a) {
      return (RING_C + RING_R * Math.cos(a)).toFixed(2) + ' ' +
             (RING_C + RING_R * Math.sin(a)).toFixed(2);
    }
    var from = pt(a0);
    var to   = pt(a0 + Math.PI);
    var half = 'A' + RING_R + ' ' + RING_R + ' 0 0 ';

    var buds = '';
    for (var b = 0; b < BUDS; b++) {
      var off = (b + 0.5) * 2 * Math.PI / BUDS;
      var a = a0 + off;
      /* how far round from the knot, either way — the order the
         thread reaches it */
      var reach = off <= Math.PI ? off / Math.PI : (2 * Math.PI - off) / Math.PI;
      var x = RING_C + RING_R * Math.cos(a);
      var y = RING_C + RING_R * Math.sin(a);
      buds += '<g class="rite__bud" style="--k:' + reach.toFixed(3) + '">' +
                '<ellipse cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" ' +
                  'rx="2.7" ry="1.55" ' +
                  'transform="rotate(' + ((a * 180 / Math.PI) + 90).toFixed(1) + ' ' +
                    x.toFixed(2) + ' ' + y.toFixed(2) + ')"/>' +
              '</g>';
    }

    return '' +
      '<svg class="rite__ring" viewBox="0 0 140 140" aria-hidden="true" focusable="false">' +
        '<path class="rite__thread" pathLength="1" d="M' + from + half + '1 ' + to + '"/>' +
        '<path class="rite__thread" pathLength="1" d="M' + from + half + '0 ' + to + '"/>' +
        buds +
      '</svg>';
  }

  /* Petals in the air. Fixed places, fixed speeds: a section that
     rearranges itself on every visit is not the same page twice. */
  function petals() {
    var shape = '<svg viewBox="0 0 14 20" focusable="false">' +
                  '<path d="M7 .8C2.6 5.4.8 9.6.8 12.8c0 3.4 2.8 6.4 6.2 6.4' +
                        's6.2-3 6.2-6.4C13.2 9.6 11.4 5.4 7 .8Z" ' +
                        'fill="currentColor" fill-opacity=".24" ' +
                        'stroke="currentColor" stroke-width=".8"/>' +
                  '<path d="M7 4.4c-1.2 4-1.3 8.6-.4 12.6" fill="none" ' +
                        'stroke="currentColor" stroke-width=".7" ' +
                        'stroke-linecap="round"/>' +
                '</svg>';
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<span class="petal petal--' + i + '" aria-hidden="true">' +
               shape +
             '</span>';
    }
    return out;
  }

  RH.components.events = function (mount) {
    var list = RH.config.events || [];
    var n = list.length;
    if (!n) return;

    var blocks = list.map(function (ev, i) {
      var side = (i % 2 === 0) ? 'left' : 'right';
      /* Each entry arrives from the side it hangs on. */
      var lean = (side === 'left') ? '1' : '-1';

      var isRashi = !!(ev.rashi && RASHI[ev.rashi]);

      var medal = isRashi
        ? '<span class="rite__medal rite__medal--rashi" data-rv="seal">' +
            '<span class="rite__halo" aria-hidden="true"></span>' +
            jasmine(side === 'left' ? 0 : 180) +
            '<span class="rite__frame">' +
              '<span class="rite__disc rite__disc--rashi">' +
                chakra(ev.rashi) +
                '<span class="glare" aria-hidden="true"></span>' +
              '</span>' +
            '</span>' +
          '</span>'
        : ev.preview
        ? '<span class="rite__medal" data-rv="seal">' +
            '<span class="rite__halo" aria-hidden="true"></span>' +
            jasmine(side === 'left' ? 0 : 180) +
            '<span class="rite__frame">' +
              '<span class="rite__disc">' +
                '<img src="' + RH.esc(ev.preview) + '" alt="" ' +
                     'loading="lazy" decoding="async">' +
                '<span class="glare" aria-hidden="true"></span>' +
              '</span>' +
            '</span>' +
          '</span>'
        : '<span class="rite__medal rite__medal--plain" data-rv="seal">' +
            '<span class="rite__frame"></span>' +
          '</span>';

      function fact(key, field) {
        return '<div class="rite__fact">' +
                 '<dt class="rite__key" data-caps data-i18n="events.' + key + '"></dt>' +
                 '<dd class="rite__val" data-f="' + field + '"></dd>' +
               '</div>';
      }

      return '' +
        '<article class="rite rite--' + side + (isRashi ? ' rite--rashi' : '') + '" data-seq="120">' +
          medal +
          '<span class="rite__tie" aria-hidden="true"></span>' +
          '<div class="rite__body">' +
            '<span class="rite__num" data-rv="soft" aria-hidden="true">' +
              (ROMAN[i] || (i + 1)) +
            '</span>' +
            '<h3 class="rite__name" data-caps data-rv="drift" ' +
                'style="--rv-x:' + lean + '"></h3>' +
            '<span class="rite__rule" data-rv="line" aria-hidden="true"></span>' +
            '<dl class="rite__facts" data-rv="drift" style="--rv-x:' + lean + '">' +
              /* the lagna is not an event: it has a rashi, and no
                 date, time or place of its own */
              (isRashi
                ? fact('rashi', 'rashi')
                : fact('date', 'date') + fact('time', 'time') + fact('venue', 'venue')) +
            '</dl>' +
            '<p class="rite__note" data-rv="soft" data-f="note"></p>' +
            /* Add to calendar: two quiet links, because no one link
               works on every phone (js/lib/calendar.js). */
            (RH.calendar && RH.calendar.has(ev)
              ? '<p class="rite__cal" data-rv="soft">' +
                  '<span class="rite__cal-lb" data-caps data-i18n="events.addCal"></span>' +
                  '<a class="rite__cal-a" data-cal="google" target="_blank" rel="noopener noreferrer" ' +
                     'data-i18n="events.calGoogle"></a>' +
                  '<span class="rite__cal-sep" aria-hidden="true">·</span>' +
                  '<a class="rite__cal-a" data-cal="ics" ' +
                     'data-i18n="events.calApple"></a>' +
                '</p>'
              : '') +
          '</div>' +
        '</article>';
    });

    /* A vine grows between one ceremony and the next, never after
       the last one. */
    var strand = blocks.join(vine());

    var view = RH.el(
      '<section class="plate" id="events">' +
        RH.plateArt(34) +
        '<div class="plate__inner plate__inner--wide">' +
          '<p class="t-kicker" data-caps data-rv="soft" data-i18n="events.kicker"></p>' +
          '<h2 class="t-title" data-caps data-rv="ink" data-i18n="events.title"></h2>' +
          RH.ornament(true) +
          '<div class="garland">' +
            '<span class="garland__cord" aria-hidden="true">' +
              '<span class="garland__fill"></span>' +
            '</span>' +
            blossom() +
            petals() +
            strand +
          '</div>' +
        '</div>' +
      '</section>'
    );
    mount.appendChild(view);

    var rites  = [].slice.call(view.querySelectorAll('.rite'));
    var medals = rites.map(function (r) { return r.querySelector('.rite__medal'); });

    function paint() {
      list.forEach(function (ev, i) {
        var rite = rites[i];
        if (!rite) return;
        rite.querySelector('.rite__name').textContent = RH.L(ev.name);
        ['date', 'time', 'venue'].forEach(function (k) {
          var f = rite.querySelector('[data-f="' + k + '"]');
          if (f) f.textContent = RH.L(ev[k]);
        });
        var rashi = rite.querySelector('[data-f="rashi"]');
        if (rashi && RASHI[ev.rashi]) rashi.textContent = RH.L(RASHI[ev.rashi][0]);

        var note = rite.querySelector('[data-f="note"]');
        note.textContent = RH.L(ev.note);
        note.classList.toggle('u-hidden', !note.textContent);

        var img = rite.querySelector('.rite__disc img');
        if (img) img.alt = RH.L(ev.name);

        /* The calendar entry is written in the language being read,
           so both links are rebuilt on every language change. */
        var g = rite.querySelector('[data-cal="google"]');
        var f = rite.querySelector('[data-cal="ics"]');
        if (g) {
          g.href = RH.calendar.google(ev);
          g.setAttribute('aria-label', RH.t('events.addCal') + ' — ' + RH.L(ev.name) + ' — ' + RH.t('events.calGoogle'));
        }
        if (f) {
          f.href = RH.calendar.ics(ev);
          f.setAttribute('download', RH.calendar.filename(ev));
          f.setAttribute('aria-label', RH.t('events.addCal') + ' — ' + RH.L(ev.name) + ' — ' + RH.t('events.calApple'));
        }
      });
    }

    RH.onLang(paint);
    RH.applyI18n(view);
    paint();

    /* Each medallion gives under a finger, like the photographs. */
    rites.forEach(function (r) {
      var frame = r.querySelector('.rite__medal:not(.rite__medal--plain) .rite__frame');
      if (frame) RH.motion.tilt(frame, { max: 12, perspective: 500 });
    });

    /* The blossom draws a tail of light behind it, as long as the
       guest is scrolling fast — written onto the blossom alone, so
       the rest of the garland is never restyled for it. */
    var mark = view.querySelector('.garland__mark');
    RH.motion.onFrame(function (sv) {
      mark.style.setProperty('--sv', sv.toFixed(3));
    });

    /* -------------------------------------------------------------
       THE GARLAND, DRAWN BY THE SCROLL

       Two things are measured and then never measured again during
       a scroll: where the cord starts and ends (the centres of the
       first and last medallions), and where each ceremony sits
       along it. Per frame the listener writes one custom property
       and, at most, one class. Nothing is read from layout inside
       the frame except the section's own box.
       ------------------------------------------------------------- */
    var garland = view.querySelector('.garland');
    var links   = [].slice.call(view.querySelectorAll('.garland__link'));
    var cordTop = 0;
    var cordH   = 0;
    var at      = [];          /* each ceremony's place along the cord */
    var linkAt  = [];          /* and each vine's                       */
    var live    = -1;
    var ticking = false;

    /* offsetTop is used rather than a rect: the medallions carry a
       reveal transform before they arrive, and a measured rect
       would be the scaled one. */
    function topIn(el, root) {
      var y = 0;
      while (el && el !== root) { y += el.offsetTop; el = el.offsetParent; }
      return y;
    }

    function measure() {
      if (!medals.length) return;
      var first = medals[0];
      var last  = medals[medals.length - 1];
      cordTop = topIn(first, garland) + first.offsetHeight / 2;
      cordH   = topIn(last, garland) + last.offsetHeight / 2 - cordTop;
      garland.style.setProperty('--cord-top', cordTop + 'px');
      garland.style.setProperty('--cord-h', cordH + 'px');

      at = medals.map(function (m) {
        if (cordH <= 0) return 0;
        return (topIn(m, garland) + m.offsetHeight / 2 - cordTop) / cordH;
      });

      /* A vine grows once the blossom has reached its upper leaves,
         so it is already opening as it passes. */
      linkAt = links.map(function (l) {
        if (cordH <= 0) return 0;
        return (topIn(l, garland) + l.offsetHeight * 0.3 - cordTop) / cordH;
      });
    }

    function setLive(i) {
      if (i === live) return;
      if (rites[live]) rites[live].classList.remove('is-live');
      if (rites[i])    rites[i].classList.add('is-live');
      live = i;
    }

    if (RH.calm) {
      /* Reduced motion: the garland is simply already gold, and
         every medallion is left at rest. */
      measure();
      garland.style.setProperty('--p', '1');
      garland.classList.add('is-still');
      if ('ResizeObserver' in window) {
        WATCHERS.push(new ResizeObserver(measure));
        WATCHERS[WATCHERS.length - 1].observe(garland);
      }
      RH.onLang(measure);
      return;
    }

    function frame() {
      ticking = false;
      var r = garland.getBoundingClientRect();
      if (r.height <= 0) return;

      /* The blossom stands where the garland crosses a line held at
         62% of the screen — a little below centre, so a ceremony is
         written just before it is read. */
      var p = (window.innerHeight * 0.62 - r.top) / r.height;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      garland.style.setProperty('--p', p.toFixed(4));

      /* The ceremony the blossom is standing on: the last one it
         has reached, and none until it reaches the first. */
      var i = -1;
      for (var k = 0; k < at.length; k++) {
        if (p >= at[k] - 0.05) i = k;
      }
      setLive(i);

      /* Grown behind the blossom, and taken back in if the guest
         scrolls up past it: the scroll writes the vines exactly as
         it writes the gold. A class that already matches is not
         touched, so a still frame changes nothing. */
      for (var v = 0; v < links.length; v++) {
        links[v].classList.toggle('is-grown', p >= linkAt[v]);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }

    measure();
    frame();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });
    /* Kannada changes every line count in the section, and with it
       the length of the cord the blossom travels down. */
    RH.onLang(function () { measure(); onScroll(); });
    /* Everything that can change the length of the cord after the
       first measurement does so by changing the height of the
       garland: a lazy medallion arriving, the wedding fonts
       swapping in, a ceremony's venue wrapping to another line.
       One observer catches all of them. */
    if ('ResizeObserver' in window) {
      WATCHERS.push(new ResizeObserver(function () { measure(); onScroll(); }));
      WATCHERS[WATCHERS.length - 1].observe(garland);
    } else {
      view.querySelectorAll('.rite__disc img').forEach(function (img) {
        img.addEventListener('load', function () { measure(); onScroll(); });
      });
    }
    /* The wedding fonts arrive after the first paint and change
       every line's height with them. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { measure(); onScroll(); });
    }
  };
})();
