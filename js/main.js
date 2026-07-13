/* ============================================================
   OfferPilot — Shared JS
   Injects navbar + footer + back-to-top, wires interactions.
   No build step, no deps. Works on file:// and http(s).
   ============================================================ */
(function () {
  "use strict";
  var C = window.OFFERPILOT_CONFIG || {};

  var NAV = [
    { label: "How it works", href: "index.html#how" },
    { label: "Results", href: "index.html#results" },
    { label: "Pricing", href: "index.html#pricing" },
    { label: "Runway tool", href: "runway.html" },
    { label: "Resources", href: "resources.html" },
    { label: "FAQ", href: "index.html#faq" }
  ];

  var LOGO =
    '<svg class="logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<rect width="40" height="40" rx="11" fill="url(#opg)"/>' +
    '<path d="M30 10 L9 18 L20 22 Z" fill="#fff"/>' +
    '<path d="M30 10 L20 22 L22 31 Z" fill="#fff" fill-opacity="0.72"/>' +
    '<defs><linearGradient id="opg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">' +
    '<stop stop-color="#6366F1"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs></svg>';

  function brandHTML() {
    return '<a class="brand" href="index.html">' + LOGO + '<span>Offer<em>Pilot</em></span></a>';
  }

  function buildNav() {
    var here = location.pathname.split("/").pop() || "index.html";
    var links = NAV.map(function (n) {
      var active = n.href.indexOf(here) === 0 && here !== "index.html" ? " class=\"active\"" : "";
      return '<a href="' + n.href + '"' + active + '>' + n.label + "</a>";
    }).join("");
    var nav = document.createElement("nav");
    nav.className = "nav";
    nav.innerHTML =
      '<div class="container nav-inner">' +
        brandHTML() +
        '<div class="nav-links">' + links +
          '<a href="dashboard.html" class="dash-link">Client login</a>' +
        '</div>' +
        '<div class="nav-cta">' +
          '<a href="dashboard.html" class="btn btn-outline btn-sm">Sign in</a>' +
          '<a href="signup.html" class="btn btn-primary btn-sm">Get started</a>' +
          '<button class="nav-toggle" aria-label="Menu"><span></span></button>' +
        '</div>' +
      '</div>';
    document.body.prepend(nav);

    var toggle = nav.querySelector(".nav-toggle");
    toggle.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    });

    // Elevate the bar with a shadow once the page scrolls.
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function buildFooter() {
    var f = document.createElement("footer");
    f.className = "footer";
    f.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div class="col">' + brandHTML().replace("brand", "brand") +
            '<p>' + (C.tagline || "We apply. You interview.") +
            ' Done-for-you job applications for F-1 / OPT students racing the clock.</p>' +
          '</div>' +
          '<div class="col"><h3>Product</h3>' +
            '<a href="index.html#how">How it works</a>' +
            '<a href="index.html#results">Results</a>' +
            '<a href="index.html#pricing">Pricing</a>' +
            '<a href="dashboard.html">Client dashboard</a>' +
          '</div>' +
          '<div class="col"><h3>Company</h3>' +
            '<a href="index.html#faq">FAQ</a>' +
            '<a href="signup.html">Get started</a>' +
            '<a href="admin.html">Team login</a>' +
            '<a href="mailto:' + (C.email || "hello@offerpilot.example") + '">Contact</a>' +
          '</div>' +
          '<div class="col"><h3>Legal</h3>' +
            '<a href="legal.html#refund">Refund policy</a>' +
            '<a href="legal.html#privacy">Privacy</a>' +
            '<a href="legal.html#terms">Terms</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© ' + (C.year || 2026) + ' ' + (C.brand || "OfferPilot") + '. All rights reserved.</span>' +
          '<span>Not affiliated with any listed employer. ' + (C.resumeEngine || "RezForge™") + ' engine.</span>' +
        '</div>' +
      '</div>' +
      '<p class="disclaimer">OfferPilot is a job-application service, not a staffing agency or immigration advisor. ' +
      'We do not guarantee employment. Company names and logos are shown for illustration of where members have interviewed.</p>';
    document.body.appendChild(f);
  }

  function backToTop() {
    var b = document.createElement("button");
    b.className = "to-top"; b.setAttribute("aria-label", "Back to top");
    b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    document.body.appendChild(b);
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    window.addEventListener("scroll", function () {
      b.classList.toggle("show", window.scrollY > 480);
    }, { passive: true });
  }

  function reveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  // Expose a tiny toast helper for app pages
  window.toast = function (msg) {
    var t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(window._toastT);
    window._toastT = setTimeout(function () { t.classList.remove("show"); }, 2400);
  };

  function cookieBanner() {
    try { if (localStorage.getItem("offerpilot.cookies")) return; } catch (e) {}
    var b = document.createElement("div");
    b.className = "cookie-banner";
    b.innerHTML = '<p>We use cookies to keep you signed in and improve OfferPilot. See our <a href="legal.html#privacy">privacy policy</a>.</p>' +
      '<button class="btn btn-primary btn-sm">Got it</button>';
    document.body.appendChild(b);
    b.querySelector("button").addEventListener("click", function () {
      try { localStorage.setItem("offerpilot.cookies", "1"); } catch (e) {}
      b.style.display = "none";
    });
  }

  // Accessibility: a skip-to-content link as the first focusable element.
  function buildSkipLink() {
    var skip = document.createElement("a");
    skip.className = "skip-link";
    skip.textContent = "Skip to content";
    var main = document.querySelector("main") || document.querySelector(".hero, section");
    if (main) {
      if (!main.id) main.id = "main-content";
      main.setAttribute("tabindex", "-1");
      skip.href = "#" + main.id;
    } else { skip.href = "#main-content"; }
    document.body.prepend(skip);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.chrome !== "off") { buildNav(); buildSkipLink(); buildFooter(); backToTop(); }
    reveals();
    cookieBanner();
    // Fill any [data-brand] / [data-price] placeholders
    document.querySelectorAll("[data-price]").forEach(function (e) { e.textContent = C.price; });
    document.querySelectorAll("[data-brand]").forEach(function (e) { e.textContent = C.brand; });
  });
})();
