import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AfricaMap from "@/components/AfricaMap";
import { CountryCard } from "@/components/cards";
import { Breadcrumbs, Eyebrow, MixBar, MixLegend, Section } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { plural } from "@/lib/format";
import { byTier, computeTiers, REGIONS, regionFromSlug, regionSlug, regionStats } from "@/lib/groups";

export function generateStaticParams() {
  return REGIONS.map((r) => ({ name: regionSlug(r) }));
}

export async function generateMetadata({ params }: PageProps<"/region/[name]">): Promise<Metadata> {
  const { name } = await params;
  const r = regionFromSlug(name);
  return { title: r ? `${r} Africa` : "Region not found" };
}

export default function RegionPage({ params }: PageProps<"/region/[name]">) {
  return (
    <Suspense fallback={<p className="text-muted">Loading region…</p>}>
      <RegionContent params={params} />
    </Suspense>
  );
}

async function RegionContent({ params }: { params: PageProps<"/region/[name]">["params"] }) {
  const { name } = await params;
  const region = regionFromSlug(name);
  if (!region) notFound();

  const atlas = await getAtlas();
  const tiers = computeTiers(atlas.countries);
  const st = regionStats(region, atlas.countries, tiers);
  const isos = new Set(st.countries.map((c) => c.iso3));

  const segCount = new Map<string, number>();
  for (const g of atlas.gaps) {
    if (isos.has(g.scope) && g.segment) segCount.set(g.segment, (segCount.get(g.segment) ?? 0) + 1);
  }
  const topSegments = [...segCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const startups = atlas.startups.filter((s) => s.hq_iso3 && isos.has(s.hq_iso3));
  const people = atlas.people.filter((p) => (p.countries ?? []).some((i) => isos.has(i)));
  const blocs = [...new Set(st.countries.flatMap((c) => c.recs ?? []))];
  const cards = [...st.countries].sort(byTier(tiers));

  return (
    <>
      <Breadcrumbs items={[{ label: "Africa", href: "/africa" }, { label: `${region} Africa` }]} />
      <Eyebrow>Region</Eyebrow>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{region} Africa</h1>
      <p className="mt-3 max-w-3xl text-lg text-muted">
        {plural(st.countries.length, "country", "countries")} · {st.deep} with deep dives ·{" "}
        {plural(startups.length, "startup")} and {plural(people.length, "person", "people")} in the Atlas
        {blocs.length ? ` · Trade blocs: ${blocs.join(", ")}` : ""}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <AfricaMap tiers={tiers} mode="tier" focusRegion={region} label={`Map of ${region} Africa`} />
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="font-display text-2xl font-bold">How the region compares</h2>
            <p className="mt-2 text-muted">
              {st.leaders.length ? `Leading: ${st.leaders.map((c) => c.name).join(", ")}. ` : ""}
              {st.advancing.length ? `Advancing: ${st.advancing.map((c) => c.name).join(", ")}.` : ""}
              {!st.leaders.length && !st.advancing.length
                ? "No country in this region is in the top two groups yet."
                : ""}
            </p>
            <MixBar stats={st} className="mt-3 max-w-xs" />
            <div className="mt-3">
              <MixLegend stats={st} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Most documented gaps here</h2>
            {topSegments.length ? (
              <ul className="mt-3 divide-y divide-line">
                {topSegments.map(([seg, n]) => (
                  <li key={seg} className="py-2">
                    <b className="capitalize">{seg}</b>
                    <p className="text-sm text-muted">
                      {plural(n, "documented gap")} across this region&apos;s deep dives
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted">
                No deep dives in this region yet, so gaps are not documented country by country. See the continental
                gaps on the{" "}
                <Link href="/africa#gaps" className="underline underline-offset-2">
                  Africa page
                </Link>
                .
              </p>
            )}
          </section>

          {startups.length ? (
            <section>
              <h2 className="font-display text-2xl font-bold">Startups based here</h2>
              <p className="mt-2 text-sm text-muted">
                {startups
                  .slice(0, 8)
                  .map((s) => s.name)
                  .join(" · ")}
                {startups.length > 8 ? " and more" : ""}
              </p>
            </section>
          ) : null}
        </div>
      </div>

      <Section title={`Countries in ${region} Africa`} intro="Sorted from Leading to Early stage. Click one to open it.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <li key={c.iso3}>
              <CountryCard country={c} tier={tiers[c.iso3]} />
            </li>
          ))}
        </ul>
      </Section>

      <nav aria-label="Other regions" className="mt-10 flex flex-wrap gap-2 text-sm">
        <span className="py-2 text-muted">Other regions:</span>
        {REGIONS.filter((r) => r !== region).map((r) => (
          <Link
            key={r}
            href={`/region/${regionSlug(r)}`}
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 no-underline hover:border-accent"
          >
            {r} Africa
          </Link>
        ))}
      </nav>
    </>
  );
}
