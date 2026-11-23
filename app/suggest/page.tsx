import type { Metadata } from "next";
import { Suspense } from "react";
import SuggestForm, { type RecordIndex } from "@/components/SuggestForm";
import { Breadcrumbs } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { toLite } from "@/lib/scope";
import { recordLabel } from "@/lib/suggest";

export const metadata: Metadata = { title: "Suggest an addition or correction" };

export default async function SuggestPage() {
  const atlas = await getAtlas();
  const list = (rows: { id: string }[]) =>
    rows
      .map((r) => ({ id: r.id, label: recordLabel(r as Record<string, unknown>) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  const index: RecordIndex = {
    people: list(atlas.people),
    startups: list(atlas.startups),
    organizations: list(atlas.organizations),
    policies: list(atlas.policies),
    gaps: list(atlas.gaps),
    benchmarks: list(atlas.benchmarks),
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Suggest an addition or correction" }]} />
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Suggest an addition or correction</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        The Atlas stays useful only if it stays current. If you know a startup, person, policy or gap that is missing,
        or something that has changed, tell us here.
      </p>
      <ol className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["1. You suggest", "Fill in what you know and a link that confirms it."],
          ["2. It is reviewed", "The Atlas owner checks the source."],
          ["3. It appears", "Once approved, it shows on the site with today's \"last checked\" date."],
        ].map(([t, d]) => (
          <li key={t} className="border-l-[3px] border-gold pl-3">
            <b className="font-display text-lg">{t}</b>
            <p className="text-sm text-muted">{d}</p>
          </li>
        ))}
      </ol>
      <Suspense fallback={<p className="mt-8 text-muted">Loading the form…</p>}>
        <SuggestForm countries={atlas.countries.map(toLite)} index={index} />
      </Suspense>
    </>
  );
}
