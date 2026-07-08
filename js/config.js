/* ============================================================
   OfferPilot — Site Config (single source of truth)
   Edit brand, contact, pricing, and integration keys here.
   Leave integration keys blank to run in safe "demo mode"
   (everything saves to the browser via localStorage).
   ============================================================ */
window.OFFERPILOT_CONFIG = {
  brand: "OfferPilot",
  brandTM: "OfferPilot™",
  resumeEngine: "RezForge™",
  tagline: "We apply. You interview.",
  year: 2026,

  email: "hello@offerpilot.example",
  phone: "+1 (555) 010-2025",

  // Pricing
  price: 249,
  priceUnit: "/month",
  appsPerDayMin: 25,
  appsPerDayMax: 35,
  appsPerMonth: 1000,

  // Demo access (client dashboard + admin). In live mode use real auth.
  demoClientEmail: "aarav@student.example",
  adminPasscode: "offerpilot",

  // Live domain (canonical/sitemap). Blank = demo.
  siteUrl: "https://saatwik-1157.github.io/offerpilot",

  /* ============================================================
     INTEGRATIONS — leave blank to run in demo mode (localStorage).
     Fill these in to go live. See README "Going live" + js/integrations.js.
     ============================================================ */

  // 1) SUPABASE — real auth + database (replaces js/store.js internals).
  //    Create a project at supabase.com, then paste the URL + anon key.
  supabaseUrl: "",         // e.g. https://xxxx.supabase.co
  supabaseAnonKey: "",     // public anon key (safe for the browser)

  // 2) STRIPE — real subscription payments.
  //    Use Stripe Payment Links (no server needed) or Checkout price IDs.
  stripePublishableKey: "",                 // pk_live_… / pk_test_…
  stripeLinks: {                            // one Payment Link per plan (blank = demo)
    Starter: "",   // e.g. https://buy.stripe.com/xxx
    Pro: "",
    Elite: ""
  },

  // 3) FORMS — onboarding email capture (e.g. web3forms / Formspree access key).
  formsKey: "",

  // 4) REZFORGE LIVE — real Claude-powered resume tailoring.
  //    Deploy server/rezforge-server.mjs (holds the ANTHROPIC_API_KEY) and put
  //    its URL here. Blank = demo mode (deterministic mock, no network calls).
  rezforgeEndpoint: "/api/rezforge"   // e.g. "http://localhost:8787/api/rezforge"
};
