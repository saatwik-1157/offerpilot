/* ============================================================
   OfferPilot — Integrations scaffold (Stripe + Supabase)
   --------------------------------------------------------------
   This file is the SINGLE swap point between demo mode and live.
   With blank keys in config.js everything runs on localStorage and
   no network calls are made. Fill the keys in and the same call
   sites (signup, login, checkout) light up.

   Nothing here is wired to real accounts yet — it's a clearly
   marked scaffold with graceful demo fallbacks. Follow the TODOs.
   ============================================================ */
(function () {
  "use strict";
  var C = window.OFFERPILOT_CONFIG || {};

  function has(v) { return typeof v === "string" && v.trim().length > 0; }

  var status = {
    supabase: has(C.supabaseUrl) && has(C.supabaseAnonKey),
    stripe: has(C.stripePublishableKey),
    forms: has(C.formsKey)
  };

  /* ---------------- SUPABASE (auth + database) ----------------
     To go live:
     1. Add the Supabase JS SDK to your pages:
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     2. Fill supabaseUrl + supabaseAnonKey in config.js.
     3. Create tables: clients, applications, referrals (mirror js/store.js).
     4. Replace the bodies of window.Store.* with Supabase queries.
        The Store API is intentionally small so this is a contained swap.
  ------------------------------------------------------------- */
  var supabase = null;
  function initSupabase() {
    if (!status.supabase) return null;
    if (supabase) return supabase;
    if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
      console.warn("[OfferPilot] Supabase keys set but SDK not loaded — add the supabase-js <script> tag. Falling back to demo store.");
      status.supabase = false;
      return null;
    }
    supabase = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey);
    return supabase;
    // TODO: expose auth helpers (signUp, signInWithPassword, signOut) and
    // repoint Store queries at supabase.from('applications')… etc.
  }

  /* ---------------- STRIPE (subscriptions) --------------------
     Simplest path (no backend): one Stripe Payment Link per plan.
     checkout() redirects there, passing the email + referral as
     client_reference_id / prefilled email. On success Stripe
     redirects back to dashboard.html.

     For full Checkout Sessions you'd add a tiny serverless function;
     the call site here stays the same.
  ------------------------------------------------------------- */
  function checkout(opts) {
    opts = opts || {};
    var plan = opts.plan || "Pro";
    var link = (C.stripeLinks || {})[plan];
    if (status.stripe && has(link)) {
      var url = new URL(link);
      if (opts.email) url.searchParams.set("prefilled_email", opts.email);
      if (opts.ref) url.searchParams.set("client_reference_id", opts.ref);
      window.location.href = url.toString();
      return true; // handed off to Stripe
    }
    return false;  // demo mode — caller proceeds locally
  }

  /* ---------------- FORMS (email capture) --------------------- */
  function captureEmail(payload) {
    if (!status.forms) return Promise.resolve({ demo: true });
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.assign({ access_key: C.formsKey }, payload))
    }).then(function (r) { return r.json(); }).catch(function () { return { error: true }; });
  }

  window.Integrations = {
    status: status,
    isLive: function () { return status.supabase || status.stripe; },
    initSupabase: initSupabase,
    checkout: checkout,
    captureEmail: captureEmail
  };

  // Helpful console banner in demo mode so it's obvious nothing is charged.
  if (!status.stripe && !status.supabase && window.console) {
    console.info("%c[OfferPilot] Demo mode — no Stripe/Supabase keys set. Data is local to this browser; no payments are processed.", "color:#4F46E5");
  }
})();
