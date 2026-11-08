/* =============================================================
   LANGUAGE SWITCH

   A single keyline capsule with a gold field that slides between
   the halves, rather than buttons that light up. Both words stay
   readable at all times: the one being left behind fades to the
   ink colour, it does not disappear. The halves are equal so the
   field lands exactly, whatever the words measure.

   THE LANGUAGES COME FROM `languages` IN wedding.config.js (via
   RH.langs in state.js), NOT FROM THIS FILE:

     languages: ["en", "kn"]        two halves
     languages: ["en", "ta", "te"]  three halves
     languages: ["en"]              ONE language — no switch at all.
                                    Nothing is drawn, nothing is
                                    reserved, and the page is marked
                                    <html class="is-monolingual">.

   The capsule never turns around: it is a control, not prose, so
   each language keeps its own place and its own script's face
   whichever language the page is in (see css/languages.css).

   Swaps every string in place. Nothing re-mounts, so the gate,
   the date reveal and the running countdown keep their state.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  /* What each language calls itself, for the label on its half. */
  var NATIVE = {
    en: 'English', kn: 'ಕನ್ನಡ', ta: 'தமிழ்', te: 'తెలుగు', ml: 'മലയാളം',
    hi: 'हिन्दी', mr: 'मराठी', bn: 'বাংলা', gu: 'ગુજરાતી', pa: 'ਪੰਜਾਬੀ', ur: 'اردو'
  };

  /* Fixed, not translated: a half of the capsule always names the
     language in that language, so it reads the same wherever the
     guest is. The dictionary is only asked about a code this table
     has never heard of. */
  function label(code) {
    if (NATIVE[code]) return NATIVE[code];
    var key = 'lang.' + code;
    var t = RH.t(key);
    return t !== key ? t : code.toUpperCase();
  }

  RH.components.languageSwitch = function (mount) {
    /* One language: there is nothing to switch, so draw nothing. */
    if (RH.langs.length < 2) {
      mount.style.display = 'none';
      mount.setAttribute('aria-hidden', 'true');
      return;
    }

    var halves = RH.langs.map(function (code) {
      return '<button class="lang__btn" type="button" data-lang="' + RH.esc(code) + '" ' +
                     'lang="' + RH.esc(code) + '">' + RH.esc(label(code)) + '</button>';
    }).join('');

    var box = RH.el(
      '<div class="lang" role="group" data-i18n-attr="aria-label:lang.switch">' +
        /* The field sits under all the labels and is the only thing
           that moves — one composited transform, no repaint. */
        '<span class="lang__field" aria-hidden="true"></span>' +
        halves +
      '</div>'
    );
    /* The field is one half wide, whatever the count. */
    box.style.setProperty('--lang-n', RH.langs.length);
    mount.appendChild(box);

    box.addEventListener('click', function (e) {
      var b = e.target.closest('.lang__btn');
      if (b) RH.setLang(b.getAttribute('data-lang'));
    });

    /* Keeps every instance of the switch in agreement — the dock
       carries one and the gate carries another. */
    function paint() {
      var at = RH.langs.indexOf(RH.lang());
      document.querySelectorAll('.lang').forEach(function (el) {
        el.style.setProperty('--lang-at', at < 0 ? 0 : at);
      });
      document.querySelectorAll('.lang__btn').forEach(function (b) {
        b.setAttribute('aria-pressed',
          b.getAttribute('data-lang') === RH.lang() ? 'true' : 'false');
      });
    }

    RH.onLang(paint);
    RH.applyI18n(box);
    paint();
  };
})();
