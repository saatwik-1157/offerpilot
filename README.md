<img src="assets/logo-lockup.svg" alt="OfferPilot" height="44" />

# OfferPilot™ — *We apply. You interview.*

Brand mark: [`assets/logo.svg`](assets/logo.svg) (icon) · [`assets/logo-lockup.svg`](assets/logo-lockup.svg) (full lockup) — a paper-plane "send" mark on an indigo→violet gradient.

A done-for-you **job-application platform** for international students on **F-1 / OPT / STEM-OPT** visas. OfferPilot submits 25–35 hand-matched applications a day on the member's behalf — each with a resume tailored by the **RezForge™** engine — so students spend their time interviewing, not applying.

Built as a fast, dependency-free static web app (vanilla HTML/CSS/JS). No build step. Runs on `file://` or any static host.

> ⚠️ **Demo / portfolio project.** This is a functional prototype. All data lives in the browser (`localStorage`); the "AI" match + resume engine is a deterministic mock. No real applications are submitted and no employer is affiliated.

---

## What's inside

| Surface | File | What it does |
|---|---|---|
| **Marketing site** | `index.html` | Hero, problem framing, features, how-it-works, results, inbox social proof, comparison table, pricing, FAQ |
| **Signup / onboarding** | `signup.html` | Collects profile (roles, skills, visa) → creates an account → seeds the pipeline |
| **Client dashboard** | `dashboard.html` | Login, KPIs, live application tracker, per-role RezForge™ resume preview, onboarding checklist, empty-state for new clients, plan badge |
| **Profile & settings** | `profile.html` | Session-gated form to edit target roles, skills, visa, and OPT expiry; changes apply to the next daily cycle |
| **Legal** | `legal.html` | Refund policy, privacy, and terms (anchored sections wired from the footer) |
| **Ops console** | `admin.html` | Passcode-gated team view: client roster, run daily application cycles, update statuses, aggregate metrics |

### Feature highlights
- **OPT Runway Calculator** — a unique, niche-specific free tool ([runway.html](runway.html)): enter an OPT start date + degree type and instantly see work-authorization runway, unemployment-days budget, STEM window, and H-1B lottery timing — a lead-gen tool no generic job site has.
- **Dark mode** — persisted light/dark theme that defaults to the OS setting, applied before first paint (no flash), with a floating toggle on every page ([js/theme.js](js/theme.js)).
- **Company logos** — real company logos on badges (favicon service) with an automatic monogram fallback.
- **Analytics** — dashboard charts (applications/day, funnel, top companies) via a tiny dependency-free SVG engine.
- **Interview kanban** — move applications across Screening → Interview → Offer → Closed; status persists.
- **Notifications** — a bell + activity feed synthesized from application events, with unread badge and mark-all-read.
- **Referral program** — per-member code + shareable link, "give a month / get a month," credited on referred signups (`?ref=CODE`).
- **Tiered pricing** — Starter / Pro / Elite with a monthly ↔ annual toggle; plan flows through to signup (`?plan=`).
- **Resource hub** — free OPT / sponsorship / resume guides for SEO and trust.

### Engine & data (`js/`)
- **`ai.js` — RezForge™** — deterministic (seeded) match scoring + role-tailored resume generation + daily-cycle synthesis.
- **`store.js`** — the whole "backend": a `localStorage` store with seed data, queries, metrics, notifications, referrals, and mutations. Swap these functions for Supabase/REST to go live.
- **`charts.js`** — bar / line / funnel SVG chart helpers (no libraries).
- **`integrations.js`** — the single swap point for **Stripe** (payments) and **Supabase** (auth/DB). Blank keys → demo mode, no network calls. Fill keys in `config.js` to go live.
- **`config.js`** — single source of truth for brand, pricing, demo credentials, and integration keys.
- **`main.js`** — injects nav/footer/back-to-top, reveal-on-scroll, toast helper.

---

## Run it

Any static server works. With Python:

```bash
cd offerpilot
python -m http.server 8981
# open http://localhost:8981
```

Or just open `index.html` directly in a browser.

### Demo credentials
- **Client dashboard** (`dashboard.html`): email `aarav@student.example` — or click **“load the demo account.”**
- **Ops console** (`admin.html`): passcode `offerpilot`.

Try the loop: sign up on `signup.html` → your new account appears in the ops console → **Run daily cycle** → applications and resumes show up on that client's dashboard.

---

## The business model it demonstrates

- **Niche wedge** — highest-urgency, highest-willingness-to-pay slice of the job market (visa-clock students).
- **Productized done-for-you** — sells *time back* on a volume-based grind.
- **Anchored pricing** — flat **$249/mo, no salary commission**, positioned against staffing agencies that take 20–30%.
- **Trust engine** — screenshot social proof, logo wall, quantified outcomes to overcome scam-wariness.
- **Perceived moat** — proprietary **RezForge™** branding over commodity labor.

---

## Going live (swap points)

1. **Auth + DB** — replace `js/store.js` internals with Supabase (URL/key already stubbed in `config.js`).
2. **Payments** — wire the signup CTA to Stripe Checkout.
3. **Real matching/resumes** — the LLM resume tailor is already built (see below).
4. **Forms** — set `formsKey` in `config.js` for onboarding email capture.

---

## RezForge™ live mode (real Claude resumes)

The dashboard's resume preview has a **"✨ Regenerate with RezForge AI"** button. In demo mode it re-runs the deterministic mock; point it at the included server and it generates a genuinely tailored resume with Claude.

The Anthropic API key stays **server-side** — never in the browser (a static site can't safely hold one). `server/rezforge-server.mjs` is a tiny dependency-light Node proxy that calls Claude (`claude-opus-4-8`) with structured outputs and returns `{ summary, highlights, keywords }`.

```bash
cd server
npm install
ANTHROPIC_API_KEY=sk-ant-... node rezforge-server.mjs   # → http://localhost:8787/api/rezforge
```

Then set the endpoint in [js/config.js](js/config.js) and reload:

```js
rezforgeEndpoint: "http://localhost:8787/api/rezforge"
```

Leave `rezforgeEndpoint` blank to stay in demo mode. The client ([js/ai.js](js/ai.js) → `generateResumeLive`) always falls back to the mock on any network/error, so the dashboard never breaks. In production, deploy the server as a serverless function and lock `ALLOW_ORIGIN` to your domain.

## Deploy to the real world

The site is static, so it deploys to any static host in minutes. The included [netlify.toml](netlify.toml) sets the publish dir, a 404, and security headers.

**Netlify (drag-and-drop or CLI):**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir .
```

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**GitHub Pages:** push the repo and enable Pages on the default branch (root).

Before going live, update the real domain in `robots.txt`, `sitemap.xml`, and the `og:*` / `canonical` tags in `index.html`.

### Going fully live (optional back end)
- **RezForge resumes:** deploy `server/rezforge-server.mjs` (e.g. as a serverless function), set `ANTHROPIC_API_KEY`, lock `ALLOW_ORIGIN` to your domain, and set `rezforgeEndpoint` in [js/config.js](js/config.js).
- **Auth + data:** add Supabase keys and repoint `js/store.js` at it.
- **Payments:** add Stripe Payment Links / keys (`stripeLinks`, `stripePublishableKey` in config).

## License

MIT — see `LICENSE`.
