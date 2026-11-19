/* Page 2 checkout. Adapted from the sandbox-proven checkout-test/checkout.js (same Whop Elements lifecycle):
 *   items = [main, ...selected add-ons]; on every checkbox change destroy the current handle,
 *   then WhopElements({environment}).checkout.create({items,...}) and handle.create("checkout").mount(...).
 * Plan IDs, prices and environment come from checkout-test/config.js (served here as /checkout/config.js): one source of truth.
 * This file never decides whether a payment succeeded; Whop's own flow and the dashboard are the source of truth. */
(function () {
  "use strict";
  var C = window.CHECKOUT_TEST || {};
  var P = C.PRODUCTS || {};
  var $ = function (id) { return document.getElementById(id); };

  // Money in integer cents (no floating-point arithmetic on totals).
  var cents = function (k) { return Math.round(P[k].price * 100); };
  var money = function (c) { return "$" + Math.floor(c / 100) + "." + ("0" + (c % 100)).slice(-2); };

  var qa = /[?&]qa=1\b/.test(location.search);
  if (qa) $("co-qa").hidden = false;
  function log(msg) {
    if (!qa) return;
    var l = $("log");
    l.textContent += "[" + new Date().toLocaleTimeString() + "] " + msg + "\n";
    l.scrollTop = l.scrollHeight;
  }
  function notice(msg) { var n = $("co-notice"); n.textContent = msg; n.hidden = !msg; }
  function status(msg) { $("co-status").textContent = msg; }

  // Test banner: shown only in sandbox. Customers never see it in production.
  if (C.ENVIRONMENT === "sandbox") $("co-env").hidden = false;

  var isPlaceholder = function (id) { return !id || /^PLACEHOLDER/.test(id); };

  // Main is always first and always present; add-ons are independent checkboxes (unchecked by default).
  function selectedKeys() {
    var keys = ["main"];
    if ($("cb-breakfasts").checked) keys.push("breakfasts");
    if ($("cb-christmas").checked) keys.push("christmas");
    return keys;
  }

  var whop = null;     // Elements instance (created once)
  var handle = null;   // current checkout handle
  var seq = 0;         // ignores callbacks from destroyed instances
  var timer = null;    // debounce for rapid toggles

  function destroyCurrent() {
    if (handle) {
      try { handle.destroy(); log("Destroyed previous checkout instance"); }
      catch (e) { log("destroy() error: " + e.message); }
      handle = null;
    }
    $("checkout-mount").innerHTML = "";
  }

  // Display-only summary (updates immediately).
  function renderSummary(keys) {
    var total = 0;
    var ul = $("co-lines");
    ul.innerHTML = "";
    keys.forEach(function (k) {
      total += cents(k);
      var li = document.createElement("li");
      var a = document.createElement("span"); a.textContent = P[k].title;
      var b = document.createElement("span"); b.textContent = money(cents(k));
      li.appendChild(a); li.appendChild(b); ul.appendChild(li);
    });
    $("co-total").textContent = money(total);
  }

  function mountCheckout(keys, mine) {
    var missing = keys.filter(function (k) { return isPlaceholder(P[k].planId); });
    if (missing.length) {
      notice("Checkout disabled: set a real Plan ID in checkout-test/config.js for: " + missing.join(", ") + ". Nothing is simulated.");
      status(""); $("checkout-mount").setAttribute("aria-busy", "false");
      return;
    }
    if (!window.WhopElements) {
      notice("The secure checkout could not load (blocked or offline). Please check your connection and reload the page.");
      status(""); $("checkout-mount").setAttribute("aria-busy", "false");
      return;
    }
    notice("");
    if (!whop) whop = window.WhopElements({ environment: C.ENVIRONMENT });

    var items = keys.map(function (k) { return { plan: P[k].planId, quantity: 1 }; });
    log("Creating checkout, items=" + JSON.stringify(items));

    handle = whop.checkout.create({
      items: items,
      returnUrl: location.origin + (C.RETURN_PATH || "/success.html"),
      metadata: { test: "sarah-miller-checkout-test", selection: keys.join("+") },
      onComplete: function (p) { if (mine === seq) log("onComplete: " + JSON.stringify(p) + " (not proof of access; check Whop dashboard)"); },
      onLoadingChange: function (s) { if (mine === seq) log("loading=" + JSON.stringify(s)); }
    });
    var el = handle.create("checkout", {
      onLoaderStart: function () { if (mine === seq) log("loader start"); },
      onReady: function () {
        if (mine !== seq) return;
        log("checkout ready");
        status(""); $("checkout-mount").setAttribute("aria-busy", "false");
        var l = $("co-loading"); if (l && l.parentNode) l.parentNode.removeChild(l);
      },
      onError: function (e) {
        if (mine !== seq) return;
        log("ELEMENT ERROR: " + JSON.stringify(e));
        status(""); notice("We couldn't load the secure checkout. Please reload the page and try again.");
      }
    });
    el.mount("#checkout-mount");
  }

  // Every selection change: summary now; old Whop instance destroyed now (so no payment can use a stale
  // selection); new instance created after a short pause to coalesce rapid toggles.
  function update(immediate) {
    var keys = selectedKeys();
    renderSummary(keys);
    var mine = ++seq;
    clearTimeout(timer);
    destroyCurrent();
    var mount = $("checkout-mount");
    mount.setAttribute("aria-busy", "true");
    var p = document.createElement("p");
    p.className = "co-payment__loading"; p.id = "co-loading";
    p.textContent = "Updating your checkout…";
    mount.appendChild(p);
    status("Updating your order…");
    timer = setTimeout(function () { if (mine === seq) { mount.removeChild(p); mountCheckout(keys, mine); } }, immediate ? 0 : 250);
  }

  // Photo rail (mobile): keyboard-focusable only while it actually overflows
  var rails = document.querySelectorAll("[data-rail]");
  function updateRails() {
    rails.forEach(function (el) {
      if (el.scrollWidth > el.clientWidth + 1) el.setAttribute("tabindex", "0"); else el.removeAttribute("tabindex");
    });
  }
  updateRails();
  window.addEventListener("resize", updateRails);

  $("cb-breakfasts").addEventListener("change", function () { update(false); });
  $("cb-christmas").addEventListener("change", function () { update(false); });
  // Browsers may restore checkbox state on reload/back: always build the order from the real checkbox state.
  update(true);
  window.addEventListener("pageshow", function (e) { if (e.persisted) update(true); });
})();
