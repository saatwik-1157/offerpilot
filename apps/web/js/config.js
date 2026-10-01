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

  // Contact — shown in the footer, contact section and help chat.
  email: "saathwik.13@gmail.com",
  phone: "+91 9989057655",
  contactHours: "Mon–Fri, 9am–6pm ET",

  // Pricing
  price: 100,
  priceUnit: "/month",
  appsPerDayMin: 25,
  appsPerDayMax: 35,
  appsPerMonth: 1000,

  // Plans — the pricing table, signup checkout and dashboard all read these.
  // annual = per-month price when billed yearly (2 months free).
  plans: {
    Starter: { monthly: 100, annual: 83, perDay: "15 applications / day" },
    Pro:     { monthly: 150, annual: 125, perDay: "25–35 applications / day" },
    Elite:   { monthly: 200, annual: 167, perDay: "Priority queue + mock interviews" }
  },

  // Promo codes (demo — validated in the browser). pct = % off the first month.
  // The site-wide announcement bar advertises `featuredPromo`.
  promoCodes: {
    LAUNCH50: { pct: 50, label: "50% off your first month" },
    OPTFAST:  { pct: 25, label: "25% off your first month" },
    STEM20:   { pct: 20, label: "20% off your first month" }
  },
  featuredPromo: "LAUNCH50",

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
  //    Deploy apps/api (server/rezforge-server.mjs, holds the ANTHROPIC_API_KEY) and put
  //    its URL here. Blank = demo mode (deterministic mock, no network calls).
  rezforgeEndpoint: "/api/rezforge"   // e.g. "http://localhost:8787/api/rezforge"
};
