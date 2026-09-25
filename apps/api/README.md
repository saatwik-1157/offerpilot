# apps/api: RezForge backend

Generates tailored resumes with Claude. The Anthropic API key stays here, server-side. Both entry points take the same request and return the same shape:

```
POST /api/rezforge
body: { "profile": { "name", "skills": [], "targetRoles": [], "visa" }, "job": { "company", "role" } }
200:  { "summary": "...", "highlights": ["..."], "keywords": ["..."] }
400:  { "error": "job.company and job.role are required" }
```

| Entry point | File | Runs on |
|---|---|---|
| Serverless function | `functions/rezforge.js` | Vercel. Uses the Node `(req, res)` signature. The root `api/rezforge.js` re-exports it because Vercel only deploys functions from a root `api/` directory. Not compatible with Netlify Functions. |
| Standalone proxy | `server/rezforge-server.mjs` | Any Node 18+ host. Uses `node:http` with no framework. |

## Environment

| Variable | Default | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | none | Required for real responses; read by `@anthropic-ai/sdk` |
| `REZFORGE_MODEL` | `claude-opus-4-8` | |
| `ALLOW_ORIGIN` | `*` | CORS; set it to your site's origin in production |
| `PORT` | `8787` | Standalone proxy only |

A template is in [`../../.env.example`](../../.env.example).

## Run

From the repo root (a root `npm install` provides `@anthropic-ai/sdk`):

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run api      # or: npm run api:env  (reads .env, Node 20.6+)
```

Or standalone from this folder: `npm install && npm start`.

Without a key the server still starts, prints a warning, and answers requests with a `400` authentication error. The web client then falls back to its mock resume.
