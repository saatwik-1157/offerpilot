<img src="apps/web/assets/logo-lockup.svg" alt="OfferPilot" height="44" />

# OfferPilot™ — *We apply. You interview.*

A done-for-you **job-application platform** for international students on **F-1 / OPT / STEM-OPT** visas. OfferPilot submits 25–35 hand-matched applications a day on the member's behalf, each with a resume tailored by the **RezForge™** engine, so students spend their time interviewing, not applying.

The front end is a fast, dependency-free static web app (vanilla HTML/CSS/JS, no build step). An optional backend calls Claude to generate real tailored resumes.

**Built by Saatwik Sairaam Vasamsetti** · [github.com/saatwik-1157](https://github.com/saatwik-1157)

> ⚠️ **Demo / portfolio project.** This is a functional prototype. All data lives in the browser (`localStorage`); the match engine and the default resume engine are deterministic mocks. No real applications are submitted and no employer is affiliated.

---

## Contents

- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Setup](#setup)
- [Environment variables](#environment-variables)
- [Run locally](#run-locally)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)
- [Product tour](#product-tour)

---

## Architecture

```
 ┌───────────────────────────── Browser ─────────────────────────────┐
 │  apps/web  (static HTML/CSS/JS)                                   │
 │   pages ── js/store.js ──► localStorage   (accounts, pipeline,    │
 │                                            metrics, notifications)│
 │   js/ai.js  generateResumeLive()                                  │
 │      │  rezforgeEndpoint blank / request fails ─► deterministic   │
 │      │                                             mock resume    │
 └──────┼────────────────────────────────────────────────────────────┘
        │ POST /api/rezforge  { profile, job }
        ▼
 ┌──────────────── apps/api  (RezForge, holds the API key) ──────────┐
 │  functions/rezforge.js   serverless (Vercel, via root api/ shim)  │
 │  server/rezforge-server.mjs   standalone Node proxy (any host)    │
 └──────┬────────────────────────────────────────────────────────────┘
        │ @anthropic-ai/sdk, structured JSON output
        ▼
   Claude API  ──►  { summary, highlights[], keywords[] }
```

- The site works entirely on its own. Without a backend, every feature runs in demo mode against `localStorage`.
- The Anthropic API key only ever lives in the backend's environment, never in the browser.
- The client always falls back to the mock on any network or API error, so the dashboard never breaks.

---

## Repository structure

```
offerpilot/
├── apps/
│   ├── web/                     # the published static site (deploy root)
│   │   ├── index.html  dashboard.html  admin.html  profile.html  signup.html
│   │   ├── guide.html  legal.html  resources.html  runway.html  404.html
│   │   ├── css/styles.css
│   │   ├── js/                  # config, store, ai (RezForge client), charts, ...
│   │   ├── assets/              # logos, icons, OG images
│   │   └── manifest.webmanifest  sitemap.xml  robots.txt
│   └── api/                     # RezForge backend
│       ├── functions/rezforge.js        # serverless handler (Vercel (req, res))
│       ├── server/rezforge-server.mjs   # standalone Node proxy
│       └── package.json
├── api/rezforge.js              # Vercel entry shim, re-exports apps/api/functions
├── scripts/
│   ├── serve-web.mjs            # zero-dependency local static server
│   └── check-syntax.mjs         # node --check over every JS file
├── .github/workflows/pages.yml  # GitHub Pages deploy of apps/web
├── netlify.toml  vercel.json    # host config (both publish apps/web)
├── .env.example                 # every env var the backend reads
└── package.json                 # root scripts + @anthropic-ai/sdk
```

**Why is there still a root `api/` folder?** Vercel only deploys serverless functions from an `api/` directory at the project root (see Vercel's `vercel.json` docs). `api/rezforge.js` is a one-line re-export of `apps/api/functions/rezforge.js`, so the code lives in `apps/api` and Vercel still serves it at `/api/rezforge`.

---

## Setup

Requirements: **Node.js 18+** (20.6+ if you use `npm run api:env`). The static site itself needs nothing.

```bash
git clone https://github.com/saatwik-1157/offerpilot.git
cd offerpilot
npm install            # installs @anthropic-ai/sdk (backend only)
cp .env.example .env   # only needed for live RezForge
```

## Environment variables

These are read by the backend (`apps/api`) only. See [`.env.example`](.env.example).

| Variable | Required | Default | Used by |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | for live AI | none | function + server (read by the Anthropic SDK) |
| `REZFORGE_MODEL` | no | `claude-opus-4-8` | function + server |
| `ALLOW_ORIGIN` | no | `*` | function + server (CORS). Lock to your domain in production |
| `PORT` | no | `8787` | standalone server |
| `WEB_PORT` | no | `8981` | `npm run web` local static server |

The front end is configured in [`apps/web/js/config.js`](apps/web/js/config.js) (brand, pricing, demo credentials, integration keys, `rezforgeEndpoint`). Leave integration keys blank to stay in demo mode.

---

## Run locally

| Command | What it does |
|---|---|
| `npm run web` | Serves `apps/web` at http://localhost:8981 (set `WEB_PORT` to change) |
| `npm run api` | Starts the RezForge proxy at http://localhost:8787/api/rezforge (set `PORT` to change) |
| `npm run api:env` | Same, loading variables from `.env` (Node 20.6+) |
| `npm run check` | Syntax-checks every JS file with `node --check` |

Any static server also works, for example `python -m http.server 8981 --directory apps/web`. You can also open `apps/web/index.html` directly in a browser.

**Live resumes locally:** run `npm run api` with `ANTHROPIC_API_KEY` set, then in `apps/web/js/config.js` set

```js
rezforgeEndpoint: "http://localhost:8787/api/rezforge"
```

and reload the dashboard. Set `rezforgeEndpoint: ""` to force demo mode with no network calls.

### Demo credentials
- **Client dashboard** (`/dashboard.html`): email `aarav@student.example`, or click **"load the demo account."**
- **Ops console** (`/admin.html`): passcode `offerpilot`.

Try the loop: sign up on `/signup.html` → your new account appears in the ops console → **Run daily cycle** → applications and resumes show up on that client's dashboard.

---

## Deploy

Every host publishes **`apps/web`**. Public URLs are unchanged: `/index.html`, `/dashboard.html`, `/admin.html` and so on.

### Vercel (static site + live AI)
1. Import the repo. Leave **Root Directory** as the repo root (`./`). `vercel.json` sets the output directory to `apps/web`, and the root `api/rezforge.js` shim becomes `/api/rezforge`.
2. Set `ANTHROPIC_API_KEY` (and optionally `REZFORGE_MODEL`, `ALLOW_ORIGIN`) under Project Settings → Environment Variables.
3. Keep `rezforgeEndpoint: "/api/rezforge"` in `apps/web/js/config.js` (same origin, no CORS).

```bash
npm i -g vercel
vercel --prod
```

### Netlify (static site)
`netlify.toml` publishes `apps/web`, serves `404.html` for missing paths, and sets security headers.

```bash
npm i -g netlify-cli
netlify deploy --prod        # uses publish = "apps/web" from netlify.toml
```

The RezForge function uses Vercel's Node `(req, res)` signature, which Netlify Functions do not support, so no Netlify function is configured. On Netlify, `/api/rezforge` returns 404 and the dashboard uses the mock resume. For live AI, host `apps/api/server/rezforge-server.mjs` elsewhere (any Node host), set `ALLOW_ORIGIN` to your Netlify URL, and point `rezforgeEndpoint` at it.

### GitHub Pages (static site)
Branch-based Pages can only publish the repo root or `/docs`, so `.github/workflows/pages.yml` uploads `apps/web` instead. One-time setup: **Settings → Pages → Source: GitHub Actions**. After that, every push to `main` that touches `apps/web` redeploys. Pages can't run functions, so the dashboard uses the mock resume there unless `rezforgeEndpoint` points at a hosted proxy.

### Before going live
- Update the real domain in `apps/web/robots.txt`, `apps/web/sitemap.xml`, `siteUrl` in `config.js`, and the `og:*` / `canonical` tags in `apps/web/index.html`.
- Lock `ALLOW_ORIGIN` to your domain.
- **Auth + data:** replace the `apps/web/js/store.js` internals with Supabase (URL and key are stubbed in `config.js`).
- **Payments:** add Stripe Payment Links or keys (`stripeLinks`, `stripePublishableKey` in `config.js`).
- **Forms:** set `formsKey` in `config.js` for onboarding email capture.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Resume says demo / never "live" | `rezforgeEndpoint` is blank, or the request failed and the client fell back to the mock. Check the browser Network tab for the `POST` to `rezforgeEndpoint`. |
| API returns `400 Could not resolve authentication method` | `ANTHROPIC_API_KEY` isn't set in the backend's environment. The server also warns about this at startup. |
| API returns `400 job.company and job.role are required` | The request body is missing `job`. This is expected for a bare test `curl`. |
| Browser shows a CORS error calling the proxy | Set `ALLOW_ORIGIN` to the exact origin of the site (scheme + host + port), or `*` for local testing. |
| `Error: Cannot find package '@anthropic-ai/sdk'` | Run `npm install` at the repo root. |
| `EADDRINUSE` on start | The port is taken. Use `PORT=... npm run api` or `WEB_PORT=... npm run web`. |
| Vercel shows 404 for pages, or `/api/rezforge` 404s | Project Settings → Root Directory must be the repo root (not `apps/web` or `apps/api`) so that `vercel.json` and the root `api/` folder are picked up. Framework Preset should be "Other". |
| GitHub Pages workflow fails at "configure-pages" | Pages isn't enabled with Source = GitHub Actions yet (Settings → Pages). |

---

## Product tour

| Surface | File | What it does |
|---|---|---|
| **Marketing site** | `apps/web/index.html` | Hero, problem framing, features, how-it-works, results, inbox social proof, comparison table, pricing, FAQ |
| **Signup / onboarding** | `apps/web/signup.html` | Collects profile (roles, skills, visa) → creates an account → seeds the pipeline |
| **Client dashboard** | `apps/web/dashboard.html` | Login, KPIs, live application tracker, per-role RezForge™ resume preview, onboarding checklist, empty state for new clients, plan badge |
| **Profile & settings** | `apps/web/profile.html` | Session-gated form to edit target roles, skills, visa, and OPT expiry; changes apply to the next daily cycle |
| **Legal** | `apps/web/legal.html` | Refund policy, privacy, and terms (anchored sections wired from the footer) |
| **Ops console** | `apps/web/admin.html` | Passcode-gated team view: client roster, run daily application cycles, update statuses, aggregate metrics |

### Feature highlights
- **OPT Runway Calculator** ([runway.html](apps/web/runway.html)): enter an OPT start date and degree type to see work-authorization runway, unemployment-days budget, STEM window, and H-1B lottery timing.
- **Dark mode**: a persisted light/dark theme that defaults to the OS setting, applied before first paint, with a floating toggle on every page ([js/theme.js](apps/web/js/theme.js)).
- **Company logos**: real company logos on badges (favicon service) with an automatic monogram fallback.
- **Analytics**: dashboard charts (applications/day, funnel, top companies) from a tiny dependency-free SVG engine.
- **Interview kanban**: move applications across Screening → Interview → Offer → Closed; status persists.
- **Notifications**: a bell and activity feed synthesized from application events, with unread badge and mark-all-read.
- **Referral program**: per-member code and shareable link, "give a month / get a month," credited on referred signups (`?ref=CODE`).
- **Tiered pricing**: Starter / Pro / Elite with a monthly ↔ annual toggle; the plan flows through to signup (`?plan=`).
- **Resource hub**: free OPT / sponsorship / resume guides for SEO and trust.

### Engine & data (`apps/web/js/`)
- **`ai.js`, RezForge™ client**: deterministic (seeded) match scoring, role-tailored resume generation, daily-cycle synthesis, and `generateResumeLive` for the live backend.
- **`store.js`**: the whole demo "backend", a `localStorage` store with seed data, queries, metrics, notifications, referrals, and mutations. Swap these functions for Supabase/REST to go live.
- **`charts.js`**: bar / line / funnel SVG chart helpers (no libraries).
- **`integrations.js`**: the single swap point for **Stripe** (payments) and **Supabase** (auth/DB). Blank keys mean demo mode and no network calls.
- **`config.js`**: single source of truth for brand, pricing, demo credentials, and integration keys.
- **`main.js`**: injects nav/footer/back-to-top, reveal-on-scroll, and the toast helper.

### The business model it demonstrates
- **Niche wedge**: the highest-urgency, highest-willingness-to-pay slice of the job market (visa-clock students).
- **Productized done-for-you**: sells *time back* on a volume-based grind.
- **Anchored pricing**: a flat **$100/mo, no salary commission**, positioned against staffing agencies that take 20–30%.
- **Trust engine**: screenshot social proof, logo wall, and quantified outcomes to overcome scam-wariness.
- **Perceived moat**: proprietary **RezForge™** branding over commodity labor.

---

## License

MIT, see [`LICENSE`](LICENSE).
