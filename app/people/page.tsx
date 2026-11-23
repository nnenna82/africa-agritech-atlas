import type { Metadata } from "next";
import PeopleList from "@/components/PeopleList";
import { Breadcrumbs, Eyebrow } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { toLite } from "@/lib/scope";

export const metadata: Metadata = { title: "People" };

export default async function PeoplePage() {
  const atlas = await getAtlas();
  return (
    <>
      <Breadcrumbs items={[{ label: "People" }]} />
      <Eyebrow>{atlas.people.length} people</Eyebrow>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">People to learn from</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Experts, officials and builders, with public professional information only. Roles change, so each card says
        when it was last checked and where the role was confirmed.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        <b className="text-fg">Before you reach out:</b> ask one specific question and say why you chose them. Use the
        public links on each card; the Atlas never lists personal emails or phone numbers.
      </p>
      <PeopleList people={atlas.people} countries={atlas.countries.map(toLite)} />
    </>
  );
}
