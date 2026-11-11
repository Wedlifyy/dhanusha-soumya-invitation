/* =============================================================
   FOOTER — the studio signs quietly, under the couple.
   ============================================================= */

(function () {
  'use strict';

  var RH = window.RH;

  RH.components.footer = function (mount) {
    var s = RH.config.social || {};

    var view = RH.el(
      '<footer class="foot">' +
        '<p class="foot__label" data-caps data-rv="soft" data-i18n="footer.crafted"></p>' +
        '<img class="foot__logo" data-rv="soft" alt="" width="380" height="385" decoding="async" loading="lazy" hidden>' +
        '<p class="foot__brand" data-rv="ink"></p>' +
        '<a class="foot__ig" data-rv="soft" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' +
          '<svg class="foot__ig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>' +
            '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>' +
            '<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>' +
          '</svg>' +
        '</a>' +
      '</footer>'
    );
    mount.appendChild(view);

    view.querySelector('.foot__brand').textContent = s.studio || 'RagaHru';

    /* The studio's mark carries its name, so where there is a mark the
       name set in type steps aside. If the picture cannot be had — no
       file, no signal — the name stays, and nothing is left blank. */
    var logo = view.querySelector('.foot__logo');
    if (s.logo) {
      logo.alt = s.studio || 'RagaHru';
      logo.onload = function () { view.classList.add('has-logo'); };
      logo.onerror = function () { logo.hidden = true; view.classList.remove('has-logo'); };
      logo.hidden = false;
      logo.src = s.logo;
    }

    var ig = view.querySelector('.foot__ig');
    if (s.instagramUrl) ig.href = s.instagramUrl;
    else ig.classList.add('u-hidden');

    RH.applyI18n(view);
  };
})();
