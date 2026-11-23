import Link from "next/link";
import AfricaMap from "@/components/AfricaMap";
import { CropBand } from "@/components/CropJourneys";
import HomePanels, { type HomeData } from "@/components/HomePanels";
import RegionCards from "@/components/RegionCards";
import { Eyebrow, Kpi } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { computeTiers, tierName } from "@/lib/groups";
import { makeScope, toLite } from "@/lib/scope";

export default async function Home() {
  const atlas = await getAtlas();
  const tiers = computeTiers(atlas.countries);
  const lite = atlas.countries.map(toLite);
  const sc = makeScope(lite, "", "");

  // For "My interest" on the map: which countries have a documented gap in each part of the chain.
  const interest: Record<string, string[]> = {};
  for (const g of atlas.gaps) {
    if (!g.segment || g.scope === "AU") continue;
    const list = (interest[g.segment] ??= []);
    if (!list.includes(g.scope)) list.push(g.scope);
  }

  // Only what the Home panels need, to keep the page light on phones.
  const data: HomeData = {
    countries: atlas.countries.map((c) => ({
      ...toLite(c),
      group: tierName(tiers[c.iso3] ?? null),
      pillars: c.atlas?.pillars ?? null,
    })),
    gaps: atlas.gaps,
    people: atlas.people,
    startups: atlas.startups,
    organizations: atlas.organizations.map(({ id, name, type, countries, sector_tags, what, funder }) => ({
      id,
      name,
      type,
      countries,
      sector_tags,
      what,
      funder,
    })),
    policies: atlas.policies.map(({ id, title, scope, year, status }) => ({ id, title, scope, year, status })),
    benchmarks: atlas.benchmarks.map(({ id, source_country, theme, what_happened, outcome, transferability }) => ({
      id,
      source_country,
      theme,
      what_happened,
      outcome,
      transferability,
    })),
    news: atlas.news.slice(0, 40),
    marketNote: !!atlas.meta.market_note,
  };

  return (
    <>
      <Eyebrow>Africa AgriTech Atlas · {atlas.countries.length} countries</Eyebrow>
      <h1 className="mt-2 max-w-4xl font-display text-3xl font-bold leading-tight sm:text-5xl">
        Explore agriculture and infrastructure across Africa
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Click a country on the map, or pick a region to start. Tell the Atlas who you are in the dark bar above and it
        will show what matters most to you.
      </p>

      <CropBand nameOf={sc.nameOf} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <AfricaMap tiers={tiers} label="Map of Africa's 54 countries" followBar interest={interest} />
        <div>
          <h2 className="mb-3 font-display text-2xl font-bold">Choose a region</h2>
          <RegionCards countries={atlas.countries} tiers={tiers} />
          <p className="mt-4">
            <Link href="/africa" className="underline underline-offset-2">
              See the whole of Africa: leaders, drivers and gaps →
            </Link>
          </p>
          <p className="mt-4 rounded-lg bg-sunk p-3 text-sm">
            <b>What do the colors mean?</b> &ldquo;Atlas groups&rdquo; place each country in one of five groups, from
            Early stage to Leading, compared with other African countries. They are not grades.
          </p>
        </div>
      </div>

      <HomePanels data={data} />

      <section className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4" aria-label="What is in the Atlas">
        <Link href="/gaps" className="text-fg no-underline hover:underline">
          <Kpi value={atlas.gaps.length} label="documented gaps →" />
        </Link>
        <Link href="/people" className="text-fg no-underline hover:underline">
          <Kpi value={atlas.people.length} label="people to learn from →" />
        </Link>
        <Link href="/startups" className="text-fg no-underline hover:underline">
          <Kpi value={atlas.startups.length} label="startups tracked →" />
        </Link>
        <Link href="/global" className="text-fg no-underline hover:underline">
          <Kpi value={atlas.benchmarks.length} label="global examples →" />
        </Link>
      </section>
    </>
  );
}
