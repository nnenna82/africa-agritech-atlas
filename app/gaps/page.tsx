import type { Metadata } from "next";
import Link from "next/link";
import GapsList from "@/components/GapsList";
import { Breadcrumbs, Eyebrow } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { toLite } from "@/lib/scope";

export const metadata: Metadata = { title: "Gap map" };

export default async function GapsPage() {
  const atlas = await getAtlas();
  return (
    <>
      <Breadcrumbs items={[{ label: "Gaps" }]} />
      <Eyebrow>{atlas.gaps.length} documented gaps</Eyebrow>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Gap map</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Unsolved problems in African farming, why they persist, who is already on them, and where a founder, funder
        or policymaker could act. Each card names where its evidence comes from.
      </p>
      <GapsList gaps={atlas.gaps} countries={atlas.countries.map(toLite)} />
      <p className="mt-8 text-sm text-muted">
        Want to talk to someone about a gap? See the{" "}
        <Link href="/people" className="underline underline-offset-2">
          people directory
        </Link>
        .
      </p>
    </>
  );
}
