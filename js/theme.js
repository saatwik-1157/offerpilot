/* ============================================================
   OfferPilot — Theme (light / dark)
   Loaded in <head> so the theme is applied BEFORE first paint
   (no flash). Persists the choice; defaults to the OS setting.
   ============================================================ */
(function () {
  "use strict";
  var KEY = "offerpilot.theme";

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function systemDark() {
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; }
  }
  function current() { return stored() || (systemDark() ? "dark" : "light"); }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      (document.head || document.documentElement).appendChild(meta);
    }
    meta.setAttribute("content", theme === "dark" ? "#0B1020" : "#4F46E5");
  }

  // Apply immediately (this file is in <head>) — before the body paints.
  apply(current());

  var SUN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  var btn = null;
  function refresh() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (btn) {
      btn.innerHTML = dark ? SUN : MOON;
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
  }
  function set(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    apply(theme); refresh();
  }
  function toggle() {
    set(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  }
  window.OfferPilotTheme = { set: set, toggle: toggle, current: current };

  function inject() {
    btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.type = "button";
    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);
    refresh();
    // Follow OS changes only while the user hasn't picked a theme.
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        if (!stored()) { apply(e.matches ? "dark" : "light"); refresh(); }
      });
    } catch (e) {}
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else { inject(); }
})();
