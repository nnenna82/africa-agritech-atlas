"use client";

// Global page: the comparison bars (Africa's median vs other countries, plus the bar's country)
// and the "Playbooks that closed the gap" tabs.

import { useState } from "react";
import { useBar } from "@/lib/bar";
import { roleLabel } from "@/lib/chain";
import { MEASURES, PLAYBOOK_REGIONS, ROLE_MATCH, playbookRegion, transferLevel, type PlaybookRegion } from "@/lib/global";
import { host, isUrl } from "@/lib/format";
import type { Benchmark } from "@/lib/types";
import { filterCls } from "./BarNotice";
import { Card, Chip, ReviewNote } from "./ui";

export type CountryValues = { iso3: string; name: string; values: Record<string, number | null> };

const fmt = (v: number, d: number) => v.toLocaleString("en", { maximumFractionDigits: d });

export function Compare({ medians, countries }: { medians: Record<string, number | null>; countries: CountryValues[] }) {
  const bar = useBar();
  const [key, setKey] = useState(MEASURES[0].key);
  const M = MEASURES.find((m) => m.key === key)!;
  const africa = medians[M.key];
  const C = bar.country ? countries.find((c) => c.iso3 === bar.country) : undefined;
  const cv = C?.values[M.key] ?? null;

  const rows: { name: string; v: number; kind: "africa" | "me" | "other" }[] = [
    ...(africa != null ? [{ name: "Africa (median)", v: africa, kind: "africa" as const }] : []),
    ...(C && cv != null ? [{ name: `${C.name} (your choice)`, v: cv, kind: "me" as const }] : []),
    ...M.rows.map(([name, v]) => ({ name, v, kind: "other" as const })),
  ];
  const max = Math.max(...rows.map((r) => r.v));
  const india = M.rows.find((r) => r[0] === "India");
  const ratio = (x: number) => (africa ? Math.round((x / africa) * 10) / 10 : null);

  return (
    <section aria-labelledby="cmp-title" className="mt-8 rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="cmp-title" className="font-display text-2xl font-bold">
            {M.title}
          </h2>
          <p className="text-sm text-muted">
            {M.unit}, {M.year}. Source: {M.source}.
          </p>
        </div>
        <label className="text-sm font-medium">
          <span className="sr-only">Measure</span>
          <select value={key} onChange={(e) => setKey(e.target.value as typeof key)} className={filterCls}>
            {MEASURES.map((m) => (
              <option key={m.key} value={m.key}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="mt-5 space-y-3">
        {rows.map((r) => (
          <li key={r.name} className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)_auto] items-center gap-3 text-sm sm:grid-cols-[12rem_minmax(0,1fr)_auto]">
            <span className={r.kind === "other" ? "" : "font-semibold"}>{r.name}</span>
            <span className="h-4 overflow-hidden rounded-sm bg-sunk" aria-hidden="true">
              <span
                className="block h-full rounded-sm"
                style={{
                  width: `${Math.max(1.5, (r.v / max) * 100)}%`,
                  background: r.kind === "africa" ? "var(--gold)" : r.kind === "me" ? "var(--accent)" : "var(--t3)",
                }}
              />
            </span>
            <span className="text-right font-mono tabular-nums">{fmt(r.v, M.digits)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">
        {india && ratio(india[1]) != null ? `India is at ${ratio(india[1])}× Africa's median. ` : ""}
        {C && cv != null && ratio(cv) != null ? `${C.name} is at ${ratio(cv)}×. ` : ""}
        {C && cv == null ? `Not enough data for ${C.name} on this measure. ` : ""}
        {!C ? "Pick a country in the bar above to add it to the comparison. " : ""}
        Africa&rsquo;s figure is the middle value of the African countries with data, so big producers like Egypt and
        South Africa do not pull it up.
      </p>
    </section>
  );
}

export function Playbooks({ benchmarks }: { benchmarks: Benchmark[] }) {
  const bar = useBar();
  const [region, setRegion] = useState<PlaybookRegion>("asia");
  const [q, setQ] = useState("");
  const re = ROLE_MATCH[bar.role];
  const matchesRole = (b: Benchmark) => !!re && re.test(`${b.theme} ${b.what_happened ?? ""}`);
  const all = benchmarks.filter(
    (b) => !q || [b.source_country, b.theme, b.what_happened, b.outcome, b.transferability].join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  const list = (q ? all : all.filter((b) => playbookRegion(b) === region)).sort(
    (a, b) => Number(matchesRole(b)) - Number(matchesRole(a)),
  );

  return (
    <section aria-labelledby="pb-title" className="mt-12">
      <h2 id="pb-title" className="font-display text-2xl font-bold">
        Playbooks that closed the gap
      </h2>
      <p className="mt-1 max-w-prose text-muted">
        What other countries did, what it achieved, and how well it would work in African conditions.
        {re ? ` Examples most useful to a ${roleLabel(bar.role).toLowerCase()} are marked "for you" and listed first.` : ""}
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Where the example comes from">
        {PLAYBOOK_REGIONS.map((r) => {
          const on = r.key === region && !q;
          return (
            <button
              key={r.key}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setRegion(r.key);
                setQ("");
              }}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                on ? "border-accent bg-accent text-surface" : "border-line bg-surface text-fg hover:bg-sunk"
              }`}
            >
              {r.label} <span className="font-mono text-xs opacity-80">{benchmarks.filter((b) => playbookRegion(b) === r.key).length}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search all examples"
          aria-label="Search all global examples"
          className={`${filterCls} w-full sm:w-64`}
        />
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {list.length} shown
        </span>
      </div>
      {list.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => {
            const lvl = transferLevel(b.transferability);
            const tone = lvl === "High" ? "bg-accent-soft" : lvl === "Low" ? "bg-sunk" : "bg-gold-soft";
            return (
              <Card key={b.id}>
                <div className="flex flex-wrap gap-1.5">
                  <Chip accent>{b.source_country}</Chip>
                  {lvl ? (
                    <span className={`inline-block rounded px-1.5 py-0.5 font-mono text-[11px] text-fg ${tone}`}>{lvl} transferability</span>
                  ) : null}
                  {matchesRole(b) ? <span className="inline-block rounded border border-gold bg-gold-soft px-1.5 py-0.5 font-mono text-[11px] text-fg">for you</span> : null}
                </div>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug">{b.theme}</h3>
                {b.what_happened ? <p className="mt-1 text-sm">{b.what_happened}</p> : null}
                {b.outcome ? (
                  <p className="mt-2 text-sm text-muted">
                    <b className="text-fg">Outcome:</b> {b.outcome}
                  </p>
                ) : null}
                {b.transferability ? (
                  <p className="mt-2 text-sm text-muted">
                    <b className="text-fg">For Africa:</b> {b.transferability}
                  </p>
                ) : null}
                {isUrl(b.link) ? (
                  <p className="mt-2 text-xs">
                    <a href={b.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                      Source: {host(b.link)}
                      <span className="sr-only"> (opens in a new tab)</span> ↗
                    </a>
                  </p>
                ) : null}
                <ReviewNote needs={b.needs_review} note={b.review_note} />
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-center text-muted">No examples match.</p>
      )}
    </section>
  );
}
