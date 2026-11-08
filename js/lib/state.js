/* =============================================================
   RagaHru — STATE + I18N
   One language switch drives every string on the page.
   ============================================================= */

(function () {
  'use strict';

  var RH = (window.RH = window.RH || {});
  RH.components = {};

  var CFG  = window.WEDDING || {};
  var DICT = window.CONTENT || { en: {}, kn: {} };
  var KEY  = 'ragahru.lang';

  RH.config = CFG;

  /* The languages this invitation offers, in the order the switch shows
     them. `languages` in wedding.config.js decides: ["en", "kn"] is a
     two-language invitation, ["en"] is English only and no switch is
     drawn. A pack that is in the dictionary but not in that list is
     simply never offered. */
  RH.langs = (function () {
    var want = Array.isArray(CFG.languages) && CFG.languages.length
      ? CFG.languages : Object.keys(DICT);
    var ok = want.filter(function (c) { return DICT[c]; });
    return ok.length ? ok : ['en'];
  })();

  /* ---- session persistence (never fatal) ---- */
  function readStore() {
    try { return sessionStorage.getItem(KEY); } catch (e) { return null; }
  }
  function writeStore(v) {
    try { sessionStorage.setItem(KEY, v); } catch (e) { /* private mode */ }
  }

  var lang = readStore() || CFG.defaultLang || RH.langs[0];
  if (RH.langs.indexOf(lang) < 0) lang = RH.langs[0];

  var listeners = [];

  /* ---- t(): a UI string from the dictionary ---- */
  RH.t = function (key) {
    var pack = DICT[lang] || {};
    if (pack[key] != null) return pack[key];
    if (DICT.en && DICT.en[key] != null) return DICT.en[key];
    return key;
  };

  /* ---- L(): a bilingual value from wedding.config.js ----
     Accepts { en, kn } or a plain string.                    */
  RH.L = function (val) {
    if (val == null) return '';
    if (typeof val === 'object' && !Array.isArray(val)) {
      if (val[lang] != null) return val[lang];
      if (val.en != null) return val.en;
      return '';
    }
    return String(val);
  };

  RH.lang = function () { return lang; };

  RH.onLang = function (fn) {
    listeners.push(fn);
    return fn;
  };


  /* The one place that decides how the document reads: <html lang>, a
     class per language (lang-kn, lang-ta ...) for the stylesheets to key
     their type on, and is-monolingual when there is nothing to switch.
     A pack may say "html.like": "kn" to be set with Kannada's spacing
     and line heights — right for any Indic script — while css/languages.css
     still gives it its own font. */
  var likeClass = '';
  function applyDocumentLanguage() {
    var el = document.documentElement;
    var like = RH.t('html.like');
    if (like === 'html.like') like = '';
    if (likeClass) el.classList.remove('lang-' + likeClass);
    el.lang = RH.t('html.lang');
    for (var i = 0; i < RH.langs.length; i++) {
      el.classList.toggle('lang-' + RH.langs[i], RH.langs[i] === lang);
    }
    likeClass = (like && like !== lang) ? like : '';
    if (likeClass) el.classList.add('lang-' + likeClass);
    el.classList.toggle('is-monolingual', RH.langs.length < 2);
  }

  RH.setLang = function (next) {
    if (RH.langs.indexOf(next) < 0 || next === lang) return;
    lang = next;
    writeStore(next);
    applyDocumentLanguage();
    document.title = RH.t('doc.title');
    RH.applyI18n(document);
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](lang); } catch (e) { /* one bad listener must not stop the rest */ }
    }
  };

  /* ---- applyI18n(): fills every data-i18n node ----
     data-i18n="key"                      -> textContent
     data-i18n-attr="placeholder:key,..." -> attributes       */
  RH.applyI18n = function (root) {
    root = root || document;

    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = RH.t(el.getAttribute('data-i18n'));
    });

    root.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length === 2) {
          el.setAttribute(bits[0].trim(), RH.t(bits[1].trim()));
        }
      });
    });
  };

  /* ---- small helpers ---- */
  RH.el = function (html) {
    var tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  };

  RH.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /* Every plate shares the same artwork, cropped a little
     differently so four screens never feel like one repeat. */
  RH.plateArt = function (yPercent) {
    return '' +
      '<div class="plate__art" aria-hidden="true">' +
        '<img class="plate__img" src="' + RH.esc(CFG.media.plate) + '" alt="" ' +
             'loading="lazy" decoding="async" style="--plate-y:' + (yPercent || 28) + '%">' +
        '<div class="plate__scrim"></div>' +
      '</div>';
  };

  /* A hand that taps, shown for three seconds beside a control that
     needs a touch before anything happens. It is a hint, not a
     control: it never takes a pointer event of its own. */
  RH.tapHint = function () {
    return '' +
      '<span class="tap-hint" aria-hidden="true">' +
        '<span class="tap-hint__ring"></span>' +
        '<span class="tap-hint__ring tap-hint__ring--2"></span>' +
        '<svg class="tap-hint__hand" viewBox="0 0 32 34" fill="none" ' +
             'xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M16 11V21C16 22.1 15.1 23 14 23C12.9 23 12 22.1 12 21V15' +
                  'C12 14.2 11.3 13.5 10.5 13.5C9.7 13.5 9 14.2 9 15V22.5' +
                  'C9 26.6 12.4 30 16.5 30C20.6 30 24 26.6 24 22.5V18' +
                  'C24 17.2 23.3 16.5 22.5 16.5C21.7 16.5 21 17.2 21 18V19.5" ' +
                'stroke="currentColor" stroke-width="1.5" ' +
                'stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</span>';
  };

  /* Runs a tap hint for its three seconds, then puts it away. Any
     touch of the control retires it early — once a guest knows, the
     hint has nothing left to say. Pass a delay below zero to hold it
     back and call show() yourself when the control is on screen. */
  RH.playTapHint = function (hint, control, delay) {
    if (!hint) return;

    var shown = false;
    var timer = null;

    function retire() {
      if (timer) { clearTimeout(timer); timer = null; }
      hint.classList.remove('is-live');
      hint.classList.add('is-done');
      if (control) control.removeEventListener('click', retire);
    }

    function show() {
      if (shown) return;
      shown = true;
      hint.classList.add('is-live');
      timer = setTimeout(retire, 3000);
    }

    if (control) control.addEventListener('click', retire);
    if (!(delay < 0)) setTimeout(show, delay || 0);

    return { show: show, retire: retire };
  };

  /* -------------------------------------------------------------
     THE JEWEL HEART

     Not an outline in a circle: a piece of wedding jewellery. A
     heart cut in gold, a second line engraved a hair inside it,
     six seed pearls set along that line, and a faceted stone at
     the centre. A band of light lies across the metal and is
     drawn through it when the piece is touched.

     Two of these are on the page at once — the one that opens the
     invitation and the one that carries the music — so every
     gradient, clip and filter is given the caller's own id. Ids
     are document-wide, and the opening jewel is removed from the
     document once it has been used: a shared id would take the
     other one's gold with it.

     opts.id     required, unique per instance
     opts.motif  'note' engraves a music note in the stone;
                 anything else leaves the stone plain
     opts.cls    extra class on the root <svg>
     ------------------------------------------------------------- */
  var JEWEL_OUTER =
    'M24 41.2C24 41.2 4.6 28.6 4.6 16.4C4.6 9.9 9.8 5.2 15.8 5.2' +
    'C19.7 5.2 22.7 7.7 24 11.1C25.3 7.7 28.3 5.2 32.2 5.2' +
    'C38.2 5.2 43.4 9.9 43.4 16.4C43.4 28.6 24 41.2 24 41.2Z';

  var JEWEL_INNER =
    'M24 36.2C24 36.2 9.2 26.5 9.2 17C9.2 12.4 12.9 9.2 16.9 9.2' +
    'C19.8 9.2 22.9 11.2 24 14C25.1 11.2 28.2 9.2 31.1 9.2' +
    'C35.1 9.2 38.8 12.4 38.8 17C38.8 26.5 24 36.2 24 36.2Z';

  /* Fixed, never random: a setting that re-arranges itself is not
     the same piece of jewellery twice. */
  var PEARLS = [[16.9, 11.6], [31.1, 11.6], [11.4, 18.2],
                [36.6, 18.2], [17.6, 29.4], [30.4, 29.4]];

  RH.jewel = function (opts) {
    opts = opts || {};
    var id = 'jw-' + (opts.id || 'a');
    var gem = 'url(#' + id + '-gem)';

    var pearls = '';
    for (var i = 0; i < PEARLS.length; i++) {
      pearls += '<circle cx="' + PEARLS[i][0] + '" cy="' + PEARLS[i][1] + '" r="1.15"/>';
    }

    /* Eight facets off the table, so the stone catches the light
       from wherever it is read. */
    var facets = '';
    for (var f = 0; f < 8; f++) {
      var a = (f * 45 + 22.5) * Math.PI / 180;
      facets += '<line x1="' + (24 + Math.cos(a) * 3.05).toFixed(2) +
                     '" y1="' + (19.6 + Math.sin(a) * 3.05).toFixed(2) +
                     '" x2="' + (24 + Math.cos(a) * 6).toFixed(2) +
                     '" y2="' + (19.6 + Math.sin(a) * 6).toFixed(2) + '"/>';
    }

    /* The smallest legible note: one head, one stem, one flag.
       Engraved into the stone rather than set beside it, so the
       music control is still a piece of jewellery. */
    var note = opts.motif === 'note'
      ? '<g class="jewel__note">' +
          '<path d="M23.4 21.4V16.6C24.9 16.8 26.1 17.6 26 18.9" fill="none" ' +
                'stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<circle cx="22.3" cy="21.5" r="1.25"/>' +
        '</g>'
      : '';

    return '' +
      '<svg class="jewel__art ' + (opts.cls || '') + '" viewBox="0 0 48 46" ' +
           'aria-hidden="true" focusable="false">' +
        '<defs>' +
          /* The metal: lit from the upper left, deepening to the
             right, the way a cast piece sits under one lamp. */
          '<linearGradient id="' + id + '-metal" x1="12%" y1="4%" x2="86%" y2="96%">' +
            '<stop offset="0%"   stop-color="#F6DCA6"/>' +
            '<stop offset="34%"  stop-color="#D9A45C"/>' +
            '<stop offset="100%" stop-color="#8A5716"/>' +
          '</linearGradient>' +
          '<radialGradient id="' + id + '-gem" cx="38%" cy="32%" r="72%">' +
            '<stop offset="0%"   stop-color="#FFF3D6"/>' +
            '<stop offset="26%"  stop-color="#F0C878"/>' +
            '<stop offset="62%"  stop-color="#C98B33"/>' +
            '<stop offset="100%" stop-color="#8C5714"/>' +
          '</radialGradient>' +
          '<linearGradient id="' + id + '-sheen" x1="0%" y1="0%" x2="100%" y2="0%">' +
            '<stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0"/>' +
            '<stop offset="46%"  stop-color="#FFFCF2" stop-opacity=".72"/>' +
            '<stop offset="54%"  stop-color="#FFFCF2" stop-opacity=".72"/>' +
            '<stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>' +
          '</linearGradient>' +
          '<clipPath id="' + id + '-clip"><path d="' + JEWEL_OUTER + '"/></clipPath>' +
        '</defs>' +

        /* the body — everything that compresses under a finger */
        '<g class="jewel__body">' +
          '<path class="jewel__cast" d="' + JEWEL_OUTER + '"/>' +
          '<path class="jewel__rim"  d="' + JEWEL_OUTER + '" fill="none" ' +
                'stroke="url(#' + id + '-metal)" stroke-width="2" ' +
                'stroke-linejoin="round"/>' +
          '<path class="jewel__line" d="' + JEWEL_INNER + '" fill="none" ' +
                'stroke-width=".7" stroke-linejoin="round"/>' +
          '<g class="jewel__pearls">' + pearls + '</g>' +

          '<g class="jewel__stone">' +
            '<circle cx="24" cy="19.6" r="6.6" class="jewel__collet"/>' +
            '<circle cx="24" cy="19.6" r="6" fill="' + gem + '"/>' +
            '<g class="jewel__facets" fill="none" stroke-width=".45">' + facets + '</g>' +
            '<circle cx="24" cy="19.6" r="3.05" class="jewel__table"/>' +
            '<ellipse cx="21.9" cy="17.5" rx="1.5" ry="1" class="jewel__spark" ' +
                     'transform="rotate(-34 21.9 17.5)"/>' +
            note +
          '</g>' +

          /* the light that is drawn through the metal on a touch */
          '<g clip-path="url(#' + id + '-clip)">' +
            '<rect class="jewel__sheen" x="-30" y="-14" width="22" height="74" ' +
                  'fill="url(#' + id + '-sheen)" transform="rotate(18 -19 23)"/>' +
          '</g>' +
        '</g>' +
      '</svg>';
  };

  /* The rule draws outward from its centre before the heading lands. */
  RH.ornament = function (tight, dark) {
    return '<div class="orn' + (tight ? ' orn--tight' : '') +
              (dark ? ' orn--dark' : '') + '" data-rv="line" aria-hidden="true">' +
             '<span class="orn__dot"></span>' +
           '</div>';
  };

  /* Prefers-reduced-motion, checked once and shared. */
  RH.calm = (function () {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  })();

  /* Initial language paint */
  document.documentElement.lang = RH.t('html.lang');
  applyDocumentLanguage();
})();
