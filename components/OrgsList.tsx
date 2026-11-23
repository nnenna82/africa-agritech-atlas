"use client";

// Organizations: search, country, type, plus the bar's region and country. Table on wide screens, cards on phones.
// Also used for the funders list on the Startups page (funders only, no type filter).

import { useState } from "react";
import { useBar } from "@/lib/bar";
import { isUrl } from "@/lib/format";
import { makeScope, type CountryLite } from "@/lib/scope";
import type { Organization } from "@/lib/types";
import BarNotice, { filterCls } from "./BarNotice";
import { OrgCard, orgTypeLabel } from "./cards";
import { ReviewNote } from "./ui";

const text = (o: Organization) => [o.name, o.type, o.subtype, o.what, ...(o.sector_tags ?? [])].join(" ").toLowerCase();

export default function OrgsList({
  orgs,
  countries,
  funders = false,
}: {
  orgs: Organization[];
  countries: CountryLite[];
  funders?: boolean;
}) {
  const bar = useBar();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");
  const sc = makeScope(countries, bar.region, bar.country);
  const base = funders ? orgs.filter((o) => o.funder) : orgs;
  const types = [...new Set(base.map((o) => o.type).filter(Boolean) as string[])].sort((a, b) =>
    orgTypeLabel(a).localeCompare(orgTypeLabel(b)),
  );
  const present = new Set(base.flatMap((o) => o.countries ?? []));
  const options = bar.country ? [] : countries.filter((c) => present.has(c.iso3) && (!bar.region || c.region === bar.region));
  const localCountry = options.some((c) => c.iso3 === country) ? country : "";

  const shown = base
    .filter(
      (o) =>
        sc.matches(o.countries ?? []) &&
        (!type || o.type === type) &&
        (!localCountry || (o.countries ?? []).includes(localCountry)) &&
        (!q || text(o).includes(q.toLowerCase())),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const what = funders ? "funders" : "organizations";

  return (
    <>
      {funders ? null : <BarNotice label={sc.label} />}
      <div className="mt-4 flex flex-wrap items-center gap-2" role="search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${what}`}
          aria-label={`Search ${what}`}
          className={`${filterCls} w-full sm:w-56`}
        />
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
        <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} className={`${filterCls} w-full sm:w-auto`}>
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {orgTypeLabel(t)} ({base.filter((o) => o.type === t).length})
            </option>
          ))}
        </select>
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {shown.length} of {base.length} shown
        </span>
      </div>

      {!shown.length ? (
        <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-center text-muted">
          No {what} match. Try a wider region or clear the search.
        </p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:hidden">
            {shown.map((o) => (
              <OrgCard key={o.id} org={o} nameOf={sc.nameOf} />
            ))}
          </div>
          <div className="mt-5 hidden overflow-x-auto rounded-lg border border-line bg-surface md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{funders ? "Funders and investors" : "Organizations"}, sorted by name</caption>
              <thead className="bg-sunk font-mono text-[11px] uppercase tracking-widest text-muted">
                <tr>
                  <th scope="col" className="p-3">Organization</th>
                  <th scope="col" className="p-3">Type</th>
                  <th scope="col" className="p-3">Countries</th>
                  <th scope="col" className="p-3">What they do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line align-top">
                {shown.map((o) => (
                  <tr key={o.id}>
                    <th scope="row" className="min-w-44 p-3 font-semibold">
                      {isUrl(o.website) ? (
                        <a href={o.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                          {o.name}
                          <span className="sr-only"> (website, opens in a new tab)</span>
                        </a>
                      ) : (
                        o.name
                      )}
                      <ReviewNote needs={o.needs_review} note={o.review_note} />
                    </th>
                    <td className="p-3">
                      <span className="whitespace-nowrap rounded bg-sunk px-1.5 py-0.5 font-mono text-[11px] text-muted">
                        {o.subtype || orgTypeLabel(o.type)}
                      </span>
                    </td>
                    <td className="max-w-48 p-3 text-muted">{(o.countries ?? []).map(sc.nameOf).join(", ")}</td>
                    <td className="min-w-64 p-3">{o.what}</td>
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
