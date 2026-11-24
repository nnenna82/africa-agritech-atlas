import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CountryCrops } from "@/components/CropJourneys";
import SuggestBox from "@/components/SuggestBox";
import PrintButton from "@/components/PrintButton";
import { GapCard, OrgCard, PersonCard, PolicyCard, StartupCard } from "@/components/cards";
import { Breadcrumbs, Card, Eyebrow, Kpi, LastChecked, NotEnough, ReviewNote, Section, SourceLinks, TierChip, TierScale } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { date, num } from "@/lib/format";
import { computeTiers, pillarTier, PILLARS, regionSlug } from "@/lib/groups";
import type { Country, Indicators, PillarKey } from "@/lib/types";

export async function generateStaticParams() {
  const { countries } = await getAtlas();
  return countries.map((c) => ({ iso3: c.iso3 }));
}

export async function generateMetadata({ params }: PageProps<"/country/[iso3]">): Promise<Metadata> {
  const { iso3 } = await params;
  const { countries } = await getAtlas();
  const c = countries.find((x) => x.iso3 === iso3.toUpperCase());
  return { title: c?.name ?? "Country not found" };
}

export default function CountryPage({ params }: PageProps<"/country/[iso3]">) {
  return (
    <Suspense fallback={<p className="text-muted">Loading country…</p>}>
      <CountryContent params={params} />
    </Suspense>
  );
}

// Real indicator values shown under each pillar, so visitors can see why a country is in its group.
const INDICATORS: Record<PillarKey, { key: keyof Indicators; label: string; unit: string; digits?: number; prefix?: string }[]> = {
  productivity: [
    { key: "cereal_yield_t_ha", label: "Cereal yield", unit: " t/ha", digits: 2 },
    { key: "ag_va_per_worker_usd", label: "Farm value added per worker", unit: "", prefix: "US$" },
  ],
  inputs_water: [
    { key: "fertilizer_kg_ha", label: "Fertilizer use", unit: " kg/ha" },
    { key: "irrigated_pct_cropland", label: "Irrigated cropland", unit: "%" },
  ],
  policy: [
    { key: "caadp_br4", label: "CAADP review score", unit: " / 10 (on track: 9.29)", digits: 2 },
    { key: "ag_spend_pct_budget", label: "Farming share of public spending", unit: "% (target: 10%)" },
  ],
  infrastructure: [
    { key: "electricity_pct", label: "Electricity access", unit: "%" },
    { key: "internet_pct", label: "Internet users", unit: "%" },
  ],
  finance: [{ key: "account_pct", label: "Adults with a bank or mobile-money account", unit: "%" }],
};

async function CountryContent({ params }: { params: PageProps<"/country/[iso3]">["params"] }) {
  const { iso3: raw } = await params;
  const iso3 = raw.toUpperCase();
  const atlas = await getAtlas();
  const c = atlas.countries.find((x) => x.iso3 === iso3);
  if (!c) notFound();

  const tiers = computeTiers(atlas.countries);
  const tier = tiers[c.iso3];
  const has = (arr: string[] | null) => (arr ?? []).includes(iso3);
  const gaps = atlas.gaps.filter((g) => g.scope === iso3);
  const people = atlas.people.filter((p) => has(p.countries));
  const orgs = atlas.organizations.filter((o) => has(o.countries));
  const startups = atlas.startups.filter((s) => s.hq_iso3 === iso3 || has(s.countries));
  const policies = atlas.policies.filter((p) => p.scope === iso3).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Africa", href: "/africa" },
          { label: `${c.region} Africa`, href: `/region/${regionSlug(c.region)}` },
          { label: c.name },
        ]}
      />
      <Eyebrow>
        {c.region} Africa
        {c.recs?.length ? ` · ${c.recs.join(" · ")}` : ""}
        {c.capital ? ` · Capital ${c.capital}` : ""}
      </Eyebrow>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{c.name}</h1>
        <PrintButton label="Download profile as PDF" />
      </div>
      <p className="hidden text-xs text-muted print:block">
        Africa AgriTech Atlas · africa-agritech-atlas.vercel.app/country/{c.iso3} · Data as of {date(atlas.meta.as_of) ?? "November 2026"}
      </p>
      {c.deep ? <p className="mt-1 font-mono text-xs text-accent">Deep dive</p> : null}
      <ReviewNote needs={c.needs_review} note={c.review_note} />

      <div className="mt-5">
        <TierScale tier={tier} />
      </div>

      <section aria-label="Key facts" className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        <Kpi value={<TierChip tier={tier} />} label="Atlas group, compared with other African countries" />
        <Kpi value={c.population_m != null ? `${num(c.population_m)}m` : <NotEnough />} label="people" />
        <Kpi value={pct(c.ag_gdp_pct)} label="of the economy (GDP) is farming" />
        <Kpi value={pct(c.ag_jobs_pct)} label="of jobs are in farming" />
        <Kpi value={pct(c.electricity_access_pct)} label="of people have electricity" />
        <Kpi value={pct(c.internet_users_pct)} label="of people use the internet" />
      </section>

      <PillarSection c={c} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section>
          <h2 className="font-display text-2xl font-bold">{c.deep ? "Why it is where it is" : "Summary"}</h2>
          <p className="mt-3 max-w-prose">{c.narrative || c.summary || "Not enough data yet."}</p>
          {c.deep && c.narrative && c.summary ? <p className="mt-3 max-w-prose text-muted">{c.summary}</p> : null}
          {c.strengths?.length ? (
            <>
              <h3 className="mt-5 font-display text-lg font-bold">Strengths</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {c.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          ) : null}
          {!c.deep ? (
            <p className="mt-4 rounded-lg bg-gold-soft p-3 text-sm">
              <b>No deep dive yet.</b> This is a baseline profile from public statistics. Deep dives with people,
              stakeholders, policies and gaps are being added country by country.
            </p>
          ) : null}
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Flagship programs</h2>
          {c.flagship_programs?.length ? (
            <ul className="mt-3 space-y-2">
              {c.flagship_programs.map((p) => (
                <li key={p} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                  {p}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted">Not enough data yet.</p>
          )}
        </section>
      </div>

      <CountryCrops iso3={c.iso3} name={c.name} />

      {gaps.length ? (
        <Section title="Gaps" intro="Unsolved problems, why they persist, and where someone could act.">
          <Grid>
            {gaps.map((g) => (
              <GapCard key={g.id} gap={g} scopeName={c.name} />
            ))}
          </Grid>
        </Section>
      ) : null}

      {people.length ? (
        <Section
          title="People to talk to"
          intro="Public professional information only. Reach out with a specific question and a reason you chose them."
        >
          <Grid>
            {people.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </Grid>
        </Section>
      ) : null}

      {orgs.length ? (
        <Section title="Stakeholders" intro="Ministries, regulators, research bodies, funders and companies active here.">
          <Grid>
            {orgs.map((o) => (
              <OrgCard key={o.id} org={o} />
            ))}
          </Grid>
        </Section>
      ) : null}

      {startups.length ? (
        <Section title="Startups" intro="Based here or working here. Startups that closed or changed course stay listed on purpose: there is a lot to learn from them.">
          <Grid>
            {startups.map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </Grid>
        </Section>
      ) : null}

      {policies.length ? (
        <Section title="Policy and regulation" intro="Newest first.">
          <Grid>
            {policies.map((p) => (
              <PolicyCard key={p.id} policy={p} />
            ))}
          </Grid>
        </Section>
      ) : null}

      <Section title="Sources">
        <SourceLinks items={c.sources ?? []} label="Where this profile comes from" />
        <LastChecked value={c.last_verified} />
      </Section>

      <SuggestBox type="people" what={`a person, startup, policy or gap in ${c.name}`} country={c.iso3} />
    </>
  );
}

function pct(v: number | null) {
  return v == null ? <NotEnough /> : `${num(v, 1)}%`;
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function PillarSection({ c }: { c: Country }) {
  const a = c.atlas;
  return (
    <Section
      title="Score by pillar"
      intro={
        <>
          Each pillar is shown as a color group, with the real figures underneath so you can see why. Groups compare{" "}
          {c.name} with other African countries.
        </>
      }
    >
      {!a ? (
        <p className="text-muted">Not enough data.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {PILLARS.map((p) => (
            <li key={p.key} className="grid gap-2 p-4 md:grid-cols-[12rem_10rem_1fr] md:items-start">
              <div>
                <b>{p.label}</b>
                <p className="text-xs text-muted">{p.question}</p>
              </div>
              <div>
                <TierChip tier={pillarTier(a.pillars[p.key])} />
              </div>
              <ul className="space-y-0.5 text-sm">
                {INDICATORS[p.key].map((ind) => {
                  const v = num(a.indicators?.[ind.key], ind.digits);
                  return (
                    <li key={ind.key}>
                      <span className="text-muted">{ind.label}: </span>
                      {v == null ? <span className="text-muted italic">Not enough data</span> : <b>{(ind.prefix ?? "") + v + ind.unit}</b>}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {a && a.score == null ? (
        <Card className="mt-3 text-sm">
          {c.name} has data for fewer than 4 of the 5 pillars, so it is not placed in an overall group yet.
        </Card>
      ) : null}
      <p className="mt-2 text-xs text-muted">
        Sources: FAO and World Bank via Our World in Data, Global Findex 2024, AU 4th CAADP Biennial Review, ITU.
        Data as of {date(c.last_verified) ?? "2026"}.
      </p>
    </Section>
  );
}
