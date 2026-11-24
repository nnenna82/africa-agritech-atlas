// "Ask the Atlas": answers a visitor's question using only Atlas records.
//
// Settings (Vercel → Project → Settings → Environment Variables; never in the code):
//   PARLEY_API_KEY        the course's Parley key (required)
//   PARLEY_BASE_URL       Parley's web address, if it is not the standard Anthropic address
//   SUPABASE_SECRET_KEY   Supabase "secret" key, so only this server can update the spending totals (required)
//   CHAT_MODEL            optional, default claude-opus-5-5
//   CHAT_DAILY_BUDGET_USD optional, default 0.90  (stop answering for the day after this much)
//   CHAT_MONTHLY_BUDGET_USD optional, default 25  (stop for the month; Parley's own hard limit is $30)
//   CHAT_PER_VISITOR      optional, default 10 questions per visitor per day
// Without PARLEY_API_KEY and SUPABASE_SECRET_KEY the chat stays switched off.

import Anthropic from "@anthropic-ai/sdk";
import { createHmac } from "node:crypto";
import { getAtlas } from "@/lib/data";
import { buildSnippets, pickSnippets, words } from "@/lib/ask";
import { chatEnabled } from "@/lib/chat-config";

const MODEL = process.env.CHAT_MODEL || "claude-opus-5-5";
// US$ per million tokens (input, output). Unknown models are priced like Opus to stay on the safe side.
const PRICES: Record<string, [number, number]> = {
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5-5": [2, 10],
  "claude-haiku-5-5": [0.1, 0.5],
};
const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);
const DAILY = num(process.env.CHAT_DAILY_BUDGET_USD, 0.9);
const MONTHLY = num(process.env.CHAT_MONTHLY_BUDGET_USD, 25);
const PER_VISITOR = num(process.env.CHAT_PER_VISITOR, 10);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;


const SYSTEM = `You answer questions for the Africa AgriTech Atlas, a public guide to agriculture and the infrastructure that serves it across Africa's 54 countries. Visitors are students, founders, investors, policy professionals and researchers who want to find a real problem and the right people to talk to.

Rules:
- Use only the numbered Atlas records in the message. Do not add facts, figures, names or links from anywhere else.
- If the records do not answer the question, say so plainly in one sentence, then suggest which Atlas page to look at (Gaps, People, Startups, Organizations, Regulation, Global, News, or a country page).
- Cite the records you use with their numbers in square brackets, like [3].
- Plain English, short sentences, no jargon without a short explanation. Aim for 80 to 200 words. Use a short list only when it helps.
- Countries are grouped from Early stage to Leading compared with other African countries. Never give or invent a numeric score.
- When suggesting people, use only their public role and what to talk to them about. Never suggest contacting anyone privately or guess contact details.
- If a record says it is being checked, mention that the detail may have changed.
- Questions outside African agriculture and its infrastructure: say briefly that the Atlas only covers that.`;

function db(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = { apikey: SECRET!, "Content-Type": "application/json" };
  if (SECRET!.startsWith("eyJ")) headers.Authorization = `Bearer ${SECRET}`; // older-style keys also need this header
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...headers, ...(init.headers as object) }, cache: "no-store" });
}

const reply = (status: number, body: object) => Response.json(body, { status });

export async function POST(req: Request) {
  if (!chatEnabled()) return reply(503, { error: "off", message: "The chat is not switched on yet." });

  let body: { question?: unknown; country?: unknown };
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "bad", message: "Please type a question." });
  }
  const question = String(body.question ?? "").trim().replace(/\s+/g, " ");
  const country = /^[A-Z]{3}$/.test(String(body.country ?? "")) ? String(body.country) : "";
  if (question.length < 5 || question.length > 500)
    return reply(400, { error: "bad", message: "Please ask a question between 5 and 500 characters long." });

  // 1. A saved answer to the same question (same country) costs nothing.
  const qkey = `${country}|${words(question).sort().join(" ")}`.slice(0, 500);
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  try {
    const r = await db(`chat_cache?select=answer&qkey=eq.${encodeURIComponent(qkey)}&created_at=gte.${weekAgo}`);
    const rows = r.ok ? ((await r.json()) as { answer: object }[]) : [];
    if (rows[0]) return reply(200, { ...rows[0].answer, saved: true });
  } catch {
    // carry on without the saved copy
  }

  // 2. Spending and per-visitor limits, checked in the database.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const visitor = createHmac("sha256", SECRET!).update(ip).digest("hex").slice(0, 32);
  const gate = await db("rpc/chat_try_start", {
    method: "POST",
    body: JSON.stringify({ p_visitor: visitor, p_daily_usd: DAILY, p_monthly_usd: MONTHLY, p_per_visitor: PER_VISITOR }),
  });
  if (!gate.ok) return reply(503, { error: "off", message: "The chat is resting right now. Please try again later." });
  const verdict = (await gate.json()) as string;
  if (verdict === "visitor_limit")
    return reply(429, { error: "limit", message: `You have asked ${PER_VISITOR} questions today, the daily limit. Please come back tomorrow.` });
  if (verdict !== "ok")
    return reply(429, { error: "limit", message: "The chat has answered all the questions it can afford today. Please come back tomorrow, or explore the Atlas pages." });

  // 3. Find the related Atlas records.
  const atlas = await getAtlas();
  const snippets = pickSnippets(buildSnippets(atlas), question, country);
  const context = snippets.map((s, i) => `[${i + 1}] ${s.title}\n${s.text}`).join("\n\n");
  const countryName = country ? atlas.countries.find((c) => c.iso3 === country)?.name : null;

  // 4. Ask the model.
  const client = new Anthropic({
    apiKey: process.env.PARLEY_API_KEY,
    ...(process.env.PARLEY_BASE_URL ? { baseURL: process.env.PARLEY_BASE_URL } : {}),
    maxRetries: 1,
    timeout: 60_000,
  });
  const userContent = `Atlas records:\n\n${context || "(no matching records)"}\n\n---\n${countryName ? `The visitor has chosen ${countryName} in the site's country filter.\n` : ""}Question: ${question}`;
  const request = {
    model: MODEL,
    max_tokens: 2000,
    output_config: { effort: "low" as const },
    system: SYSTEM,
    messages: [{ role: "user" as const, content: userContent }],
  };

  let message: Anthropic.Message | Anthropic.Beta.BetaMessage;
  try {
    try {
      // If a safety check declines, the API retries on a suitable other model inside the same call.
      message = await client.beta.messages.create({
        ...request,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
    } catch (err) {
      // Some gateways do not accept that option: ask again without it.
      if (err instanceof Anthropic.BadRequestError) message = await client.messages.create(request);
      else throw err;
    }
  } catch (err) {
    console.error("[ask] model call failed", err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
    if (err instanceof Anthropic.RateLimitError)
      return reply(429, { error: "busy", message: "The chat is busy. Please try again in a minute." });
    return reply(502, { error: "failed", message: "Sorry, the chat could not answer just now. Please try again later." });
  }

  // 5. Count what it actually cost.
  const [pin, pout] = PRICES[MODEL] ?? PRICES["claude-opus-5-5"];
  const u = message.usage;
  const inputTokens = u.input_tokens + (u.cache_creation_input_tokens ?? 0) * 1.25 + (u.cache_read_input_tokens ?? 0) * 0.1;
  const cost = (inputTokens * pin + u.output_tokens * pout) / 1e6;
  await db("rpc/chat_record_cost", { method: "POST", body: JSON.stringify({ p_cost: Number(cost.toFixed(5)) }) }).catch(() => null);

  if (message.stop_reason === "refusal")
    return reply(200, { answer: "Sorry, I can't help with that question. The Atlas covers farming and its infrastructure in Africa.", sources: [] });

  const answer = message.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  if (!answer) return reply(502, { error: "failed", message: "Sorry, the chat could not answer just now. Please try again later." });

  // Only list the records the answer actually cites.
  const cited = new Set([...answer.matchAll(/\[(\d{1,2})\]/g)].map((m) => Number(m[1])));
  const sources = snippets
    .map((s, i) => ({ n: i + 1, title: s.title, href: s.href }))
    .filter((s) => cited.has(s.n));
  const result = { answer, sources, truncated: message.stop_reason === "max_tokens" };

  // 6. Save it for a week, so the same question is free next time.
  await db("chat_cache", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ qkey, answer: result, created_at: new Date().toISOString() }),
  }).catch(() => null);

  return reply(200, result);
}
