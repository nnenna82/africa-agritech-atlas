import Link from "next/link";
import AfricaMap from "@/components/AfricaMap";
import RegionCards from "@/components/RegionCards";
import { Eyebrow, Kpi } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { computeTiers } from "@/lib/groups";

export default async function Home() {
  const atlas = await getAtlas();
  const tiers = computeTiers(atlas.countries);

  return (
    <>
      <Eyebrow>Africa AgriTech Atlas · {atlas.countries.length} countries</Eyebrow>
      <h1 className="mt-2 max-w-4xl font-display text-3xl font-bold leading-tight sm:text-5xl">
        Explore agriculture and infrastructure across Africa
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Click a country on the map, or pick a region to start. Each country page shows who is building, who funds,
        who sets the rules, and where the real problems are.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <AfricaMap tiers={tiers} label="Map of Africa's 54 countries" />
        <div>
          <h2 className="mb-3 font-display text-2xl font-bold">Choose a region</h2>
          <RegionCards countries={atlas.countries} tiers={tiers} />
          <p className="mt-4">
            <Link href="/africa" className="underline underline-offset-2">
              See the whole of Africa: leaders, drivers and gaps →
            </Link>
          </p>
          <p className="mt-4 rounded-lg bg-gold-soft p-3 text-sm">
            <b>What do the colors mean?</b> &ldquo;Atlas groups&rdquo; place each country in one of five groups, from
            Early stage to Leading, compared with other African countries. They are not grades.
          </p>
        </div>
      </div>

      <section className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4" aria-label="What is in the Atlas">
        <Kpi value={atlas.gaps.length} label="documented gaps" />
        <Kpi value={atlas.people.length} label="people to learn from" />
        <Kpi value={atlas.startups.length} label="startups tracked" />
        <Kpi value={atlas.benchmarks.length} label="global examples" />
      </section>
      <p className="mt-3 text-sm text-muted">
        Full pages for these are being built next. For now, each{" "}
        <Link href="/countries" className="underline underline-offset-2">
          country page
        </Link>{" "}
        lists its gaps, people and startups.
      </p>
    </>
  );
}
