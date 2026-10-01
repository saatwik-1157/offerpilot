# apps/web: OfferPilot static site

The published site: plain HTML, CSS, and JavaScript with no build step and no dependencies. Every host (Netlify, Vercel, GitHub Pages) publishes this folder as the site root, so `apps/web/dashboard.html` is served at `/dashboard.html`.

| Path | Contents |
|---|---|
| `*.html` | Pages: `index`, `signup`, `dashboard`, `profile`, `admin`, `guide`, `resources`, `runway`, `legal`, `404` |
| `css/styles.css` | All styles, including light/dark themes |
| `js/config.js` | Brand, pricing, demo credentials, integration keys, `rezforgeEndpoint` |
| `js/store.js` | `localStorage` data layer (the demo "backend") |
| `js/ai.js` | RezForge client: deterministic mock plus `generateResumeLive` for the live API |
| `js/*.js` | Page logic (`dashboard`, `admin`, `guides`), charts, theme, integrations, shared chrome (`main`) |
| `assets/` | Logos, favicons, app icons, OG images |
| `manifest.webmanifest`, `sitemap.xml`, `robots.txt` | PWA manifest and SEO files |

All URLs inside the pages are relative, so the site also works under a subpath (GitHub Pages `/offerpilot/`) and from `file://`. `404.html` derives its `<base>` at runtime so that it works at any depth on either host.

## Run

From the repo root:

```bash
npm run web          # http://localhost:8981   (WEB_PORT=... to change)
```

## Live AI

Set `rezforgeEndpoint` in `js/config.js`:

- `"/api/rezforge"` on Vercel (same origin), which is the default.
- `"http://localhost:8787/api/rezforge"` with `npm run api` locally.
- `""` for demo mode with no network calls.

Any failure falls back to the mock resume. See [`../api`](../api/README.md) for the backend.
