// "Ask the Atlas": find the Atlas records most related to a question.
// Simple word matching, no AI: each record becomes a short text snippet with a link,
// and the snippets that share the most words with the question are sent to the model.

import type { Atlas } from "./types";
import { computeTiers, tierName } from "./groups";

export type Snippet = { title: string; href: string; text: string; iso: string[] };

const STOP = new Set(
  "a an and are as at be by can do does for from how i in is it its me my of on or that the their there this to was what when where which who why will with you your about into than then them they africa african should could would talk work works working ones holding back lead leads most more best tell know need".split(
    " ",
  ),
);

// Words that mean the same thing for matching purposes.
const SAME: Record<string, string> = { failed: "shut", fail: "shut", failure: "shut", closed: "shut", collapse: "shut", collapsed: "shut", loan: "credit", loans: "credit", lending: "credit", fridge: "cold", refrigeration: "cold", cooling: "cold" };
/** Very light stemming, so "startups" matches "startup" and "storing" matches "store". */
const stem = (w: string) => SAME[w] ?? w.replace(/(ing|ies|es|s)$/, (m) => (m === "ies" ? "y" : "")).replace(/(.{4,})ed$/, "$1");

export const words = (s: string) =>
  (s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z0-9]+/g) ?? [])
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map(stem);

const cut = (s: string | null | undefined, n = 400) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

/** Turn every Atlas record into a snippet. */
export function buildSnippets(atlas: Atlas): Snippet[] {
  const tiers = computeTiers(atlas.countries);
  const name = new Map(atlas.countries.map((c) => [c.iso3, c.name]));
  const nm = (i: string) => (i === "AU" ? "Africa-wide" : (name.get(i) ?? i));
  const out: Snippet[] = [];

  for (const c of atlas.countries) {
    const ind = c.atlas?.indicators ?? {};
    out.push({
      title: `${c.name} country profile`,
      href: `/country/${c.iso3}`,
      iso: [c.iso3],
      text: [
        `${c.name} (${c.region} Africa). Atlas group: ${tierName(tiers[c.iso3] ?? null)}.`,
        c.ag_gdp_pct != null ? `Farming is ${c.ag_gdp_pct}% of GDP.` : "",
        c.ag_jobs_pct != null ? `${c.ag_jobs_pct}% of jobs are in farming.` : "",
        ind.cereal_yield_t_ha != null ? `Cereal yield ${ind.cereal_yield_t_ha} t/ha.` : "",
        ind.fertilizer_kg_ha != null ? `Fertilizer ${ind.fertilizer_kg_ha} kg/ha.` : "",
        c.electricity_access_pct != null ? `Electricity access ${c.electricity_access_pct}%.` : "",
        cut(c.narrative || c.summary, 600),
        c.flagship_programs?.length ? `Flagship programs: ${c.flagship_programs.join("; ")}.` : "",
      ].join(" "),
    });
  }
  for (const g of atlas.gaps)
    out.push({
      title: `Gap: ${g.title} (${nm(g.scope)})`,
      href: "/gaps",
      iso: [g.scope],
      text: `${g.segment ?? ""}. Evidence: ${cut(g.evidence)} Root causes: ${cut(g.root_causes, 250)} ${g.who_is_working ? `Who is working on it: ${cut(g.who_is_working, 200)}` : ""} ${g.opportunity ? `Opportunity: ${cut(g.opportunity, 250)}` : ""}`,
    });
  for (const p of atlas.people)
    out.push({
      title: `Person: ${p.name}`,
      href: "/people",
      iso: p.countries ?? [],
      text: `${p.role ?? ""}, ${p.organization ?? ""}. Countries: ${(p.countries ?? []).map(nm).join(", ")}. Focus: ${cut(p.focus, 200)} Talk to them about: ${cut(p.talk_to_about, 200)}${p.needs_review ? " (role being checked)" : ""}`,
    });
  for (const s of atlas.startups)
    out.push({
      title: `Startup: ${s.name}`,
      href: "/startups",
      iso: [...(s.countries ?? []), s.hq_iso3 ?? ""],
      text: `${s.segment ?? ""}. Countries: ${(s.countries ?? []).map(nm).join(", ")}. Status: ${cut(s.status, 150)}. ${cut(s.model, 250)} Funding: ${cut(s.notable_funding, 150)}`,
    });
  for (const o of atlas.organizations)
    out.push({
      title: `Organization: ${o.name}`,
      href: "/organizations",
      iso: o.countries ?? [],
      text: `${o.type ?? ""}${o.funder ? ", funder" : ""}. Countries: ${(o.countries ?? []).map(nm).join(", ")}. ${cut(o.what, 250)} Areas: ${(o.sector_tags ?? []).join(", ")}`,
    });
  for (const p of atlas.policies)
    out.push({
      title: `Policy: ${p.title} (${nm(p.scope)})`,
      href: "/regulation",
      iso: [p.scope],
      text: `${p.type ?? ""}, ${p.year ?? ""}, ${p.status ?? ""}. ${cut(p.summary, 300)}`,
    });
  for (const b of atlas.benchmarks)
    out.push({
      title: `Global example: ${b.source_country}: ${b.theme}`,
      href: "/global",
      iso: [],
      text: `${cut(b.what_happened, 300)} Outcome: ${cut(b.outcome, 250)} For Africa: ${cut(b.transferability, 200)}`,
    });
  for (const n of atlas.news.slice(0, 40))
    out.push({
      title: `News (${n.date}): ${n.headline}`,
      href: "/news",
      iso: n.countries ?? [],
      text: `${cut(n.summary, 300)} Why it matters: ${cut(n.why, 200)}`,
    });
  return out;
}

/** The snippets that best match the question (and the visitor's chosen country, if any). */
export function pickSnippets(all: Snippet[], question: string, country: string, limit = 24): Snippet[] {
  const q = new Set(words(question));
  const countryHits = new Set<string>();
  // A country named in the question counts like a chosen country.
  for (const s of all)
    if (s.href.startsWith("/country/") && words(s.title.replace(" country profile", "")).every((w) => q.has(w)))
      countryHits.add(s.iso[0]);
  if (country) countryHits.add(country);

  const scored = all.map((s) => {
    const ws = words(`${s.title} ${s.text}`);
    const inTitle = new Set(words(s.title));
    let score = 0;
    const seen = new Set<string>();
    for (const w of ws) {
      if (!q.has(w) || seen.has(w)) continue;
      seen.add(w);
      score += (w.length > 5 ? 2 : 1) * (inTitle.has(w) ? 2 : 1);
    }
    if (s.iso.some((i) => countryHits.has(i))) score += 3;
    if (s.iso.includes("AU")) score += 0.5;
    return { s, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}
