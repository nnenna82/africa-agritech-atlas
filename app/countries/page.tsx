import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, Chip, Swatch, TierChip } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { byTier, computeTiers, pillarTier, PILLARS, regionSlug, tierColor, tierName, type Tier } from "@/lib/groups";

export const metadata: Metadata = { title: "All countries" };

export default async function CountriesPage() {
  const atlas = await getAtlas();
  const tiers = computeTiers(atlas.countries);
  const rows = [...atlas.countries].sort(byTier(tiers));
  const unplaced = rows.filter((c) => tiers[c.iso3] == null).map((c) => c.name);

  return (
    <>
      <Breadcrumbs items={[{ label: "Africa", href: "/africa" }, { label: "All countries" }]} />
      <h1 className="font-display text-4xl font-bold sm:text-5xl">All 54 countries</h1>
      <p className="mt-3 max-w-3xl text-muted">
        Sorted from Leading to Early stage. The colored squares show each pillar&apos;s group, compared with other
        African countries. Click a country for its profile and the real figures behind each color.
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted" aria-label="Color key">
        {[0, 1, 2, 3, 4, null].map((t) => (
          <li key={String(t)} className="flex items-center gap-1.5">
            <Swatch color={tierColor(t as Tier)} />
            {tierName(t as Tier)}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-muted md:hidden">Swipe the table sideways to see every pillar.</p>

      <div className="relative mt-6 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">All African countries with their Atlas group and pillar groups</caption>
          <thead className="bg-sunk text-left font-mono text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-3 py-2">Country</th>
              <th scope="col" className="px-3 py-2">Region</th>
              <th scope="col" className="px-3 py-2">Atlas group</th>
              {PILLARS.map((p) => (
                <th key={p.key} scope="col" className="px-2 py-2 text-center">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.iso3} className="border-t border-line hover:bg-sunk">
                <th scope="row" className="px-3 py-2 text-left font-medium">
                  <Link href={`/country/${c.iso3}`} className="underline underline-offset-2">
                    {c.name}
                  </Link>{" "}
                  {c.deep ? <Chip accent>deep dive</Chip> : null}
                </th>
                <td className="px-3 py-2">
                  <Link href={`/region/${regionSlug(c.region)}`} className="text-muted underline-offset-2 hover:underline">
                    {c.region}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <TierChip tier={tiers[c.iso3]} />
                </td>
                {PILLARS.map((p) => {
                  const t = pillarTier(c.atlas?.pillars?.[p.key]);
                  return (
                    <td key={p.key} className="px-2 py-2 text-center">
                      <span title={`${p.label}: ${tierName(t)}`} className="inline-flex">
                        <Swatch color={tierColor(t)} className="h-5 w-5" />
                        <span className="sr-only">{tierName(t)}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        Sources: FAO and World Bank via Our World in Data, Global Findex 2024, UN SDG 2.a.1, AU 4th CAADP Biennial
        Review, ITU.
        {unplaced.length ? ` ${unplaced.join(" and ")} ${unplaced.length === 1 ? "has" : "have"} too little data to be placed in an overall group.` : ""}
      </p>
    </>
  );
}
