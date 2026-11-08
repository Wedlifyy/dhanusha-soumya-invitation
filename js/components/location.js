/* =============================================================
   LOCATION — finding your way there.

   Three movements, top to bottom:

   THE SEAL. The venue in a round, the way a place is struck on a
   seal: its photograph at the centre, its name running round it
   in a ring that slowly turns, and outside that a compass bezel —
   ticks and the four quarters — that turns as the page is
   scrolled, as if the guest were turning to face it.

   THE MAP, LIFTED. The live Google map starts lying back on the
   page like a map on a table and stands up to face the guest as
   it is scrolled into view, hinged at its foot. Once it is up, a
   gold pin drops onto the venue with a little bounce, rings of
   light go out from it, and a route draws itself in across the
   map toward it, with a light that keeps travelling the way.
   The map itself is the real one, and fully usable once upright.

   THE WAY OUT. "Open in Google Maps", with a light running round
   its edge, and "Copy address", which puts the address on the
   clipboard and says so.

   Nothing here makes up a location: the pin, the rings and the
   route are drawn over the map's own centre — the place the embed
   was asked for — and the route is a flourish, not directions.
   If no embed URL is set the slot falls back to a static image,
   and failing that to a plainly labelled placeholder.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  /* ---- the compass bezel: 72 ticks, the long ones every 30°, and
     the four quarters lettered ---- */
  function bezel() {
    var ticks = '';
    for (var i = 0; i < 72; i++) {
      if (i % 18 === 0) continue;               /* the quarters are letters */
      var a = i * 5 * Math.PI / 180;
      var major = i % 6 === 0;
      var r0 = major ? 96 : 99, r1 = 104;
      ticks += '<line x1="' + (Math.sin(a) * r0).toFixed(2) + '" y1="' + (-Math.cos(a) * r0).toFixed(2) +
               '" x2="' + (Math.sin(a) * r1).toFixed(2) + '" y2="' + (-Math.cos(a) * r1).toFixed(2) +
               '"' + (major ? ' class="is-major"' : '') + '/>';
    }
    var quarters = [['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(function (q) {
      var a = q[1] * Math.PI / 180;
      return '<text x="' + (Math.sin(a) * 101).toFixed(2) + '" y="' + (-Math.cos(a) * 101).toFixed(2) + '" ' +
             'transform="rotate(' + q[1] + ' ' + (Math.sin(a) * 101).toFixed(2) + ' ' + (-Math.cos(a) * 101).toFixed(2) + ')">' +
             q[0] + '</text>';
    }).join('');
    return '' +
      '<svg class="seal__bezel" viewBox="-118 -118 236 236" aria-hidden="true" focusable="false">' +
        '<circle class="seal__rim" cx="0" cy="0" r="108" pathLength="1"/>' +
        '<g class="seal__ticks">' + ticks + '</g>' +
        '<g class="seal__quarters">' + quarters + '</g>' +
      '</svg>';
  }

  /* ---- the ring of words: the venue's name, round the photograph.
     The circle starts at the left and runs clockwise over the top,
     so the letters stand upright along the outside of it. ---- */
  var WORD_R = 84;
  function words() {
    return '' +
      '<svg class="seal__words" viewBox="-118 -118 236 236" aria-hidden="true" focusable="false">' +
        '<defs>' +
          '<path id="rhSealPath" d="M' + (-WORD_R) + ' 0A' + WORD_R + ' ' + WORD_R + ' 0 1 1 ' + WORD_R +
                ' 0A' + WORD_R + ' ' + WORD_R + ' 0 1 1 ' + (-WORD_R) + ' 0"/>' +
        '</defs>' +
        '<text><textPath href="#rhSealPath" class="seal__text"></textPath></text>' +
      '</svg>';
  }

  /* ---- the pin ---- */
  var PIN = '<svg viewBox="0 0 28 38" aria-hidden="true" focusable="false">' +
              '<defs><linearGradient id="rhPinGold" x1="20%" y1="0%" x2="80%" y2="100%">' +
                '<stop offset="0%" stop-color="#F6DCA6"/><stop offset="45%" stop-color="#C98B33"/>' +
                '<stop offset="100%" stop-color="#8A5716"/></linearGradient></defs>' +
              '<path d="M14 37C14 37 2 22.6 2 13.6A12 12 0 0 1 26 13.6C26 22.6 14 37 14 37Z" ' +
                    'fill="url(#rhPinGold)" stroke="#FFF7E6" stroke-width="1.6"/>' +
              '<circle cx="14" cy="13.6" r="4.6" fill="#FFFBF0"/>' +
              '<circle cx="14" cy="13.6" r="2" fill="#B98336"/>' +
            '</svg>';

  /* ---- the route drawn toward it: in the map's own 16:9 box ---- */
  var ROUTE = 'M10 86C26 82 30 64 48 64S66 56 72 50C75 47 78 46 80 46';
  function route() {
    return '' +
      '<svg class="venue__route" viewBox="0 0 160 90" aria-hidden="true" focusable="false">' +
        '<path class="venue__road venue__road--case" d="' + ROUTE + '" pathLength="1"/>' +
        '<path class="venue__road" d="' + ROUTE + '" pathLength="1"/>' +
        '<circle class="venue__traveller" r="2.4" cx="0" cy="0">' +
          '<animateMotion dur="2.8s" repeatCount="indefinite" begin="indefinite" ' +
                         'calcMode="spline" keyPoints="0;1" keyTimes="0;1" ' +
                         'keySplines=".45 0 .35 1" path="' + ROUTE + '"/>' +
        '</circle>' +
      '</svg>';
  }

  var COPY_ICON = '<svg class="venue__copy-ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
                    '<rect x="5.2" y="5.2" width="8.2" height="8.6" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
                    '<path d="M10.6 3.4A1.4 1.4 0 0 0 9.2 2.2H4A1.6 1.6 0 0 0 2.4 3.8V9.6A1.4 1.4 0 0 0 3.6 11" ' +
                          'fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
                    '<path class="venue__tick" d="M4.6 8.4L7.1 10.9L11.6 5.6" fill="none" stroke="currentColor" ' +
                          'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                  '</svg>';

  RH.components.location = function (mount) {
    var loc = RH.config.location || {};

    /* the seal — the photograph is optional; without one the seal
       keeps its rings round a plain gold centre */
    var seal = '' +
      '<div class="seal" data-rv="seal">' +
        bezel() +
        words() +
        /* the photograph opens full-screen when it is touched — the
           small badge on its edge is what says so */
        (loc.image
          ? '<button class="seal__photo" type="button">' +
              '<img src="' + RH.esc(loc.image) + '" alt="" loading="lazy" decoding="async">' +
              '<span class="glare glare--round" aria-hidden="true"></span>' +
              '<span class="seal__open" aria-hidden="true">' +
                '<svg viewBox="0 0 16 16" focusable="false">' +
                  '<path d="M9.5 2.5h4v4M13.5 2.5L9 7M6.5 13.5h-4v-4M2.5 13.5L7 9" fill="none" ' +
                        'stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>' +
              '</span>' +
            '</button>'
          : '<span class="seal__photo"><span class="seal__blank"></span></span>') +
      '</div>';

    /* the map, with two honest fallbacks */
    var overlay = route() +
      '<span class="venue__ping" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="venue__pin" aria-hidden="true">' + PIN + '<b></b></span>';
    var map;
    if (loc.mapEmbedUrl) {
      map = '<div class="venue__map" data-loading="">' +
              '<iframe src="' + RH.esc(loc.mapEmbedUrl) + '" loading="lazy" ' +
                      'referrerpolicy="no-referrer-when-downgrade" ' +
                      'title="Venue location on Google Maps"></iframe>' +
              overlay +
            '</div>';
    } else if (loc.mapPreview) {
      map = '<div class="venue__map">' +
              '<img src="' + RH.esc(loc.mapPreview) + '" alt="" loading="lazy" decoding="async">' +
              overlay +
            '</div>';
    } else {
      map = '<div class="venue__map">' +
              '<div class="venue__ph">' +
                '<b data-i18n="location.mapPreview"></b>' +
                '<span data-i18n="location.mapPending"></span>' +
              '</div>' +
            '</div>';
    }

    var view = RH.el(
      '<section class="plate" id="location">' +
        RH.plateArt(38) +
        '<div class="plate__inner" data-seq="140">' +
          '<p class="t-kicker" data-caps data-rv="soft" data-i18n="location.kicker"></p>' +
          '<h2 class="t-title" data-caps data-rv="ink" data-i18n="location.title"></h2>' +
          RH.ornament(true) +
          '<div class="venue">' +
            seal +
            '<p class="venue__name" data-caps data-rv="ink"></p>' +
            '<p class="venue__addr" data-rv="soft"></p>' +
            '<p class="venue__label" data-caps data-rv="soft" data-i18n="location.mapLive"></p>' +
            '<div class="venue__stage">' +
              map +
              '<span class="venue__shadow" aria-hidden="true"></span>' +
            '</div>' +
            '<div class="venue__actions" data-rv="soft">' +
              '<a class="venue__btn" target="_blank" rel="noopener noreferrer">' +
                '<span data-i18n="location.maps"></span>' +
                '<svg class="venue__arrow" viewBox="0 0 14 14" fill="none" aria-hidden="true" ' +
                     'focusable="false">' +
                  '<path d="M3.4 10.6L10.6 3.4M5 3.4h5.6V9" stroke="currentColor" ' +
                        'stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>' +
              '</a>' +
              '<button class="venue__copy" type="button">' +
                COPY_ICON + '<span class="venue__copy-label"></span>' +
              '</button>' +
            '</div>' +
            '<p class="venue__note" data-rv="soft" data-i18n="location.mapNote"></p>' +
            '<p class="u-sr" aria-live="polite"></p>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
    mount.appendChild(view);

    var venue  = view.querySelector('.venue__name');
    var addr   = view.querySelector('.venue__addr');
    var btn    = view.querySelector('.venue__btn');
    var note   = view.querySelector('.venue__note');
    var label  = view.querySelector('.venue__label');
    var copy   = view.querySelector('.venue__copy');
    var copyLb = view.querySelector('.venue__copy-label');
    var said   = view.querySelector('.venue [aria-live]');
    var ringTx = view.querySelector('.seal__text');
    var sealEl = view.querySelector('.seal');
    var photo  = view.querySelector('.seal__photo');
    var mapEl  = view.querySelector('.venue__map');

    if (loc.mapsUrl) {
      btn.href = loc.mapsUrl;
    } else {
      btn.classList.add('u-hidden');
      note.classList.add('u-hidden');
    }
    if (!loc.mapEmbedUrl) label.classList.add('u-hidden');

    /* The ring carries the venue's name twice round, and is fitted to
       the exact length of the circle, so it always closes on itself
       whatever the name and whichever the script. */
    function ring() {
      var name = RH.L(loc.venue) || '';
      ringTx.textContent = (name + '  ✦  ' + name + '  ✦  ');
      ringTx.setAttribute('textLength', (2 * Math.PI * WORD_R - 4).toFixed(1));
      ringTx.setAttribute('lengthAdjust', 'spacing');
    }

    var copied = false;
    function copyLabel() {
      copyLb.textContent = RH.t(copied ? 'location.copied' : 'location.copy');
    }

    function paint() {
      venue.textContent = RH.L(loc.venue);
      addr.textContent  = RH.L(loc.address);
      ring();
      copyLabel();

      var frame = view.querySelector('.venue__map iframe');
      if (frame) frame.setAttribute('title', RH.L(loc.venue) + ' — Google Maps');

      var img = view.querySelector('.seal__photo img');
      if (img) {
        img.alt = RH.L(loc.venue);
        photo.setAttribute('aria-label', RH.t('location.view') + ' — ' + RH.L(loc.venue));
      }

      if (mapEl && mapEl.hasAttribute('data-loading')) {
        mapEl.setAttribute('data-loading', RH.t('location.mapLive'));
      }

      /* The button carries the venue in its label, so it still says
         where it goes when read on its own. */
      btn.setAttribute('aria-label', RH.t('location.maps') + ' — ' + RH.L(loc.venue));
    }

    RH.onLang(paint);
    RH.applyI18n(view);
    paint();

    /* ---- copy the address ---- */
    function address() {
      return [RH.L(loc.venue), String(RH.L(loc.address) || '').replace(/\n/g, ', ')]
        .filter(Boolean).join(', ');
    }
    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-100px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }
    var copyTimer = 0;
    copy.addEventListener('click', function () {
      var text = address();
      var done = function () {
        copied = true;
        copy.classList.add('is-copied');
        copyLabel();
        said.textContent = RH.t('location.copied');
        clearTimeout(copyTimer);
        copyTimer = setTimeout(function () {
          copied = false;
          copy.classList.remove('is-copied');
          copyLabel();
        }, 2400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { if (fallbackCopy(text)) done(); });
      } else if (fallbackCopy(text)) {
        done();
      }
    });

    /* ---- depth: the artwork dollies, the bezel turns with the
       scroll, the photograph gives under a finger, and the map
       stands up as it is reached ---- */
    RH.motion.depth(view, [view.querySelector('.plate__art'), sealEl]);
    RH.motion.tilt(photo, { max: 9, perspective: 600 });

    /* the venue, full-screen, opened out of its round */
    var shown = view.querySelector('.seal__photo img');
    if (shown) {
      photo.addEventListener('click', function () {
        RH.viewer.open(loc.image, {
          from: shown,
          round: true,
          alt: RH.L(loc.venue),
          caption: RH.L(loc.venue)
        });
      });
    }
    if (mapEl) RH.motion.depth(mapEl, [mapEl, view.querySelector('.venue__shadow')]);

    /* ---- once the map is up, the pin drops, the rings go out and
       the route is drawn — once ---- */
    var pinned = false;
    function pin() {
      if (pinned || !mapEl) return;
      pinned = true;
      mapEl.classList.add('is-pinned');
      var am = mapEl.querySelector('animateMotion');
      if (am && am.beginElement && !RH.calm) {
        setTimeout(function () {
          try { am.beginElement(); mapEl.classList.add('is-routed'); } catch (e) { /* no SMIL */ }
        }, 1500);
      }
    }
    /* Asked every frame the engine draws, AFTER it has written the
       map's place onto it — read back as a style, not a layout —
       so the pin drops on the frame the map is actually up. */
    function watch() {
      if (pinned) return;
      var pd = parseFloat(mapEl.style.getPropertyValue('--pd'));
      if (!isNaN(pd) && pd < 0.16) pin();
    }
    if (mapEl) {
      if (RH.calm) pin();
      else RH.motion.onFrame(watch);
    }
  };
})();
