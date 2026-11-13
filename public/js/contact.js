(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  if (!form) return;
  var cfg = window.SITE_CONFIG || {};
  var endpoint = cfg.CONTACT_ENDPOINT || '/api/contact';
  var status = document.getElementById('cf-status');
  var btn = form.querySelector('button[type="submit"]');
  var label = btn.textContent;
  var busy = false;
  var names = ['name', 'email', 'subject', 'message'];
  var MSG = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    subject: 'Please enter a subject.',
    message: 'Please enter a message.'
  };
  var EMAIL_RE = /^[^\s@<>"',;:]+@[^\s@<>"',;:]+\.[^\s@<>"',;:]{2,}$/;

  function field(n) { return form.elements[n]; }
  function setError(n, text) {
    var input = field(n), err = document.getElementById('cf-' + n + '-error');
    if (!input || !err) return;
    if (text) { err.textContent = text; err.hidden = false; input.setAttribute('aria-invalid', 'true'); }
    else { err.textContent = ''; err.hidden = true; input.removeAttribute('aria-invalid'); }
  }
  function validate() {
    var first = null;
    names.forEach(function (n) {
      var v = field(n).value.trim(), bad = !v || (n === 'email' && !EMAIL_RE.test(v));
      setError(n, bad ? MSG[n] : '');
      if (bad && !first) first = field(n);
    });
    return first;
  }
  function say(text, kind) {
    status.className = 'form-status' + (kind ? ' form-status--' + kind : '');
    status.textContent = text;
  }

  names.forEach(function (n) {
    field(n).addEventListener('input', function () { if (field(n).getAttribute('aria-invalid')) setError(n, ''); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    say('', '');
    var bad = validate();
    if (bad) { bad.focus(); return; }

    busy = true; btn.disabled = true; btn.textContent = 'Sending…'; form.setAttribute('aria-busy', 'true');
    var payload = {};
    ['name', 'email', 'subject', 'order', 'message', 'website'].forEach(function (n) { payload[n] = field(n).value; });

    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (res.ok && res.body && res.body.ok === true) {
          form.reset();
          say('Thank you. Your message has been sent. We’ll reply by email.', 'ok');
        } else if (res.body && res.body.errors) {
          var first = null;
          Object.keys(res.body.errors).forEach(function (n) { setError(n, res.body.errors[n]); if (!first && field(n)) first = field(n); });
          if (first) first.focus();
        } else { throw new Error('send_failed'); }
      })
      .catch(function () {
        say('We couldn’t send your message. Please try again or email us directly.', 'error');
      })
      .then(function () {
        busy = false; btn.disabled = false; btn.textContent = label; form.removeAttribute('aria-busy');
      });
  });
})();
