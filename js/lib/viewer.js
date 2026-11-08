/* =============================================================
   RagaHru — VIEWER
   One photograph, full-screen, grown out of wherever it was.

   RH.viewer.open(src, { from, alt, caption, round })

     from     the element the picture was showing in. The open
              photograph starts at its place and size and grows out
              of it; it goes back into it when closed.
     round    the picture was shown in a circle (a seal, a
              portrait): it opens out of that circle into its whole
              frame, and closes back into it.

   Over a warm, darkened page, in a cream-and-gold mount, with its
   caption under it. Closes on the button, on a tap outside it, or
   on Escape; the page behind is held still while it is open and
   the focus is given back where it was.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;
  var box = null, frame, img, cap, closeBtn;
  var open = false, src = null, round = false, lastFocus = null;

  function build() {
    box = RH.el(
      '<div class="pv" role="dialog" aria-modal="true" hidden>' +
        '<div class="pv__back"></div>' +
        '<figure class="pv__fig">' +
          '<div class="pv__frame"><img alt="" decoding="async"></div>' +
          '<figcaption class="pv__cap"></figcaption>' +
        '</figure>' +
        '<button class="pv__close" type="button">' +
          '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
            '<path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
          '</svg>' +
        '</button>' +
      '</div>'
    );
    document.body.appendChild(box);
    frame    = box.querySelector('.pv__frame');
    img      = box.querySelector('img');
    cap      = box.querySelector('.pv__cap');
    closeBtn = box.querySelector('.pv__close');

    box.querySelector('.pv__back').addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
    });
  }

  /* From the source's place and size to the frame's own, and back.
     Out of a circle it is opened by a circular clip that grows from
     the source's own round to past the frame's corners — so the
     part of the picture seen in the circle is exactly the part seen
     at the start, and the rest opens out round it. */
  function flight(reverse) {
    if (!src || !frame.animate || RH.calm) return null;
    var to = frame.getBoundingClientRect();
    var from = src.getBoundingClientRect();
    if (!to.width || !from.width) return null;
    var s = round ? from.width / to.height : from.width / to.width;
    var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
    var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    var away = { transform: 'translate3d(' + dx + 'px,' + dy + 'px,0) scale(' + s + ')' };
    var home = { transform: 'none' };
    if (round) {
      var full = Math.hypot(to.width, to.height) / 2 + 2;
      away.clipPath = 'circle(' + (to.height / 2) + 'px at 50% 50%)';
      home.clipPath = 'circle(' + full + 'px at 50% 50%)';
    }
    return frame.animate(reverse ? [home, away] : [away, home], {
      duration: reverse ? 480 : 680,
      easing: reverse ? 'cubic-bezier(.5,0,.75,.2)' : 'cubic-bezier(.2,.8,.2,1)'
    });
  }

  function show(url, opts) {
    if (!box) build();
    if (open) return;
    opts = opts || {};
    open = true;
    src = opts.from || null;
    round = !!opts.round;
    lastFocus = document.activeElement;

    img.src = url;
    img.alt = opts.alt || '';
    cap.textContent = opts.caption || '';
    cap.hidden = !opts.caption;
    closeBtn.setAttribute('aria-label', RH.t('gallery.close'));
    box.setAttribute('aria-label', opts.alt || RH.t('gallery.photo'));

    var go = function () {
      box.hidden = false;
      document.documentElement.classList.add('is-viewing');
      void box.offsetWidth;
      box.classList.add('is-open');
      if (src) src.style.visibility = 'hidden';
      var a = flight(false);
      var done = function () { if (src) src.style.visibility = ''; };
      if (a) a.onfinish = done; else done();
      closeBtn.focus({ preventScroll: true });
    };
    /* The frame takes its shape from the picture, so it is measured
       once the picture knows its size. */
    if (img.complete && img.naturalWidth) go();
    else {
      img.onload = function () { img.onload = null; go(); };
      img.onerror = function () { img.onerror = null; go(); };
    }
  }

  function close() {
    if (!open) return;
    box.classList.remove('is-open');
    var finish = function () {
      box.hidden = true;
      if (src) src.style.visibility = '';
      document.documentElement.classList.remove('is-viewing');
      open = false;
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    if (src) src.style.visibility = 'hidden';
    var a = flight(true);
    if (a) a.onfinish = finish; else finish();
  }

  RH.viewer = { open: show, close: close };
})();
