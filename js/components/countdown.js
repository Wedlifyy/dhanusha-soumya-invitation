/* =============================================================
   COUNTDOWN — starts only once the date has been revealed.
   Everything is derived from wedding.dateTimeISO, including its
   timezone offset, so the numbers are right wherever it is read.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  RH.components.countdown = function (mount) {
    if (!mount) return;

    var target = new Date(RH.config.wedding.dateTimeISO).getTime();
    var valid = !isNaN(target);

    var view = RH.el(
      '<div class="count-wrap">' +
        '<div class="count" role="timer" aria-live="off">' +
          '<div class="count__cell" style="--i:0"><b class="count__num" data-u="d">0</b>' +
            '<span class="count__lbl" data-i18n="count.days"></span></div>' +
          '<div class="count__cell" style="--i:1"><b class="count__num" data-u="h">00</b>' +
            '<span class="count__lbl" data-i18n="count.hours"></span></div>' +
          '<div class="count__cell" style="--i:2"><b class="count__num" data-u="m">00</b>' +
            '<span class="count__lbl" data-i18n="count.minutes"></span></div>' +
          '<div class="count__cell" style="--i:3"><b class="count__num" data-u="s">00</b>' +
            '<span class="count__lbl" data-i18n="count.seconds"></span></div>' +
        '</div>' +
        '<div class="count__done u-hidden">' +
          '<b data-i18n="count.today"></b>' +
          '<span class="t-small" data-i18n="count.todaySub"></span>' +
        '</div>' +
      '</div>'
    );
    mount.appendChild(view);
    RH.applyI18n(view);

    var grid = view.querySelector('.count');
    var done = view.querySelector('.count__done');
    var cell = {
      d: view.querySelector('[data-u="d"]'),
      h: view.querySelector('[data-u="h"]'),
      m: view.querySelector('[data-u="m"]'),
      s: view.querySelector('[data-u="s"]')
    };

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    var timer = null;
    var shown = {};

    /* A numeral that changes drops into its place from just above,
       the way a flap on a station board falls — so a second going
       by is something seen, not just a number that is different. */
    function put(u, text, roll) {
      if (shown[u] === text) return;
      shown[u] = text;
      var el = cell[u];
      el.textContent = text;
      if (roll && !RH.calm && el.animate) {
        el.animate([
          { transform: 'translate3d(0, -.34em, 0)', opacity: 0.15, filter: 'blur(2px)' },
          { transform: 'none', opacity: 1, filter: 'blur(0)' }
        ], { duration: 480, easing: 'cubic-bezier(.2, .7, .2, 1)' });
      }
    }

    function parts(left) {
      var s = Math.floor(left / 1000);
      return {
        d: Math.floor(s / 86400),
        h: Math.floor(s / 3600) % 24,
        m: Math.floor(s / 60) % 60,
        s: s % 60
      };
    }

    function arrived() {
      if (timer) { clearInterval(timer); timer = null; }
      grid.classList.add('u-hidden');
      done.classList.remove('u-hidden');
      requestAnimationFrame(function () { done.classList.add('is-live'); });
    }

    function tick() {
      var left = target - Date.now();

      if (left <= 0) { arrived(); return; }

      var p = parts(left);
      put('d', String(p.d), true);
      put('h', pad(p.h), true);
      put('m', pad(p.m), true);
      put('s', pad(p.s), true);
    }

    /* The first time the numbers are shown they run up from nothing
       and settle on the time that is left, fast and then slow, like
       a dial finding its mark. The real clock takes over after. */
    function runUp(then) {
      var goal = parts(target - Date.now());
      var t0 = 0;
      var LEN = 1500;

      function frame(now) {
        if (!t0) t0 = now;
        var k = Math.min((now - t0) / LEN, 1);
        var e = 1 - Math.pow(1 - k, 3);
        put('d', String(Math.round(goal.d * e)));
        put('h', pad(Math.round(goal.h * e)));
        put('m', pad(Math.round(goal.m * e)));
        put('s', pad(Math.round(goal.s * e)));
        if (k < 1) requestAnimationFrame(frame);
        else then();
      }
      requestAnimationFrame(frame);
    }

    function begin() {
      if (!valid) { grid.classList.add('u-hidden'); return; }
      if (target - Date.now() <= 0) { arrived(); grid.classList.add('is-live'); return; }

      grid.classList.add('is-live');

      if (RH.calm) {
        tick();
        timer = setInterval(tick, 1000);
        return;
      }

      put('d', '0'); put('h', '00'); put('m', '00'); put('s', '00');
      runUp(function () {
        tick();
        timer = setInterval(tick, 1000);
      });
    }

    document.addEventListener('rh:date-revealed', begin, { once: true });

    /* A tab left in the background drifts; resync on return. */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && timer) tick();
    });
  };
})();
