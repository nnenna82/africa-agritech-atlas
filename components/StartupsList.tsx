"use client";

// Startups directory: search, part of the chain (same as the bar), country, status, diaspora-founded,
// plus the bar's region and country. A table on wide screens, cards on phones.
// Startups that shut down or changed course stay listed on purpose.

import { useState } from "react";
import { setBar, useBar } from "@/lib/bar";
import { SEGMENTS } from "@/lib/chain";
import { isUrl } from "@/lib/format";
import { makeScope, type CountryLite } from "@/lib/scope";
import type { Startup } from "@/lib/types";
import BarNotice, { filterCls } from "./BarNotice";
import { StartupCard, startupStatus } from "./cards";
import { ReviewNote } from "./ui";

const text = (s: Startup) => [s.name, s.segment, s.model, s.notable_funding, s.status, s.stage].join(" ").toLowerCase();

export function StatusChip({ status }: { status: string | null }) {
  const st = startupStatus(status);
  const tone = st.tone === "ok" ? "bg-accent-soft text-fg" : st.tone === "stop" ? "bg-fg text-bg" : "bg-gold-soft text-fg";
  return <span className={`inline-block whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[11px] ${tone}`}>{st.label}</span>;
}

export default function StartupsList({ startups, countries }: { startups: Startup[]; countries: CountryLite[] }) {
  const bar = useBar();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");
  const [diaspora, setDiaspora] = useState(false);
  const sc = makeScope(countries, bar.region, bar.country);
  const where = (s: Startup) => [...(s.countries ?? []), s.hq_iso3];

  const present = new Set(startups.flatMap(where).filter(Boolean) as string[]);
  const options = bar.country ? [] : countries.filter((c) => present.has(c.iso3) && (!bar.region || c.region === bar.region));
  const localCountry = options.some((c) => c.iso3 === country) ? country : "";

  const shown = startups
    .filter(
      (s) =>
        sc.matches(where(s)) &&
        (!bar.segment || s.segment === bar.segment) &&
        (!localCountry || where(s).includes(localCountry)) &&
        (!status || (status === "active" ? startupStatus(s.status).label === "active" : startupStatus(s.status).label !== "active")) &&
        (!diaspora || s.diaspora_founded) &&
        (!q || text(s).includes(q.toLowerCase())),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <BarNotice label={sc.label} />
      <div className="mt-4 flex flex-wrap items-center gap-2" role="search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search startups"
          aria-label="Search startups"
          className={`${filterCls} w-full sm:w-56`}
        />
        <select
          aria-label="Part of the chain (same as Interested in, in the bar)"
          value={bar.segment}
          onChange={(e) => setBar({ segment: e.target.value })}
          className={`${filterCls} w-full sm:w-auto`}
        >
          <option value="">Any part of the chain</option>
          {SEGMENTS.map((s) => (
            <option key={s} value={s}>
              {s} ({startups.filter((x) => x.segment === s).length})
            </option>
          ))}
        </select>
        {options.length ? (
          <select aria-label="Country" value={localCountry} onChange={(e) => setCountry(e.target.value)} className={`${filterCls} w-full sm:w-auto`}>
            <option value="">{bar.region ? `All of ${bar.region} Africa` : "All countries"}</option>
            {options.map((c) => (
              <option key={c.iso3} value={c.iso3}>
                {c.name}
              </option>
            ))}
          </select>
        ) : null}
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={`${filterCls} w-full sm:w-auto`}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="other">Shut down, changed course or not confirmed</option>
        </select>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={diaspora} onChange={(e) => setDiaspora(e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
          Diaspora-founded
        </label>
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {shown.length} of {startups.length} shown
        </span>
      </div>

      {!shown.length ? (
        <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-center text-muted">
          No startups match. Try a wider region, another part of the chain, or clear the search.
        </p>
      ) : (
        <>
          {/* Phones: cards */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:hidden">
            {shown.map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
          {/* Wider screens: a table */}
          <div className="mt-5 hidden overflow-x-auto rounded-lg border border-line bg-surface md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Startups, sorted by name</caption>
              <thead className="bg-sunk font-mono text-[11px] uppercase tracking-widest text-muted">
                <tr>
                  <th scope="col" className="p-3">Startup</th>
                  <th scope="col" className="p-3">Part of the chain</th>
                  <th scope="col" className="p-3">Countries</th>
                  <th scope="col" className="p-3 text-right">Founded</th>
                  <th scope="col" className="p-3">Status</th>
                  <th scope="col" className="p-3">What it does</th>
                  <th scope="col" className="p-3">Funding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line align-top">
                {shown.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className="p-3 font-semibold">
                      {isUrl(s.website) ? (
                        <a href={s.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                          {s.name}
                          <span className="sr-only"> (website, opens in a new tab)</span>
                        </a>
                      ) : (
                        s.name
                      )}
                      {s.diaspora_founded ? <span className="ml-1 rounded bg-gold-soft px-1 font-mono text-[10px] font-normal">diaspora</span> : null}
                      <ReviewNote needs={s.needs_review} note={s.review_note} />
                    </th>
                    <td className="min-w-32 p-3 text-muted">{s.segment}</td>
                    <td className="min-w-28 p-3 text-muted">{(s.countries ?? []).map(sc.nameOf).join(", ")}</td>
                    <td className="p-3 text-right font-mono tabular-nums">{s.founded ?? "–"}</td>
                    <td className="p-3" title={s.status ?? undefined}>
                      <StatusChip status={s.status} />
                    </td>
                    <td className="min-w-56 p-3">{s.model}</td>
                    <td className="min-w-40 p-3 text-muted">{s.notable_funding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
