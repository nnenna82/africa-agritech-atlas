import type { Metadata } from "next";
import PoliciesList from "@/components/PoliciesList";
import SuggestBox from "@/components/SuggestBox";
import { Breadcrumbs, Eyebrow } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { toLite } from "@/lib/scope";

export const metadata: Metadata = { title: "Regulation" };

export default async function RegulationPage() {
  const atlas = await getAtlas();
  return (
    <>
      <Breadcrumbs items={[{ label: "Regulation" }]} />
      <Eyebrow>{atlas.policies.length} policies and frameworks</Eyebrow>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Regulation tracker</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Laws, strategies, programs and continental agreements that shape farming in Africa, newest first. Each links to
        the official text or a report about it.
      </p>
      <PoliciesList policies={atlas.policies} countries={atlas.countries.map(toLite)} />
      <SuggestBox type="policies" what="a policy or regulation" />
    </>
  );
}
