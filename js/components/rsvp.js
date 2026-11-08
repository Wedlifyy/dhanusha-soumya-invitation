/* =============================================================
   RSVP — optional. rsvp.enabled === false removes the section.
   The form posts to whatever endpoint you configure. No keys
   live in this file, so nothing secret ships to the browser.

   A "yes" opens two more questions, because a wedding is planned
   in plates and chairs, not in replies:

     How many of you   a family replies once for everyone. 1–20.
     Which ceremonies  every dated ceremony in `events`, all lit to
                       begin with; a guest switches off the ones
                       they will miss. The lagna has no date and is
                       not offered.

   The reply is remembered on the guest's phone. Opening the
   invitation again shows their thank-you, with "Change my reply"
   under it; the form comes back filled in, and the Sheet updates
   their row rather than adding a second (same name + same phone).
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  var MAX_GUESTS = 20;

  RH.components.rsvp = function (mount) {
    var cfg = RH.config.rsvp || {};
    if (!cfg.enabled) return;

    /* The ceremonies a guest can come to: those with a date. */
    var rites = (RH.config.events || []).filter(function (ev) {
      return ev && !ev.rashi && ev.date;
    });

    var chips = rites.map(function (ev, i) {
      return '<button class="choice__btn choice__btn--sm" type="button" ' +
                     'data-ev="' + i + '" aria-pressed="true"></button>';
    }).join('');

    var view = RH.el(
      '<section class="sheet" id="rsvp">' +
        '<p class="t-kicker" data-caps data-rv="soft" data-i18n="rsvp.kicker"></p>' +
        '<h2 class="t-title" data-caps data-rv="ink" data-i18n="rsvp.title"></h2>' +
        RH.ornament(true) +

        '<div class="rsvp__form" data-rv="soft">' +
          '<div class="field">' +
            '<label for="rsvp-name" data-i18n="rsvp.name"></label>' +
            '<input id="rsvp-name" type="text" autocomplete="name" ' +
                   'data-i18n-attr="placeholder:rsvp.name">' +
          '</div>' +
          '<div class="field">' +
            '<label for="rsvp-mobile" data-i18n="rsvp.mobile"></label>' +
            '<input id="rsvp-mobile" type="tel" inputmode="tel" autocomplete="tel" ' +
                   'data-i18n-attr="placeholder:rsvp.mobile">' +
          '</div>' +
          '<div class="field">' +
            '<label for="rsvp-msg" data-i18n="rsvp.message"></label>' +
            '<textarea id="rsvp-msg" rows="3" ' +
                      'data-i18n-attr="placeholder:rsvp.message"></textarea>' +
          '</div>' +
          '<div class="field" role="group" aria-labelledby="rsvp-att-lb">' +
            '<span class="field__lb" id="rsvp-att-lb" data-i18n="rsvp.attending"></span>' +
            '<div class="choice">' +
              '<button class="choice__btn" type="button" data-val="yes" ' +
                      'aria-pressed="false" data-i18n="rsvp.yes"></button>' +
              '<button class="choice__btn" type="button" data-val="no" ' +
                      'aria-pressed="false" data-i18n="rsvp.no"></button>' +
            '</div>' +
          '</div>' +

          /* Only after a "yes". */
          '<div class="rsvp__more" hidden>' +
            '<div class="field" role="group" aria-labelledby="rsvp-count-lb">' +
              '<span class="field__lb" id="rsvp-count-lb" data-i18n="rsvp.guests"></span>' +
              '<div class="guests">' +
                '<button class="guests__btn" type="button" data-step="-1" ' +
                        'data-i18n-attr="aria-label:rsvp.fewer">' +
                  '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 8h9"/></svg>' +
                '</button>' +
                '<output class="guests__n" aria-live="polite">1</output>' +
                '<button class="guests__btn" type="button" data-step="1" ' +
                        'data-i18n-attr="aria-label:rsvp.more">' +
                  '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 8h9M8 3.5v9"/></svg>' +
                '</button>' +
              '</div>' +
              '<p class="guests__hint" data-i18n="rsvp.guestsHint"></p>' +
            '</div>' +
            (rites.length > 1
              ? '<div class="field" role="group" aria-labelledby="rsvp-ev-lb">' +
                  '<span class="field__lb" id="rsvp-ev-lb" data-i18n="rsvp.events"></span>' +
                  '<div class="choice choice--wrap">' + chips + '</div>' +
                '</div>'
              : '') +
          '</div>' +

          '<button class="rsvp__send" type="button" data-i18n="rsvp.send"></button>' +
          '<p class="rsvp__msg" role="status"></p>' +
        '</div>' +

        /* The reply, sealed: a ring drawn round, a tick drawn in. */
        '<svg class="rsvp__tick u-hidden" viewBox="0 0 52 52" aria-hidden="true" focusable="false">' +
          '<circle class="rsvp__tick-ring" cx="26" cy="26" r="24" pathLength="1"/>' +
          '<path class="rsvp__tick-mark" d="M15.5 27.2l7.2 7.2L37 19.6" pathLength="1"/>' +
        '</svg>' +
        '<p class="rsvp__thanks u-hidden"></p>' +
        '<p class="rsvp__party u-hidden"></p>' +
        '<button class="rsvp__change u-hidden" type="button" data-i18n="rsvp.change"></button>' +
      '</section>'
    );
    mount.appendChild(view);
    RH.applyI18n(view);

    var form    = view.querySelector('.rsvp__form');
    var thanks  = view.querySelector('.rsvp__thanks');
    var party   = view.querySelector('.rsvp__party');
    var change  = view.querySelector('.rsvp__change');
    var tick    = view.querySelector('.rsvp__tick');
    var send    = view.querySelector('.rsvp__send');
    var note    = view.querySelector('.rsvp__msg');
    var more    = view.querySelector('.rsvp__more');
    var countN  = view.querySelector('.guests__n');
    var evBtns  = [].slice.call(view.querySelectorAll('[data-ev]'));
    var choice  = null;
    var guests  = 1;
    var reply   = null;          /* the last reply that was sent */

    /* ---------- remembered on this phone ---------- */
    var KEY = 'rh-rsvp:' + RH.L(RH.config.groom.name) + '&' + RH.L(RH.config.bride.name);
    function recall() {
      try { return JSON.parse(window.localStorage.getItem(KEY) || 'null'); }
      catch (e) { return null; }
    }
    function remember(r) {
      try { window.localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) { /* private mode */ }
    }

    /* ---------- the pills ---------- */
    function ripple(b) {
      /* The gold fills the pill from where it was touched. */
      b.addEventListener('pointerdown', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--x', (e.clientX - r.left).toFixed(0) + 'px');
        b.style.setProperty('--y', (e.clientY - r.top).toFixed(0) + 'px');
      });
    }

    function choose(val) {
      choice = val;
      view.querySelectorAll('[data-val]').forEach(function (o) {
        o.setAttribute('aria-pressed', o.getAttribute('data-val') === val ? 'true' : 'false');
      });
      more.hidden = (val !== 'yes');
    }

    view.querySelectorAll('[data-val]').forEach(function (b) {
      ripple(b);
      b.addEventListener('click', function () {
        choose(b.getAttribute('data-val'));
        note.textContent = '';
      });
    });

    evBtns.forEach(function (b) {
      ripple(b);
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        note.textContent = '';
      });
    });

    /* ---------- how many ---------- */
    function setGuests(n) {
      guests = Math.max(1, Math.min(MAX_GUESTS, n | 0 || 1));
      countN.textContent = guests;
      view.querySelector('[data-step="-1"]').disabled = guests <= 1;
      view.querySelector('[data-step="1"]').disabled  = guests >= MAX_GUESTS;
    }
    view.querySelectorAll('[data-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        setGuests(guests + Number(b.getAttribute('data-step')));
      });
    });
    setGuests(1);

    /* ---------- words that follow the language ---------- */
    function paint() {
      evBtns.forEach(function (b) {
        b.textContent = RH.L(rites[Number(b.getAttribute('data-ev'))].name);
      });
      if (!reply) return;
      thanks.textContent = RH.t(reply.attending === 'yes' ? 'rsvp.thanksYes' : 'rsvp.thanksNo');
      if (reply.attending === 'yes') {
        var who = reply.guests === 1
          ? RH.t('rsvp.partyOne')
          : RH.t('rsvp.partyMany').replace('{n}', reply.guests);
        var at = (reply.eventIdx || []).map(function (i) {
          return rites[i] ? RH.L(rites[i].name) : '';
        }).filter(Boolean).join(' · ');
        party.textContent = who + (at ? ' — ' + at : '');
      } else {
        party.textContent = '';
      }
      party.classList.toggle('u-hidden', !party.textContent);
    }
    RH.onLang(paint);
    paint();

    function val(id) { return view.querySelector(id).value.trim(); }

    /* ---------- the sealed state ---------- */
    function showThanks(animate) {
      form.classList.add('u-hidden');
      tick.classList.remove('u-hidden');
      thanks.classList.remove('u-hidden');
      change.classList.remove('u-hidden');
      paint();
      if (!animate) return;
      /* Once the tick is drawn, the reply goes up in a handful of
         gold from the seal itself. */
      setTimeout(function () {
        var r = tick.getBoundingClientRect();
        RH.motion.burst(r.left + r.width / 2, r.top + r.height / 2);
      }, 900);
    }

    function done() {
      remember(reply);
      showThanks(true);
    }

    /* "Change my reply": the form comes back as it was sent. */
    change.addEventListener('click', function () {
      tick.classList.add('u-hidden');
      thanks.classList.add('u-hidden');
      party.classList.add('u-hidden');
      change.classList.add('u-hidden');
      form.classList.remove('u-hidden');
      send.disabled = false;
      note.textContent = '';
      view.querySelector('#rsvp-name').focus();
    });

    function fill(r) {
      view.querySelector('#rsvp-name').value   = r.name || '';
      view.querySelector('#rsvp-mobile').value = r.mobile || '';
      view.querySelector('#rsvp-msg').value    = r.message || '';
      if (r.attending) choose(r.attending);
      setGuests(r.guests || 1);
      if (r.eventIdx) {
        evBtns.forEach(function (b) {
          var on = r.eventIdx.indexOf(Number(b.getAttribute('data-ev'))) !== -1;
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }
    }

    var before = recall();
    if (before && before.name && before.attending) {
      reply = before;
      fill(before);
      showThanks(false);
    }

    /* ---------- sending ---------- */
    send.addEventListener('click', function () {
      var name = val('#rsvp-name');
      var mob  = val('#rsvp-mobile');
      var msg  = val('#rsvp-msg');

      if (!name)                          { note.textContent = RH.t('rsvp.errName');   return; }
      if (!/^[0-9+\-\s()]{7,16}$/.test(mob)) { note.textContent = RH.t('rsvp.errMobile'); return; }
      if (!choice)                        { note.textContent = RH.t('rsvp.errChoice'); return; }

      var yes = choice === 'yes';
      var eventIdx = evBtns.length
        ? evBtns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })
                .map(function (b) { return Number(b.getAttribute('data-ev')); })
        : rites.map(function (ev, i) { return i; });
      if (yes && evBtns.length && !eventIdx.length) { note.textContent = RH.t('rsvp.errEvents'); return; }

      reply = {
        name: name, mobile: mob, message: msg, attending: choice,
        guests: yes ? guests : 0,
        eventIdx: yes ? eventIdx : []
      };

      var payload = {
        name: name, mobile: mob, message: msg,
        attending: choice,
        /* Head count and ceremonies, in English whatever language the
           guest read in, so the Sheet adds up in one column. */
        guests: reply.guests,
        events: reply.eventIdx.map(function (i) {
          var n = rites[i].name;
          return (n && n.en) || RH.L(n);
        }).join(', '),
        couple: RH.L(RH.config.groom.name) + ' & ' + RH.L(RH.config.bride.name),
        lang: RH.lang()
      };

      /* No endpoint yet: the guest still gets a proper reply. */
      if (!cfg.endpoint) {
        /* Demo mode: no Google Script is linked, so nothing is saved. */
        if (window.console) console.warn('[RSVP] rsvp.endpoint is empty in wedding.config.js: this reply was NOT saved anywhere.');
        done();
        return;
      }

      send.disabled = true;
      note.textContent = RH.t('rsvp.sending');

      fetch(cfg.endpoint, {
        method: 'POST',
        /* Google Apps Script is sent text/plain, never application/json: a JSON
           content type makes the browser ask permission first (a CORS preflight)
           and Apps Script never answers it, so every reply would fail before it
           left the phone. The body is the same JSON either way. */
        headers: /\/macros\/.*\/exec$/.test(cfg.endpoint)
          ? { 'Content-Type': 'text/plain;charset=utf-8' }
          : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (r) {
        if (!r.ok) throw new Error('bad status');
        /* Apps Script answers 200 even when it refused the reply; its own
           {ok:true} is the only proof the row was written. */
        if (!/\/macros\/.*\/exec$/.test(cfg.endpoint)) { done(); return; }
        return r.json().then(function (j) {
          if (!j || j.ok !== true) throw new Error('rejected');
          done();
        });
      })
      .catch(function () {
        send.disabled = false;
        note.textContent = RH.t('rsvp.errSend');
      });
    });
  };
})();
