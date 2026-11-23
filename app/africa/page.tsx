import type { Metadata } from "next";
import Link from "next/link";
import AfricaMap from "@/components/AfricaMap";
import RegionCards from "@/components/RegionCards";
import { GapCard } from "@/components/cards";
import { Breadcrumbs, Card, Eyebrow, Kpi, Section, SourceLinks, TierChip } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { date, num } from "@/lib/format";
import { byTier, computeTiers } from "@/lib/groups";

export const metadata: Metadata = { title: "Africa" };

export default async function AfricaPage() {
  const atlas = await getAtlas();
  const { countries, meta } = atlas;
  const tiers = computeTiers(countries);
  const caadp = countries
    .filter((c) => c.caadp_br4_score != null)
    .sort((a, b) => (b.caadp_br4_score as number) - (a.caadp_br4_score as number));
  const top3 = caadp.slice(0, 3);
  const top15 = countries.filter((c) => tiers[c.iso3] != null).sort(byTier(tiers)).slice(0, 15);
  const auGaps = atlas.gaps.filter((g) => g.scope === "AU");
  const drivers = meta.lead_drivers ?? [];

  return (
    <>
      <Breadcrumbs items={[{ label: "Africa" }]} />
      <Eyebrow>The big picture{meta.as_of ? ` · as of ${date(meta.as_of)}` : ""}</Eyebrow>
      <h1 className="mt-2 max-w-4xl font-display text-3xl font-bold leading-tight sm:text-5xl">
        No African country is on track yet. A few are pulling ahead.
      </h1>
      {top3.length === 3 ? (
        <p className="mt-3 max-w-3xl text-lg text-muted">
          In the African Union&apos;s 4th CAADP Biennial Review (a check on each country&apos;s farming commitments),{" "}
          {top3[0].name} ({num(top3[0].caadp_br4_score, 2)}), {top3[1].name} ({num(top3[1].caadp_br4_score, 2)}) and{" "}
          {top3[2].name} ({num(top3[2].caadp_br4_score, 2)}) led, all short of the 9.29 &ldquo;on track&rdquo; mark.
          The leaders share one trait: the same strategy, funded and monitored for a decade or more.
        </p>
      ) : null}

      <section aria-label="What is in the Atlas" className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-5">
        <Kpi value={countries.length} label={`countries profiled, ${countries.filter((c) => c.deep).length} deep dives`} />
        <Kpi value={atlas.startups.length} label="startups tracked" />
        <Kpi value={atlas.people.length} label="people to learn from" />
        <Kpi value={atlas.policies.length} label="policies and frameworks" />
        <Kpi value={atlas.gaps.length} label="documented gaps" />
      </section>

      <Section title="Explore by region" intro="Pick a region to see its countries, leaders and most common gaps.">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <AfricaMap tiers={tiers} label="Map of Africa" />
          <RegionCards countries={countries} tiers={tiers} />
        </div>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section
          title="CAADP review: top scores"
          intro="The African Union's 4th Biennial Review scores each country out of 10 on its farming commitments. 9.29 counts as on track. Countries without a published score are not listed."
        >
          <ol className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {caadp.slice(0, 8).map((c) => (
              <li key={c.iso3}>
                <Link
                  href={`/country/${c.iso3}`}
                  className="flex min-h-11 flex-wrap items-center justify-between gap-2 px-4 py-2 text-fg no-underline hover:bg-sunk"
                >
                  <span>
                    <b>{c.name}</b> <span className="text-sm text-muted">· {c.region}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-sm tabular-nums">{num(c.caadp_br4_score, 2)} / 10</span>
                    <TierChip tier={tiers[c.iso3]} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted">The review score is one input. The Atlas group is the broader five-pillar comparison.</p>
        </Section>

        <Section
          title="What the leaders have in common"
          intro="Eight patterns from comparing the countries that improved fastest, in Africa and worldwide. Most leaders have several at once."
        >
          <ol className="list-decimal space-y-1 pl-5">
            {drivers.map((d) => (
              <li key={d.driver}>
                <a href={`#driver-${drivers.indexOf(d) + 1}`} className="underline-offset-2 hover:underline">
                  {d.driver}
                </a>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Section title="Why leaders lead" intro="Each driver, what it means, and where it has worked." id="drivers">
        <div className="grid gap-4 md:grid-cols-2">
          {drivers.map((d, i) => (
            <Card key={d.driver}>
              <div id={`driver-${i + 1}`} className="scroll-mt-4">
                <Eyebrow>Driver {i + 1}</Eyebrow>
                <h3 className="mt-1 font-display text-lg font-bold leading-snug">{d.driver}</h3>
                <p className="mt-2 text-sm">{d.explanation}</p>
                <p className="mt-2 text-sm text-muted">
                  <b className="text-fg">Examples:</b> {Array.isArray(d.examples) ? d.examples.join("; ") : d.examples}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Biggest continental gaps"
        intro="Problems that cut across the whole continent, with who is working on them and where someone could act."
        id="gaps"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {auGaps.slice(0, 6).map((g) => (
            <GapCard key={g.id} gap={g} scopeName="All of Africa" />
          ))}
        </div>
        {auGaps.length > 6 ? (
          <details className="mt-4">
            <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-accent">
              Show all {auGaps.length} continental gaps
            </summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {auGaps.slice(6).map((g) => (
                <GapCard key={g.id} gap={g} scopeName="All of Africa" />
              ))}
            </div>
          </details>
        ) : null}
      </Section>

      {meta.market_note ? (
        <Section title="Funding climate">
          <p className="max-w-prose">{meta.market_note.summary}</p>
          <SourceLinks items={meta.market_note.sources ?? []} label="Sources" />
        </Section>
      ) : null}

      <Section
        title="Atlas groups: the top 15"
        intro="Countries are placed in five color groups by comparing five pillars: productivity, inputs and water, policy commitment, infrastructure and access to finance. Each group holds about a fifth of the countries with enough data. Strongest first."
      >
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {top15.map((c) => (
            <li key={c.iso3}>
              <Link
                href={`/country/${c.iso3}`}
                className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-fg no-underline hover:border-accent"
              >
                <b>{c.name}</b>
                <TierChip tier={tiers[c.iso3]} />
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-4">
          <Link href="/countries" className="underline underline-offset-2">
            All 54 countries in one table →
          </Link>
        </p>
      </Section>
    </>
  );
}
