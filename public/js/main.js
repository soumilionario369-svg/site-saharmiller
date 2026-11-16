(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};

  // Returns a safe https URL string or "" (blocks javascript:, data:, http:, unknown hosts).
  function safeCheckoutUrl(raw) {
    if (!raw || typeof raw !== 'string') return '';
    var u;
    try { u = new URL(raw.trim()); } catch (e) { return ''; }
    if (u.protocol !== 'https:') return '';
    var hosts = cfg.ALLOWED_CHECKOUT_HOSTS || ['whop.com'];
    var ok = hosts.some(function (h) { return u.hostname === h || u.hostname.slice(-(h.length + 1)) === '.' + h; });
    if (!ok) { console.warn('[site-config] Checkout host not allowed:', u.hostname); return ''; }
    return u.href; // no tracking parameters appended
  }

  var url = safeCheckoutUrl(cfg.WHOP_CHECKOUT_URL);
  if (cfg.WHOP_CHECKOUT_URL && !url) console.warn('[site-config] WHOP_CHECKOUT_URL is invalid; purchase buttons stay disabled.');

  // Page 2: purchase buttons open the on-site checkout page (a same-site path such as "/checkout").
  // Only "/something" is accepted (no "//host", no schemes). If empty, the Whop URL above is the fallback.
  var pagePath = (typeof cfg.CHECKOUT_PAGE_PATH === 'string' && /^\/(?!\/)[\w\-\/]*$/.test(cfg.CHECKOUT_PAGE_PATH.trim())) ? cfg.CHECKOUT_PAGE_PATH.trim() : '';
  var target = pagePath || url;

  if (target) {
    document.querySelectorAll('button[data-cta]').forEach(function (btn) {
      var a = document.createElement('a');
      a.className = btn.className;
      a.href = target; // same tab by default
      a.textContent = btn.textContent;
      a.setAttribute('data-cta', '');
      btn.replaceWith(a);
    });
    document.querySelectorAll('[data-cta-note]').forEach(function (n) { n.hidden = true; });
  } else {
    document.querySelectorAll('button[data-cta]').forEach(function (btn) {
      btn.setAttribute('aria-disabled', 'true');
      btn.title = 'Checkout link pending setup';
    });
  }

  // Pricing display from the central config (static HTML already holds the same approved values)
  var p = cfg.PRICING;
  if (p) {
    var set = function (key, text) { document.querySelectorAll('[data-price="' + key + '"]').forEach(function (n) { n.textContent = text; }); };
    set('reference', '$' + p.referencePrice);
    set('discount', String(p.discountPercentage));
    set('selling', '$' + p.sellingPrice);
    set('currency', p.currency);
    document.querySelectorAll('.pricing').forEach(function (n) {
      n.setAttribute('aria-label', 'Price: regularly $' + p.referencePrice + ', ' + p.discountPercentage + ' percent off, now $' + p.sellingPrice + ' ' + p.currency + ', one-time payment');
    });
  }

  // Policy effective date (single configurable value; stays pending until set)
  if (cfg.LEGAL_EFFECTIVE_DATE) document.querySelectorAll('[data-effective-date]').forEach(function (n) { n.textContent = cfg.LEGAL_EFFECTIVE_DATE; });

  // Footer year / brand
  document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
  if (cfg.BRAND_NAME) document.querySelectorAll('[data-brand]').forEach(function (n) { n.textContent = cfg.BRAND_NAME; });

  // QA-only UI (red notices, "Checkout link pending setup"): off for normal visitors.
  // Review mode: open the page with ?qa=1 (or set SHOW_QA_NOTICES: true) while STAGING is true.
  var qa = cfg.STAGING !== false && (cfg.SHOW_QA_NOTICES === true || /[?&]qa=1\b/.test(location.search));
  if (qa) document.documentElement.classList.add('qa-on');
  if (cfg.STAGING !== false) {
    console.info('[QA] Staging build - launch blockers: ' + (target ? '' : 'checkout link missing; ') +
      'legal pages pending review; see QA-CHECKLIST.md. Add ?qa=1 to the URL to show QA notices.');
  }

  // Horizontal rails (mobile): keyboard-focusable only while they actually overflow
  var rails = document.querySelectorAll('[data-rail]');
  function updateRails() {
    rails.forEach(function (el) {
      if (el.scrollWidth > el.clientWidth + 1) el.setAttribute('tabindex', '0'); else el.removeAttribute('tabindex');
    });
  }
  updateRails();
  window.addEventListener('resize', updateRails);
  window.addEventListener('load', updateRails);

  // Canonical + og:url only once SITE_URL is configured
  if (cfg.SITE_URL) {
    var base = cfg.SITE_URL.replace(/\/+$/, '') + '/';
    var l = document.createElement('link'); l.rel = 'canonical'; l.href = base; document.head.appendChild(l);
    var m = document.createElement('meta'); m.setAttribute('property', 'og:url'); m.content = base; document.head.appendChild(m);
  }
})();
