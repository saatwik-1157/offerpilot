/* ============================================================
   OfferPilot — Cloud saving (Supabase)
   When supabaseUrl + supabaseAnonKey are set in config.js, new
   signups and contact/chat messages are also written to Supabase
   (tables from apps/api/supabase/schema.sql). The browser keeps
   working from localStorage either way, so a network or config
   problem never blocks a visitor.

   Uses Supabase's REST endpoint directly — no SDK to load.
   ============================================================ */
(function () {
  "use strict";
  var C = window.OFFERPILOT_CONFIG || {};
  function has(v) { return typeof v === "string" && v.trim().length > 0; }
  var enabled = has(C.supabaseUrl) && has(C.supabaseAnonKey);

  function insert(table, row) {
    if (!enabled) return Promise.resolve({ skipped: true });
    return fetch(C.supabaseUrl.replace(/\/+$/, "") + "/rest/v1/" + table, {
      method: "POST",
      keepalive: true,                    // survives the redirect right after signup
      headers: {
        "Content-Type": "application/json",
        apikey: C.supabaseAnonKey,
        Authorization: "Bearer " + C.supabaseAnonKey,
        Prefer: "return=minimal"          // anon can't read rows back
      },
      body: JSON.stringify(row)
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { console.warn("[OfferPilot] Supabase " + table + " insert failed:", r.status, t); return { error: true }; });
      return { ok: true };
    }).catch(function (e) {
      console.warn("[OfferPilot] Supabase unreachable:", e);
      return { error: true };
    });
  }

  function saveSignup(client) {
    return insert("signups", {
      name: client.name,
      email: client.email,
      university: client.university || null,
      location: client.location || null,
      visa: client.visa || null,
      opt_expiry: client.optExpiry || null,
      target_roles: client.targetRoles || [],
      skills: client.skills || [],
      plan: client.plan,
      billing: client.billing || "monthly",
      promo_code: client.promoCode || null,
      first_payment: typeof client.firstPayment === "number" ? client.firstPayment : null,
      referral_code: client.referralCode || null,
      referred_by: client.referredBy || null
    });
  }

  function saveMessage(m) {
    return insert("messages", {
      source: m.source || "contact",
      name: m.name || null,
      email: m.email,
      topic: m.topic || null,
      message: m.message
    });
  }

  /* Deliver a contact/chat message through every configured channel:
     the email form service (formsKey) and/or Supabase. Resolves to
       { demo: true }  — nothing configured (caller falls back to mailto)
       { ok: true }    — at least one channel accepted it
       { error: true } — channels configured but all failed            */
  function sendMessage(m) {
    var I = window.Integrations;
    var forms = !!(I && I.status && I.status.forms);
    if (!forms && !enabled) return Promise.resolve({ demo: true });
    var jobs = [];
    if (forms) {
      jobs.push(I.captureEmail({ subject: m.subject || ("Message from " + (m.name || m.email)), name: m.name, email: m.email, message: m.message })
        .then(function (r) { return r && r.success !== false && !r.error ? { ok: true } : { error: true }; }));
    }
    if (enabled) jobs.push(saveMessage(m));
    return Promise.all(jobs).then(function (rs) {
      return rs.some(function (r) { return r && r.ok; }) ? { ok: true } : { error: true };
    });
  }

  window.Cloud = { enabled: enabled, saveSignup: saveSignup, saveMessage: saveMessage, sendMessage: sendMessage };
})();
