import type { Metadata } from "next";
import { Compare, Playbooks, type CountryValues } from "@/components/GlobalPanels";
import SuggestBox from "@/components/SuggestBox";
import { Breadcrumbs, Eyebrow, Kpi } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { MEASURES, median } from "@/lib/global";

export const metadata: Metadata = { title: "Global comparison" };

export default async function GlobalPage() {
  const atlas = await getAtlas();
  const valueOf = (c: (typeof atlas.countries)[number], k: (typeof MEASURES)[number]["indicator"]) => {
    const v = c.atlas?.indicators?.[k];
    return v == null ? null : Number(v);
  };
  // Africa's median for each measure, from the countries that have data.
  const medians = Object.fromEntries(
    MEASURES.map((m) => [m.key, median(atlas.countries.map((c) => valueOf(c, m.indicator)).filter((v): v is number => v != null))]),
  );
  const countries: CountryValues[] = atlas.countries.map((c) => ({
    iso3: c.iso3,
    name: c.name,
    values: Object.fromEntries(MEASURES.map((m) => [m.key, valueOf(c, m.indicator)])),
  }));

  return (
    <>
      <Breadcrumbs items={[{ label: "Global" }]} />
      <Eyebrow>Global baseline · Asia, the Americas, Europe</Eyebrow>
      <h1 className="mt-2 max-w-4xl font-display text-3xl font-bold leading-tight sm:text-5xl">
        A typical African farm grows about a third of India&rsquo;s cereal yield, and a sixth of America&rsquo;s.
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        The gap is mostly about fertilizer and water, not land or labor. Use this page to see how far behind or ahead a
        country is, and which playbooks closed the gap elsewhere.
      </p>

      <Compare medians={medians} countries={countries} />

      <section aria-label="Key gap figures" className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi value="6% vs 37%" label="of cropland is irrigated, Africa vs Asia (IFPRI)" />
        <Kpi value="<2 vs ~10" label="tractors per 1,000 hectares, Africa vs South Asia (FAO)" />
        <Kpi value="110m" label="farmers with a digital ID in India's AgriStack registry, Oct 2026" />
        <Kpi value="US$3.8bn" label="extra paid by African rice buyers after India's 2023 export ban" />
      </section>

      <Playbooks benchmarks={atlas.benchmarks} />

      <SuggestBox type="benchmarks" what="a global example" />
    </>
  );
}
