"use client";

// The parts of Home that follow the bar:
// - "For you": a starting point for the visitor's role (I am a), narrowed by region, country and interest
// - the interest panel: a plain explanation of the chosen part of the chain, its gaps and who works on it
// - the latest three news stories for the chosen region or country

import Link from "next/link";
import type { ReactNode } from "react";
import { useBar } from "@/lib/bar";
import { CJ_URL, PILLAR_LABELS, SEGMENT_INFO, personKind, peopleKindFor, roleLabel } from "@/lib/chain";
import { makeScope, type CountryLite } from "@/lib/scope";
import type { Benchmark, Gap, NewsItem as News, Organization, Person, PillarKey, Policy, Startup } from "@/lib/types";
import { startupStatus } from "./cards";
import NewsItem, { newsMatches } from "./NewsItem";

export type HomeData = {
  countries: (CountryLite & { group: string; pillars: Partial<Record<PillarKey, number | null>> | null })[];
  gaps: Gap[];
  people: Person[];
  startups: Startup[];
  organizations: Pick<Organization, "id" | "name" | "type" | "countries" | "sector_tags" | "what" | "funder">[];
  policies: Pick<Policy, "id" | "title" | "scope" | "year" | "status">[];
  benchmarks: Pick<Benchmark, "id" | "source_country" | "theme" | "what_happened" | "outcome" | "transferability">[];
  news: News[];
  marketNote: boolean;
};

const short = (t: string | null | undefined, n: number) => {
  const s = String(t ?? "");
  return s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s;
};
const statusWord = (s: string | null) => startupStatus(s).label;

type Row = { title: string; sub: string; href?: string; external?: boolean };

function List({ title, rows, more, empty }: { title: string; rows: Row[]; more?: [string, string]; empty?: string }) {
  return (
    <div className="min-w-0">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <ul className="mt-2 space-y-3">
        {rows.length ? (
          rows.map((r) => (
            <li key={r.title} className="text-sm">
              {r.href ? (
                r.external ? (
                  <a href={r.href} className="font-semibold underline underline-offset-2">
                    {r.title}
                  </a>
                ) : (
                  <Link href={r.href} className="font-semibold underline underline-offset-2">
                    {r.title}
                  </Link>
                )
              ) : (
                <b>{r.title}</b>
              )}
              {r.sub ? <span className="block text-muted">{r.sub}</span> : null}
            </li>
          ))
        ) : (
          <li className="text-sm text-muted">{empty ?? "Nothing matches yet. Try a wider region in the bar."}</li>
        )}
      </ul>
      {more ? (
        <p className="mt-3 text-sm">
          <Link href={more[0]} className="underline underline-offset-2">
            {more[1]} →
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function Panel({ eyebrow, title, lead, children, id }: { eyebrow: string; title: string; lead?: ReactNode; children: ReactNode; id: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-10 scroll-mt-4 rounded-xl border border-line bg-surface p-4 sm:p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{eyebrow}</p>
      <h2 id={`${id}-h`} className="mt-1 font-display text-2xl font-bold first-letter:uppercase sm:text-3xl">
        {title}
      </h2>
      {lead ? <p className="mt-2 max-w-3xl text-muted">{lead}</p> : null}
      <div className="mt-5 grid gap-6 md:grid-cols-3">{children}</div>
    </section>
  );
}

export default function HomePanels({ data }: { data: HomeData }) {
  const bar = useBar();
  return (
    <>
      {bar.region ? (
        <p className="mt-4">
          <Link href={`/region/${bar.region.toLowerCase()}`} className="underline underline-offset-2">
            Open the {bar.region} Africa page →
          </Link>
          {bar.country ? (
            <>
              {" · "}
              <Link href={`/country/${bar.country}`} className="underline underline-offset-2">
                Open {data.countries.find((c) => c.iso3 === bar.country)?.name ?? bar.country} →
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      {!bar.role && !bar.segment ? (
        <p className="mt-6 rounded-lg bg-gold-soft p-3 text-sm">
          <b>New here?</b> Pick a role in the dark bar above, such as student or founder, to get a tailored starting
          point. Or pick what you are &ldquo;Interested in&rdquo; to learn about one part of the farm chain.
        </p>
      ) : null}
      <ForYou data={data} />
      <Interest data={data} />
      <LatestNews data={data} />
    </>
  );
}

function ForYou({ data }: { data: HomeData }) {
  const bar = useBar();
  if (!bar.role) return null;
  const sc = makeScope(data.countries, bar.region, bar.country);
  const iso = bar.country;
  const seg = bar.segment;
  const C = iso ? data.countries.find((c) => c.iso3 === iso) : undefined;
  const where = C ? C.name : bar.region ? `${bar.region} Africa` : "Africa";
  const segOk = (x: string | null) => !seg || x === seg;

  const gaps = data.gaps
    .filter((g) => segOk(g.segment) && sc.matches([g.scope], true))
    .sort((a, b) => Number(b.scope === iso) - Number(a.scope === iso));
  const starts = data.startups.filter((x) => segOk(x.segment) && sc.matches([...(x.countries ?? []), x.hq_iso3]));
  const ppl = data.people.filter((p) => sc.matches(p.countries ?? []));
  const orgs = data.organizations.filter((o) => sc.matches(o.countries ?? []));
  const pols = data.policies.filter((p) => sc.matches([p.scope], true)).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  const kind = peopleKindFor(bar.role);
  const peopleRows = (n = 4): Row[] => {
    const match = ppl.filter((p) => personKind(p) === kind);
    return (match.length ? match : ppl).slice(0, n).map((p) => ({
      title: p.name,
      sub: `${p.role ?? ""}${p.organization ? `, ${p.organization}` : ""}${p.talk_to_about ? ` · Ask about: ${short(p.talk_to_about, 110)}` : ""}`,
    }));
  };
  const gapRows = (n: number, field: "opportunity" | "root_causes"): Row[] =>
    gaps.slice(0, n).map((g) => ({
      title: g.title,
      sub: `${sc.nameOf(g.scope)} · ${g.segment ?? ""} · ${short(g[field] || g.evidence, 150)}`,
    }));
  const countryHref = (i: string) => `/country/${i}`;

  const pillarLine = () => {
    if (!C?.pillars) return null;
    const ps = (Object.entries(C.pillars) as [PillarKey, number | null][]).filter(([, v]) => v != null) as [PillarKey, number][];
    if (!ps.length || C.group === "Not enough data") return null;
    ps.sort((a, b) => a[1] - b[1]);
    return (
      <>
        {C.name} is in the <b className="text-fg">{C.group}</b> group. Strongest area: {PILLAR_LABELS[ps[ps.length - 1][0]]};
        weakest: {PILLAR_LABELS[ps[0][0]]}.
      </>
    );
  };

  const isFailure = (s: string | null) => ["shut down", "pivoted", "restructuring"].includes(statusWord(s));
  const segNote = seg ? ` Focused on ${seg}.` : "";
  let title = "";
  let lead: ReactNode = null;
  let cols: ReactNode = null;

  switch (bar.role) {
    case "builder":
      title = `Problems worth building for in ${where}`;
      lead = `Start from a documented gap, check who already tried, then talk to people running similar work.${segNote}`;
      cols = (
        <>
          <List title="Gaps to work on" rows={gapRows(4, "opportunity")} more={["/gaps", "Open the gap map"]} />
          <List
            title="Who already tried"
            rows={[...starts]
              .sort((a, b) => Number(isFailure(b.status)) - Number(isFailure(a.status)))
              .slice(0, 5)
              .map((x) => ({ title: x.name, sub: `${x.segment ?? ""} · ${statusWord(x.status)} · ${short(x.model, 100)}` }))}
            empty="No startups recorded here yet: a possible opening."
          />
          <List title="Operators to talk to" rows={peopleRows()} more={["/people", "All people"]} />
        </>
      );
      break;
    case "funder":
      title = `Where capital is needed in ${where}`;
      lead = `${data.marketNote ? "Agtech funding fell about 20% in 2025 to just under US$170m, and debt and grants now outweigh equity." : ""}${segNote}`;
      cols = (
        <>
          <List
            title="Active startups"
            rows={starts
              .filter((x) => statusWord(x.status) === "active")
              .slice(0, 5)
              .map((x) => ({ title: x.name, sub: `${x.segment ?? ""} · ${short(x.notable_funding, 100) || "funding not recorded"}` }))}
            empty="No active startups recorded here yet."
          />
          <List
            title="Co-investors and development lenders"
            rows={orgs
              .filter((o) => o.funder)
              .slice(0, 5)
              .map((o) => ({ title: o.name, sub: short(o.what, 120) }))}
            empty="No funders recorded here yet."
          />
          <List title="Gaps with clear demand" rows={gapRows(3, "opportunity")} more={["/gaps", "Open the gap map"]} />
        </>
      );
      break;
    case "policy":
      title = `What works, and what can be copied, for ${where}`;
      lead = C
        ? pillarLine()
        : "No country met the Malabo targets for farm investment. The leaders kept one funded plan going for a decade or more.";
      cols = (
        <>
          <List
            title="Policies and frameworks"
            rows={pols.slice(0, 5).map((p) => ({
              title: p.title,
              sub: [sc.nameOf(p.scope), p.year, p.status].filter(Boolean).join(" · "),
              href: p.scope !== "AU" ? countryHref(p.scope) : undefined,
            }))}
          />
          <List
            title="Global examples that transfer well"
            rows={data.benchmarks
              .filter((b) => /^high/i.test(b.transferability ?? ""))
              .slice(0, 4)
              .map((b) => ({ title: `${b.source_country}: ${b.theme}`, sub: short(b.outcome, 140) }))}
          />
          <List title="Officials and agencies" rows={peopleRows()} more={["/people", "All people"]} />
        </>
      );
      break;
    case "research":
      title = `Open questions and data gaps for ${where}`;
      lead = C
        ? pillarLine()
        : "Irrigation data for most countries dates from around 2012, and 20 countries still have no CAADP review score in the Atlas.";
      cols = (
        <>
          <List title="Gaps, with root causes" rows={gapRows(4, "root_causes")} more={["/gaps", "Open the gap map"]} />
          <List
            title="Research organizations"
            rows={[
              ...orgs.filter((o) => o.type === "research"),
              ...data.organizations.filter((o) => o.type === "research" && !orgs.includes(o)),
            ]
              .slice(0, 5)
              .map((o) => ({ title: o.name, sub: short(o.what, 120) }))}
          />
          <List title="Researchers to talk to" rows={peopleRows()} more={["/people", "All people"]} />
        </>
      );
      break;
    default:
      title = `Your starting path${C ? ` into ${C.name}` : ""}`;
      lead = "Learn the chain first, then one country, then the people. About three hours a week.";
      cols = (
        <>
          <List
            title="Start here"
            rows={[
              { title: "Crop Journeys", sub: "Follow cocoa, maize, coffee and tomatoes from seed to shelf", href: CJ_URL, external: true },
              { title: "The gap map", sub: "Real, unsolved problems, with evidence", href: "/gaps" },
              C
                ? { title: `${C.name} profile`, sub: C.deep ? "Deep dive with people, gaps and policies" : "Baseline profile", href: countryHref(C.iso3) }
                : { title: "Rwanda, Kenya and Morocco", sub: "Three different models of success", href: "/countries" },
            ]}
          />
          <List title="Problems to understand" rows={gapRows(3, "root_causes")} more={["/gaps", "Open the gap map"]} />
          <List title="People to learn from" rows={peopleRows()} more={["/people", "All people"]} />
        </>
      );
  }

  return (
    <Panel
      id="for-you"
      eyebrow={`For you · ${roleLabel(bar.role)}${sc.label ? ` · ${sc.label}` : ""}${seg ? ` · ${seg}` : ""}`}
      title={title}
      lead={lead}
    >
      {cols}
    </Panel>
  );
}

function Interest({ data }: { data: HomeData }) {
  const bar = useBar();
  const seg = bar.segment;
  if (!seg) return null;
  const info = SEGMENT_INFO[seg];
  const sc = makeScope(data.countries, "", "");
  const au = data.gaps.filter((g) => g.segment === seg && g.scope === "AU");
  const where = [...new Set(data.gaps.filter((g) => g.segment === seg && g.scope !== "AU").map((g) => g.scope))];
  const st = data.startups.filter((x) => x.segment === seg);
  const orgs = data.organizations.filter((o) => (o.sector_tags ?? []).includes(seg));
  const bm = info ? data.benchmarks.filter((b) => info.match.test(`${b.theme} ${b.what_happened ?? ""}`)).slice(0, 3) : [];
  const deepCount = data.countries.filter((c) => c.deep).length;

  return (
    <Panel
      id="interest"
      eyebrow={`Your area of interest${info ? ` · ${info.stage}` : ""}`}
      title={seg}
      lead={
        <>
          {info ? `${info.what} ${info.why}` : null}
          {info?.crop ? (
            <>
              {" "}
              See it in action in the{" "}
              <a href={`${CJ_URL}#${info.crop}`} className="underline underline-offset-2">
                {info.crop} journey ↗
              </a>
              .
            </>
          ) : null}
        </>
      }
    >
      <List
        title="The evidence"
        rows={au.slice(0, 2).map((g) => ({
          title: g.title,
          sub: `${short(g.evidence, 200)}${g.opportunity ? ` Opportunity: ${short(g.opportunity, 160)}` : ""}`,
        }))}
        empty="No continental figure recorded yet."
        more={["/gaps", `All ${seg} gaps`]}
      />
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold">Where it&rsquo;s a documented gap</h3>
        <p className="mt-1 text-sm text-muted">
          {where.length} of the {deepCount} deep-dive countries. Shown in gold on the map under &ldquo;My interest&rdquo;.
        </p>
        <p className="mt-2 flex flex-wrap gap-1.5">
          {where.length ? (
            where.map((i) => (
              <Link
                key={i}
                href={`/country/${i}`}
                className="inline-flex min-h-8 items-center rounded bg-accent-soft px-2 font-mono text-xs text-fg no-underline hover:underline"
              >
                {sc.nameOf(i)}
              </Link>
            ))
          ) : (
            <span className="text-sm text-muted">None among the deep dives yet.</span>
          )}
        </p>
        <div className="mt-4">
          <List
            title="Who's working on it"
            rows={st.slice(0, 4).map((x) => ({
              title: x.name,
              sub: `${(x.countries ?? []).map(sc.nameOf).join(", ")} · ${statusWord(x.status)}`,
            }))}
            empty="No startups recorded yet: a possible opening."
          />
          <p className="mt-2 text-sm text-muted">
            {st.length} startups and {orgs.length} organizations in the Atlas work on this.
          </p>
        </div>
      </div>
      <List
        title="Global examples"
        rows={bm.map((b) => ({ title: `${b.source_country}: ${b.theme}`, sub: short(b.outcome, 150) }))}
        empty="No matching global example yet."
      />
    </Panel>
  );
}

function LatestNews({ data }: { data: HomeData }) {
  const bar = useBar();
  const sc = makeScope(data.countries, bar.region, bar.country);
  const list = data.news.filter((n) => newsMatches(n, bar)).slice(0, 3);
  if (!list.length) return null;
  return (
    <section aria-labelledby="latest-news" className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="latest-news" className="font-display text-2xl font-bold">
          Latest news{sc.label ? ` for ${sc.label}` : ""}
        </h2>
        <Link href="/news" className="inline-flex min-h-11 items-center underline underline-offset-2">
          All news →
        </Link>
      </div>
      <div>
        {list.map((n) => (
          <NewsItem key={n.id} item={n} nameOf={sc.nameOf} />
        ))}
      </div>
    </section>
  );
}
