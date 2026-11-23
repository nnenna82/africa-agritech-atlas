// What a visitor can suggest, and the fields for each kind of record.
// Used by the suggestion form (/suggest) and the owner's review page (/admin).

import { SEGMENTS } from "./chain";

export type RecordType = "people" | "startups" | "organizations" | "policies" | "gaps" | "benchmarks";

export type Field = {
  key: string;
  label: string;
  kind: "text" | "textarea" | "number" | "checkbox" | "country" | "countries" | "select" | "tags" | "links" | "url";
  required?: boolean;
  options?: string[];
  /** For "country": also offer "Continental (all of Africa)". */
  continental?: boolean;
  hint?: string;
};

export const RECORD_TYPES: { key: RecordType; label: string; one: string }[] = [
  { key: "people", label: "Person", one: "person" },
  { key: "startups", label: "Startup", one: "startup" },
  { key: "organizations", label: "Organization or funder", one: "organization" },
  { key: "policies", label: "Policy or regulation", one: "policy" },
  { key: "gaps", label: "Gap (an unsolved problem)", one: "gap" },
  { key: "benchmarks", label: "Global example", one: "global example" },
];

export const ORG_TYPES = ["gov", "regulator", "research", "DFI", "investor", "corporate", "NGO", "multilateral"];

export const FIELDS: Record<RecordType, Field[]> = {
  people: [
    { key: "name", label: "Name", kind: "text", required: true },
    { key: "role", label: "Role or job title", kind: "text", required: true },
    { key: "organization", label: "Organization", kind: "text" },
    { key: "countries", label: "Countries they work on", kind: "countries" },
    { key: "focus", label: "What they focus on", kind: "textarea" },
    { key: "talk_to_about", label: "Talk to them about", kind: "text" },
    { key: "diaspora", label: "Works from outside Africa (diaspora)", kind: "checkbox" },
    { key: "based_in", label: "Based in (if diaspora)", kind: "text" },
    {
      key: "public_links",
      label: "Public profile links",
      kind: "links",
      hint: "One link per line, such as an official bio or LinkedIn page. No personal emails or phone numbers.",
    },
  ],
  startups: [
    { key: "name", label: "Startup name", kind: "text", required: true },
    { key: "website", label: "Website", kind: "url" },
    { key: "hq_iso3", label: "Headquarters country", kind: "country" },
    { key: "countries", label: "Countries where it works", kind: "countries" },
    { key: "segment", label: "Part of the chain", kind: "select", options: [...SEGMENTS] },
    { key: "founded", label: "Year founded", kind: "number" },
    { key: "stage", label: "Funding stage", kind: "text", hint: "For example seed, Series A, growth" },
    { key: "status", label: "Status", kind: "select", options: ["active", "restructuring", "pivoted", "acquired", "shut down"] },
    { key: "model", label: "What it does and how it makes money", kind: "textarea" },
    { key: "notable_funding", label: "Notable funding", kind: "text" },
    { key: "diaspora_founded", label: "Founded by diaspora", kind: "checkbox" },
  ],
  organizations: [
    { key: "name", label: "Organization name", kind: "text", required: true },
    { key: "website", label: "Website", kind: "url" },
    { key: "type", label: "Type", kind: "select", options: ORG_TYPES },
    { key: "countries", label: "Countries where it works", kind: "countries" },
    { key: "sector_tags", label: "Parts of the chain", kind: "tags", options: [...SEGMENTS] },
    { key: "what", label: "What they do", kind: "textarea" },
    { key: "funder", label: "Gives funding (investor, lender or donor)", kind: "checkbox" },
  ],
  policies: [
    { key: "title", label: "Policy name", kind: "text", required: true },
    { key: "scope", label: "Country", kind: "country", continental: true, required: true },
    { key: "type", label: "Type", kind: "select", options: ["law", "strategy", "program", "treaty"] },
    { key: "year", label: "Year", kind: "number" },
    { key: "status", label: "Status", kind: "text", hint: "For example active, draft, in force" },
    { key: "summary", label: "What it does, in plain words", kind: "textarea" },
    { key: "link", label: "Link to the policy", kind: "url" },
  ],
  gaps: [
    { key: "title", label: "The problem, in a few words", kind: "text", required: true },
    { key: "scope", label: "Country", kind: "country", continental: true, required: true },
    { key: "segment", label: "Part of the chain", kind: "select", options: [...SEGMENTS], required: true },
    { key: "evidence", label: "Evidence (a figure and where it comes from)", kind: "textarea", required: true },
    { key: "root_causes", label: "Why it persists", kind: "textarea" },
    { key: "who_is_working", label: "Who is working on it", kind: "textarea" },
    { key: "opportunity", label: "Where someone could act", kind: "textarea" },
  ],
  benchmarks: [
    { key: "source_country", label: "Country", kind: "text", required: true, hint: "Outside Africa, or an African peer" },
    { key: "theme", label: "What they did, in a few words", kind: "text", required: true },
    { key: "what_happened", label: "What happened", kind: "textarea" },
    { key: "outcome", label: "Outcome, with figures", kind: "textarea" },
    { key: "transferability", label: "Would it work in Africa?", kind: "textarea", hint: "Start with High, Medium or Low" },
    { key: "link", label: "Link", kind: "url" },
  ],
};

/** The name or title of a record, for lists. */
export const recordLabel = (r: Record<string, unknown>) =>
  String(r.name ?? r.title ?? r.theme ?? r.id ?? "Untitled");

/** Looks like a personal email address or phone number (never stored for people). */
export function looksPrivate(s: string): boolean {
  const text = s.replace(/https?:\/\/\S+/g, "");
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(text)) return true;
  // A run of 9 or more digits with spaces or dashes, like +254 712 345 678 (a year range like 2019-2023 is fine).
  return (text.match(/\+?\d[\d\s().-]{7,}\d/g) ?? []).some((m) => m.replace(/\D/g, "").length >= 9);
}

export type Values = Record<string, string | boolean | string[]>;

/** Turn form values into a clean record: trims text, makes numbers and lists, drops empty fields. */
export function toRecord(type: RecordType, v: Values): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of FIELDS[type]) {
    const raw = v[f.key];
    if (f.kind === "checkbox") {
      if (raw === true) out[f.key] = true;
    } else if (f.kind === "countries" || f.kind === "tags") {
      if (Array.isArray(raw) && raw.length) out[f.key] = raw;
    } else if (f.kind === "links") {
      const list = String(raw ?? "")
        .split(/\s+/)
        .map((x) => x.trim())
        .filter((x) => /^https?:\/\//i.test(x));
      if (list.length) out[f.key] = list;
    } else if (f.kind === "number") {
      const n = parseInt(String(raw ?? ""), 10);
      if (!Number.isNaN(n)) out[f.key] = n;
    } else {
      const t = String(raw ?? "").trim();
      if (t) out[f.key] = t.slice(0, 1500);
    }
  }
  return out;
}

/** The reverse of toRecord, to show a saved suggestion in the form fields. */
export function toValues(type: RecordType, r: Record<string, unknown>): Values {
  const v: Values = {};
  for (const f of FIELDS[type]) {
    const x = r[f.key];
    if (x == null) continue;
    if (f.kind === "checkbox") v[f.key] = x === true;
    else if (f.kind === "countries" || f.kind === "tags") v[f.key] = Array.isArray(x) ? x.map(String) : [];
    else if (f.kind === "links") v[f.key] = Array.isArray(x) ? x.join("\n") : String(x);
    else v[f.key] = String(x);
  }
  return v;
}
