import type { Metadata } from "next";
import NewsList from "@/components/NewsList";
import { Breadcrumbs } from "@/components/ui";
import { getAtlas } from "@/lib/data";
import { toLite } from "@/lib/scope";

export const metadata: Metadata = { title: "News" };

export default async function NewsPage() {
  const atlas = await getAtlas();
  return (
    <>
      <Breadcrumbs items={[{ label: "News" }]} />
      <NewsList news={atlas.news} countries={atlas.countries.map(toLite)} />
    </>
  );
}
