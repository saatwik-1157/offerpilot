/* ============================================================
   RezForge™ live server — real Claude-powered resume tailoring
   --------------------------------------------------------------
   A tiny dependency-light Node server (no framework) that the
   OfferPilot dashboard calls. The Anthropic API key lives HERE,
   server-side — never in the browser.

   Run:
     cd server
     npm install
     ANTHROPIC_API_KEY=sk-ant-... node rezforge-server.mjs
     # then set  rezforgeEndpoint: "http://localhost:8787/api/rezforge"
     # in ../js/config.js and reload the dashboard.

   POST /api/rezforge
     body: { profile: {name, skills[], targetRoles[], visa}, job: {company, role} }
     200:  { summary, highlights[], keywords[] }
   ============================================================ */
import http from "node:http";
import Anthropic from "@anthropic-ai/sdk";

const PORT = process.env.PORT || 8787;
// Restrict this to your real site origin in production.
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";
const MODEL = process.env.REZFORGE_MODEL || "claude-opus-4-8";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

// Structured-output schema — RezForge returns exactly this shape, no parsing guesswork.
const RESUME_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    highlights: { type: "array", items: { type: "string" } },
    keywords: { type: "array", items: { type: "string" } }
  },
  required: ["summary", "highlights", "keywords"],
  additionalProperties: false
};

const SYSTEM = [
  "You are RezForge, an expert technical resume writer who tailors resumes for",
  "international students on F-1/OPT visas applying to US roles. For the given",
  "candidate and target job you produce:",
  "- summary: one tight paragraph (2-3 sentences) positioning the candidate for",
  "  THIS role at THIS company, noting F-1/OPT work authorization.",
  "- highlights: exactly 3 achievement bullets, each quantified with a metric,",
  "  mirroring the skills and keywords this role screens for.",
  "- keywords: 6 ATS keywords drawn from the candidate's skills and the role.",
  "Never invent employer names or fabricate credentials; keep it realistic."
].join(" ");

function buildPrompt(profile, job) {
  const skills = (profile.skills || []).join(", ") || "general software skills";
  const roles = (profile.targetRoles || []).join(", ") || job.role;
  return [
    `Candidate: ${profile.name || "Candidate"}`,
    `Work authorization: ${profile.visa || "F-1 OPT"}`,
    `Skills: ${skills}`,
    `Target roles: ${roles}`,
    "",
    `Tailor a resume for this job:`,
    `Company: ${job.company}`,
    `Role: ${job.role}`
  ].join("\n");
}

async function tailorResume(profile, job) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: RESUME_SCHEMA }
    },
    system: SYSTEM,
    messages: [{ role: "user", content: buildPrompt(profile, job) }]
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Request was declined by the safety system.");
  }
  // With output_config.format the first text block is guaranteed valid JSON.
  const textBlock = response.content.find((b) => b.type === "text");
  return JSON.parse(textBlock.text);
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method !== "POST" || !req.url.startsWith("/api/rezforge")) {
    return send(res, 404, { error: "Not found. POST /api/rezforge" });
  }

  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 1e6) req.destroy(); // basic guard against oversized bodies
  });
  req.on("end", async () => {
    try {
      const { profile, job } = JSON.parse(raw || "{}");
      if (!job || !job.company || !job.role) {
        return send(res, 400, { error: "job.company and job.role are required" });
      }
      const resume = await tailorResume(profile || {}, job);
      send(res, 200, resume);
    } catch (err) {
      if (err instanceof Anthropic.APIError) {
        send(res, err.status || 502, { error: `Claude API error: ${err.message}` });
      } else {
        send(res, 400, { error: err.message || "Bad request" });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`RezForge live server on http://localhost:${PORT}/api/rezforge  (model: ${MODEL})`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠  ANTHROPIC_API_KEY is not set — requests will fail until you set it.");
  }
});
