/* Zero-dependency static server for apps/web (local development only).
   Usage: npm run web            -> http://localhost:8981
          WEB_PORT=8400 npm run web
   Serves index.html for "/", 404.html (status 404) for missing paths --
   the same behaviour as netlify.toml. */
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../apps/web");
const PORT = Number(process.env.WEB_PORT) || 8981;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".ico": "image/x-icon"
};

async function fileFor(urlPath) {
  const rel = decodeURIComponent(urlPath.split("?")[0]);
  const abs = path.resolve(ROOT, "." + (rel.endsWith("/") ? rel + "index.html" : rel));
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null; // no path traversal
  try { return (await stat(abs)).isFile() ? abs : null; } catch { return null; }
}

http.createServer(async (req, res) => {
  let status = 200;
  let file = await fileFor(req.url).catch(() => null);
  if (!file) { status = 404; file = path.join(ROOT, "404.html"); }
  const body = await readFile(file);
  res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  res.end(req.method === "HEAD" ? undefined : body);
}).listen(PORT, () => console.log(`OfferPilot web on http://localhost:${PORT}  (serving ${ROOT})`));
