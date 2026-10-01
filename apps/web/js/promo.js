/* ============================================================
   OfferPilot — Promotions
   • Announcement bar (site-wide ad for the featured promo code)
   • Promo carousel ([data-promo-carousel]) on the home page
   • window.Promo.lookup(code) — shared code validation used by
     signup checkout. Codes live in config.js (promoCodes).
   ============================================================ */
(function () {
  "use strict";
  var C = window.OFFERPILOT_CONFIG || {};
  var DISMISS_KEY = "offerpilot.promoBar";

  function lookup(code) {
    if (!code) return null;
    var key = String(code).trim().toUpperCase();
    var p = (C.promoCodes || {})[key];
    return p ? { code: key, pct: p.pct, label: p.label } : null;
  }

  function announcementBar() {
    var code = C.featuredPromo, promo = lookup(code);
    if (!promo || document.body.dataset.chrome === "off") return;
    try { if (localStorage.getItem(DISMISS_KEY) === promo.code) return; } catch (e) {}
    var bar = document.createElement("div");
    bar.className = "promo-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Current offer");
    bar.innerHTML =
      '<div class="container promo-bar-inner">' +
        '<span class="promo-spark" aria-hidden="true">✦</span>' +
        '<span><strong>Launch offer:</strong> ' + promo.label + ' with code ' +
          '<button type="button" class="promo-code" title="Copy code">' + promo.code + '</button></span>' +
        '<a class="promo-cta" href="signup.html?plan=Pro&amp;promo=' + promo.code + '">Claim it →</a>' +
        '<button type="button" class="promo-close" aria-label="Dismiss offer">×</button>' +
      '</div>';
    // Keep the skip link as the first focusable element (main.js adds it first).
    var skip = document.querySelector(".skip-link");
    if (skip) skip.after(bar); else document.body.prepend(bar);
    bar.querySelector(".promo-code").addEventListener("click", function () {
      var done = function () { if (window.toast) window.toast("Code " + promo.code + " copied"); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(promo.code).then(done, done);
      else done();
    });
    bar.querySelector(".promo-close").addEventListener("click", function () {
      try { localStorage.setItem(DISMISS_KEY, promo.code); } catch (e) {}
      bar.remove();
    });
  }

  function carousel(root) {
    var track = root.querySelector(".promo-track");
    var slides = root.querySelectorAll(".promo-slide");
    var dotsWrap = root.querySelector(".promo-dots");
    if (!track || slides.length < 2) return;
    var i = 0, timer = null;
    var reduced = false;
    try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

    var dots = Array.prototype.map.call(slides, function (s, n) {
      var d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Show offer " + (n + 1));
      d.addEventListener("click", function () { go(n); restart(); });
      dotsWrap.appendChild(d);
      return d;
    });
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-100 * i) + "%)";
      slides.forEach(function (s, k) {
        s.classList.toggle("active", k === i);
        s.setAttribute("aria-hidden", k === i ? "false" : "true");
        s.querySelectorAll("a, button").forEach(function (a) { a.tabIndex = k === i ? 0 : -1; });
      });
      dots.forEach(function (d, k) { d.classList.toggle("active", k === i); d.setAttribute("aria-current", k === i ? "true" : "false"); });
    }
    function restart() {
      clearInterval(timer);
      if (!reduced) timer = setInterval(function () { go(i + 1); }, 5200);
    }
    var prev = root.querySelector(".promo-prev"), next = root.querySelector(".promo-next");
    if (prev) prev.addEventListener("click", function () { go(i - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(i + 1); restart(); });
    root.addEventListener("mouseenter", function () { clearInterval(timer); });
    root.addEventListener("mouseleave", restart);
    root.addEventListener("focusin", function () { clearInterval(timer); });

    // Swipe on touch screens
    var startX = null;
    root.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });
    go(0); restart();
  }

  window.Promo = { lookup: lookup };

  document.addEventListener("DOMContentLoaded", function () {
    announcementBar();
    document.querySelectorAll("[data-promo-carousel]").forEach(carousel);
  });
})();
