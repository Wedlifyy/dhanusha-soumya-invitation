/* =============================================================
   RagaHru — LINK PREVIEW, AT RUNTIME

   index.html ships the real Open Graph and Twitter tags as plain
   text, because the crawlers behind WhatsApp, Facebook, Telegram
   and iMessage do not run JavaScript. Those tags are written from
   `social` in wedding.config.js by tools/sync-meta.mjs.

   THIS FILE IS THE OTHER HALF OF THAT ARRANGEMENT. It writes the
   SAME values, from the SAME place in the config, over the tags
   already in the document — once at boot and again on every
   language change. That is worth doing for three things a static
   tag cannot cover:

     · the browser tab and the task switcher, which follow the
       language a guest is actually reading in;
     · navigator.share(), which reads document.title — the phone's
       own share sheet, the way most guests will pass this on;
     · the installed PWA's title.

   It also means the config is the ONLY place a name, a line of
   invitation or an image path is written. If the two halves ever
   disagree, the config is right and index.html is stale: run
   node tools/sync-meta.mjs <this folder>.

   Nothing here can fail the page. A missing `social` block, a
   missing tag, an unparseable url — each one leaves whatever was
   already in the document untouched.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  /* Facebook wants a full locale, not a language tag. */
  var LOCALES = {
    en: 'en_IN', kn: 'kn_IN', ta: 'ta_IN', te: 'te_IN', ml: 'ml_IN',
    hi: 'hi_IN', mr: 'mr_IN', bn: 'bn_IN', gu: 'gu_IN', pa: 'pa_IN', ur: 'ur_IN'
  };

  /* Which tags are managed, how each is addressed, and where its
     value comes from. `kind` is what to fill in:

       text   the value itself
       url    the value resolved to an absolute URL

     Everything is driven off this table, so adding a tag is one
     line here and one line in tools/sync-meta.mjs — never a
     scattered set of querySelectors. */
  var TAGS = [
    { sel: 'meta[name="description"]',              from: 'description', kind: 'text' },
    { sel: 'meta[name="apple-mobile-web-app-title"]', from: 'title',     kind: 'text' },

    { sel: 'meta[property="og:site_name"]',         from: 'studio',      kind: 'text' },
    { sel: 'meta[property="og:locale"]',            from: 'locale',      kind: 'text' },
    { sel: 'meta[property="og:url"]',               from: 'url',         kind: 'url'  },
    { sel: 'meta[property="og:title"]',             from: 'title',       kind: 'text' },
    { sel: 'meta[property="og:description"]',       from: 'description', kind: 'text' },
    { sel: 'meta[property="og:image"]',             from: 'image',       kind: 'url'  },
    { sel: 'meta[property="og:image:secure_url"]',  from: 'image',       kind: 'url'  },
    { sel: 'meta[property="og:image:alt"]',         from: 'imageAlt',    kind: 'text' },

    { sel: 'meta[name="twitter:title"]',            from: 'title',       kind: 'text' },
    { sel: 'meta[name="twitter:description"]',      from: 'description', kind: 'text' },
    { sel: 'meta[name="twitter:image"]',            from: 'image',       kind: 'url'  },
    { sel: 'meta[name="twitter:image:alt"]',        from: 'imageAlt',    kind: 'text' }
  ];

  /* An absolute URL, which is the only kind a link preview can
     use: a crawler has no page to resolve "assets/..." against.
     `social.url` is the base when it is set — that is how the
     tags stay correct even when the page is opened from a
     preview host or a file — and the current address otherwise. */
  function absolute(path, base) {
    if (!path) return '';
    try {
      return new URL(path, base || window.location.href).href;
    } catch (e) {
      return path;
    }
  }

  /* The values every tag is drawn from, for the language being
     read right now. One place, so a tag can never be filled from
     a different source than its neighbour. */
  function values() {
    var s = RH.config.social || {};
    var base = s.url ? absolute(s.url) : window.location.href;

    return {
      /* The names live in social.title, and that is also the
         browser tab. `doc.title` in content.i18n.js is only the
         plain fallback for a config that has not been filled in
         yet — it is not a second place to write a couple's
         names. */
      title:       RH.L(s.title) || (RH.docTitle ? RH.docTitle() : RH.t('doc.title')),
      description: RH.L(s.description) || '',
      imageAlt:    RH.L(s.imageAlt) || '',
      studio:      s.studio || 'RagaHru',
      locale:      LOCALES[RH.lang()] || (RH.lang() + '_IN'),
      url:         base,
      image:       absolute(s.image, base),
      base:        base
    };
  }

  RH.meta = {
    values: values,

    apply: function () {
      var v = values();

      if (v.title) document.title = v.title;

      for (var i = 0; i < TAGS.length; i++) {
        var t = TAGS[i];
        var el = document.head.querySelector(t.sel);
        /* A tag that is not in the document is not created: the
           set that ships in index.html is the set a crawler will
           read, and inventing more of them here would only hide
           a stale sync. */
        if (!el) continue;

        var val = v[t.from];
        if (val) el.setAttribute('content', val);
      }
    }
  };

  RH.onLang(function () { RH.meta.apply(); });
})();
