"use client";

// The gap map: cards filtered by search, part of the chain, scope, and the bar's region and country.

import { useState } from "react";
import { setBar, useBar } from "@/lib/bar";
import { SEGMENTS } from "@/lib/chain";
import { makeScope, type CountryLite } from "@/lib/scope";
import type { Gap } from "@/lib/types";
import { GapCard } from "./cards";
import BarNotice, { filterCls } from "./BarNotice";

const text = (g: Gap) =>
  [g.title, g.segment, g.evidence, g.root_causes, g.who_is_working, g.opportunity].join(" ").toLowerCase();

export default function GapsList({ gaps, countries }: { gaps: Gap[]; countries: CountryLite[] }) {
  const bar = useBar();
  const [q, setQ] = useState("");
  const [scope, setScope] = useState("");
  const sc = makeScope(countries, bar.region, bar.country);

  const segment = bar.segment;
  const scopes = [...new Set(gaps.map((g) => g.scope))]
    .filter((s) => s !== "AU")
    .sort((a, b) => sc.nameOf(a).localeCompare(sc.nameOf(b)));
  const shown = gaps
    .filter(
      (g) =>
        (!segment || g.segment === segment) &&
        (!scope || g.scope === scope) &&
        sc.matches([g.scope], true) &&
        (!q || text(g).includes(q.toLowerCase())),
    )
    // Country gaps first when a country or region is chosen, continental ones after.
    .sort((a, b) => (sc.label ? Number(a.scope === "AU") - Number(b.scope === "AU") : 0));

  return (
    <>
      <BarNotice label={sc.label} extra="plus continental gaps" />
      <div className="mt-4 flex flex-wrap items-center gap-2" role="search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search gaps"
          aria-label="Search gaps"
          className={`${filterCls} w-full sm:w-64`}
        />
        <select
          aria-label="Part of the chain (same as Interested in, in the bar)"
          value={segment}
          onChange={(e) => setBar({ segment: e.target.value })}
          className={`${filterCls} w-full sm:w-auto`}
        >
          <option value="">Any part of the chain</option>
          {SEGMENTS.map((s) => (
            <option key={s} value={s}>
              {s} ({gaps.filter((g) => g.segment === s).length})
            </option>
          ))}
        </select>
        <select
          aria-label="Scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className={`${filterCls} w-full sm:w-auto`}
        >
          <option value="">All scopes</option>
          <option value="AU">Continental (all of Africa)</option>
          {scopes.map((s) => (
            <option key={s} value={s}>
              {sc.nameOf(s)}
            </option>
          ))}
        </select>
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {shown.length} of {gaps.length} shown
        </span>
      </div>
      {shown.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((g) => (
            <GapCard key={g.id} gap={g} scopeName={sc.nameOf(g.scope)} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-center text-muted">
          No gaps match. Try another part of the chain, a wider region, or clear the search.
          {sc.label ? " Country-level gaps are documented for the 10 deep-dive countries so far." : ""}
        </p>
      )}
    </>
  );
}
