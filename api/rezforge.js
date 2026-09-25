/* Vercel entry point for POST /api/rezforge.
   Vercel only deploys serverless functions from an `api/` directory at the
   project root, so this file stays here as a one-line shim. The real handler
   lives in apps/api/functions/rezforge.js; Vercel's file tracing bundles it
   (and @anthropic-ai/sdk from the root package.json) automatically. */
export { default } from "../apps/api/functions/rezforge.js";
