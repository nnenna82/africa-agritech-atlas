"use client";

// Regulation tracker: newest first. Search, kind, scope, plus the bar's region and country
// (continental frameworks always show).

import { useState } from "react";
import { useBar } from "@/lib/bar";
import { makeScope, type CountryLite } from "@/lib/scope";
import type { Policy } from "@/lib/types";
import BarNotice, { filterCls } from "./BarNotice";
import { PolicyCard } from "./cards";

/** The type field is free text; group it into four plain kinds for the filter. */
export function policyKind(t: string | null): string {
  const s = (t ?? "").toLowerCase();
  if (/treaty|declaration|summit|decision|regulations/.test(s)) return "Agreements and declarations";
  if (/law/.test(s)) return "Laws";
  if (/strategy|framework|blueprint|policy/.test(s)) return "Strategies and plans";
  return "Programs";
}
const KINDS = ["Laws", "Strategies and plans", "Programs", "Agreements and declarations"];
const text = (p: Policy) => [p.title, p.type, p.status, p.summary].join(" ").toLowerCase();

export default function PoliciesList({ policies, countries }: { policies: Policy[]; countries: CountryLite[] }) {
  const bar = useBar();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [scope, setScope] = useState("");
  const sc = makeScope(countries, bar.region, bar.country);
  const scopes = [...new Set(policies.map((p) => p.scope))]
    .filter((s) => s !== "AU")
    .filter((s) => sc.matches([s]))
    .sort((a, b) => sc.nameOf(a).localeCompare(sc.nameOf(b)));
  const localScope = scope === "AU" || scopes.includes(scope) ? scope : "";

  const shown = policies
    .filter(
      (p) =>
        sc.matches([p.scope], true) &&
        (!kind || policyKind(p.type) === kind) &&
        (!localScope || p.scope === localScope) &&
        (!q || text(p).includes(q.toLowerCase())),
    )
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));

  return (
    <>
      <BarNotice label={sc.label} extra="plus continental frameworks" />
      <div className="mt-4 flex flex-wrap items-center gap-2" role="search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search policies"
          aria-label="Search policies"
          className={`${filterCls} w-full sm:w-56`}
        />
        <select aria-label="Kind" value={kind} onChange={(e) => setKind(e.target.value)} className={`${filterCls} w-full sm:w-auto`}>
          <option value="">All kinds</option>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k} ({policies.filter((p) => policyKind(p.type) === k).length})
            </option>
          ))}
        </select>
        <select aria-label="Scope" value={localScope} onChange={(e) => setScope(e.target.value)} className={`${filterCls} w-full sm:w-auto`}>
          <option value="">All scopes</option>
          <option value="AU">Continental (all of Africa)</option>
          {scopes.map((s) => (
            <option key={s} value={s}>
              {sc.nameOf(s)}
            </option>
          ))}
        </select>
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {shown.length} of {policies.length} shown
        </span>
      </div>
      {shown.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <PolicyCard key={p.id} policy={p} scopeName={sc.nameOf(p.scope)} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-center text-muted">
          No policies match. Try a wider region or clear the search. Country policies are recorded for the 10 deep-dive
          countries so far.
        </p>
      )}
    </>
  );
}
