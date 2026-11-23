"use client";

// People directory: search, country, diaspora only, plus the bar's region and country.
// When the visitor has picked a role, people most useful to that role come first.

import { useState } from "react";
import { useBar } from "@/lib/bar";
import { personKind, peopleKindFor, roleLabel } from "@/lib/chain";
import { makeScope, type CountryLite } from "@/lib/scope";
import type { Person } from "@/lib/types";
import { PersonCard } from "./cards";
import BarNotice, { filterCls } from "./BarNotice";

const text = (p: Person) =>
  [p.name, p.role, p.organization, p.focus, p.talk_to_about, p.based_in].join(" ").toLowerCase();

export default function PeopleList({ people, countries }: { people: Person[]; countries: CountryLite[] }) {
  const bar = useBar();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [diaspora, setDiaspora] = useState(false);
  const sc = makeScope(countries, bar.region, bar.country);
  const kind = peopleKindFor(bar.role);

  // Countries that have at least one person, limited to the bar's region if one is picked.
  const withPeople = new Set(people.flatMap((p) => p.countries ?? []));
  const options = countries.filter(
    (c) => withPeople.has(c.iso3) && (!bar.region || c.region === bar.region) && !bar.country,
  );
  const localCountry = options.some((c) => c.iso3 === country) ? country : "";

  let shown = people.filter(
    (p) =>
      sc.matches(p.countries ?? []) &&
      (!localCountry || (p.countries ?? []).includes(localCountry)) &&
      (!diaspora || p.diaspora) &&
      (!q || text(p).includes(q.toLowerCase())),
  );
  if (kind) shown = [...shown].sort((a, b) => Number(personKind(b) === kind) - Number(personKind(a) === kind));

  return (
    <>
      <BarNotice label={sc.label} />
      <div className="mt-4 flex flex-wrap items-center gap-2" role="search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search names, roles, topics"
          aria-label="Search people"
          className={`${filterCls} w-full sm:w-64`}
        />
        {options.length ? (
          <select
            aria-label="Country"
            value={localCountry}
            onChange={(e) => setCountry(e.target.value)}
            className={`${filterCls} w-full sm:w-auto`}
          >
            <option value="">{bar.region ? `All of ${bar.region} Africa` : "All countries"}</option>
            {options.map((c) => (
              <option key={c.iso3} value={c.iso3}>
                {c.name}
              </option>
            ))}
          </select>
        ) : null}
        <label className="inline-flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={diaspora}
            onChange={(e) => setDiaspora(e.target.checked)}
            className="h-5 w-5 accent-[var(--accent)]"
          />
          Diaspora only
        </label>
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {shown.length} of {people.length} shown
        </span>
      </div>
      {kind ? (
        <p className="mt-2 text-sm text-muted">
          People most useful to a {roleLabel(bar.role).toLowerCase()} are listed first.
        </p>
      ) : null}
      {shown.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <PersonCard key={p.id} person={p} nameOf={sc.nameOf} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-center text-muted">
          No people match. Try a wider region or clear the search. People are listed for the 10 deep-dive countries so
          far.
        </p>
      )}
    </>
  );
}
