// Developer check: shows which Atlas records the chat would send for a few sample questions. No AI is called.
// Run: npx tsx scripts/try-ask-retrieval.mts
import fs from "node:fs";
import { buildSnippets, pickSnippets } from "../lib/ask";
const read = (f: string) => JSON.parse(fs.readFileSync(`data/${f}.json`, "utf8"));
const atlas = {
  countries: read("countries"), organizations: read("organizations"), people: read("people"), startups: read("startups"),
  policies: read("policies"), gaps: read("gaps"), benchmarks: read("benchmarks"), news: read("news"), meta: read("meta"), source: "files",
};
const all = buildSnippets(atlas as never);
const chars = all.reduce((n, s) => n + s.text.length, 0);
console.log(`${all.length} snippets, ${chars} characters in total`);
for (const q of ["Who should I talk to about cold storage in Nigeria?", "Why does Kenya lead East Africa in farm technology?", "Which startups work on farm finance, and which ones failed?", "What is holding back irrigation in Africa?"]) {
  const picked = pickSnippets(all, q, "");
  const size = picked.reduce((n, s) => n + s.title.length + s.text.length, 0);
  console.log(`\nQ: ${q}  (${picked.length} records, ~${Math.round(size / 4)} tokens)`);
  picked.slice(0, 8).forEach((s) => console.log("  -", s.title));
}
