import type { Metadata } from "next";
import OrgsList from "@/components/OrgsList";
import StartupsList from "@/components/StartupsList";
import SuggestBox from "@/components/SuggestBox";
import { Breadcrumbs, Eyebrow, Section, SourceLinks } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { links } from "@/lib/format";
import { toLite } from "@/lib/scope";

export const metadata: Metadata = { title: "Startups and funders" };

export default async function StartupsPage() {
  const atlas = await getAtlas();
  const lite = atlas.countries.map(toLite);
  const note = atlas.meta.market_note;
  return (
    <>
      <Breadcrumbs items={[{ label: "Startups" }]} />
      <Eyebrow>{atlas.startups.length} startups · {atlas.organizations.filter((o) => o.funder).length} funders</Eyebrow>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Startups and funders</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Farm-tech and farm-infrastructure companies, with their status checked as of late 2026. Startups that shut down
        or changed course stay listed on purpose: they show what has already been tried.
      </p>
      <StartupsList startups={atlas.startups} countries={lite} />

      <Section
        title="Funders and investors"
        intro="Investors, development lenders (DFIs) and donors that fund farming and its infrastructure. Filtered by the bar's region and country too."
      >
        <OrgsList orgs={atlas.organizations} countries={lite} funders />
      </Section>

      {note?.summary ? (
        <Section title="Funding climate">
          <p className="max-w-prose">{note.summary}</p>
          <SourceLinks items={links(note.sources)} label="Sources" />
        </Section>
      ) : null}

      <SuggestBox type="startups" what="a startup or funder" />
    </>
  );
}
