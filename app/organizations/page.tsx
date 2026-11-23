import type { Metadata } from "next";
import OrgsList from "@/components/OrgsList";
import SuggestBox from "@/components/SuggestBox";
import { Breadcrumbs, Eyebrow } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { toLite } from "@/lib/scope";

export const metadata: Metadata = { title: "Organizations" };

export default async function OrganizationsPage() {
  const atlas = await getAtlas();
  return (
    <>
      <Breadcrumbs items={[{ label: "Organizations" }]} />
      <Eyebrow>{atlas.organizations.length} organizations</Eyebrow>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Organizations</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Ministries, regulators, research bodies, development lenders, investors, companies and non-profits working on
        African farming and the infrastructure behind it.
      </p>
      <OrgsList orgs={atlas.organizations} countries={atlas.countries.map(toLite)} />
      <SuggestBox type="organizations" what="an organization" />
    </>
  );
}
