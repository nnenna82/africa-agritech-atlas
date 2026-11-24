import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";
import type { RecordIndex } from "@/components/SuggestForm";
import { getAtlas } from "@/lib/data";
import { toLite } from "@/lib/scope";
import { recordLabel } from "@/lib/suggest";

export const metadata: Metadata = { title: "Review suggestions", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const atlas = await getAtlas();
  const list = (rows: { id: string }[]) => rows.map((r) => ({ id: r.id, label: recordLabel(r as Record<string, unknown>) }));
  const index: RecordIndex = {
    people: list(atlas.people),
    startups: list(atlas.startups),
    organizations: list(atlas.organizations),
    policies: list(atlas.policies),
    gaps: list(atlas.gaps),
    benchmarks: list(atlas.benchmarks),
    countries: atlas.countries.map((c) => ({ id: c.iso3, label: c.name })),
  };
  return (
    <>
      <h1 className="font-display text-4xl font-bold">Review suggestions</h1>
      <p className="mt-2 max-w-2xl text-muted">
        For the Atlas owner only. Approved suggestions appear on the site straight away.
      </p>
      <AdminPanel countries={atlas.countries.map(toLite)} index={index} />
    </>
  );
}
