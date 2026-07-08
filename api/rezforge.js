/* ============================================================
   RezForge™ — serverless function (Vercel / Netlify Node runtime)
   Real Claude-powered resume tailoring. The API key stays server-side
   as an environment variable — never in the browser.

   Deploy the whole repo to Vercel (this file auto-becomes /api/rezforge),
   set ANTHROPIC_API_KEY in the project's env vars, then in js/config.js set:
     rezforgeEndpoint: "/api/rezforge"   // same origin, no CORS needed

   POST body: { profile: {name, skills[], targetRoles[], visa}, job: {company, role} }
   200:       { summary, highlights[], keywords[] }
   ============================================================ */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
const MODEL = process.env.REZFORGE_MODEL || "claude-opus-4-8";

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
  "candidate and target job you produce: a tight one-paragraph summary noting",
  "F-1/OPT work authorization; exactly 3 quantified achievement highlights that",
  "mirror the role's screened skills; and 6 ATS keywords from the candidate's",
  "skills and the role. Never invent employers or fabricate credentials."
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
    "Tailor a resume for this job:",
    `Company: ${job.company}`,
    `Role: ${job.role}`
  ].join("\n");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }

  try {
    // Vercel parses JSON automatically; Netlify/other may pass a string.
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { profile, job } = body;
    if (!job || !job.company || !job.role) {
      res.status(400).json({ error: "job.company and job.role are required" });
      return;
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      output_config: { effort: "low", format: { type: "json_schema", schema: RESUME_SCHEMA } },
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(profile || {}, job) }]
    });

    if (response.stop_reason === "refusal") {
      res.status(400).json({ error: "Request was declined by the safety system." });
      return;
    }
    const textBlock = response.content.find((b) => b.type === "text");
    res.status(200).json(JSON.parse(textBlock.text));
  } catch (err) {
    const status = (err && err.status) || 500;
    res.status(status).json({ error: `RezForge error: ${err && err.message ? err.message : err}` });
  }
}
