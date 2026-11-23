import type { MetadataRoute } from "next";
import { getAtlas } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

// The list of pages search engines may visit. /admin is left out on purpose.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const atlas = await getAtlas();
  const pages = ["", "/africa", "/countries", "/gaps", "/people", "/news", "/startups", "/organizations", "/regulation", "/global", "/suggest"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...["north", "west", "central", "east", "southern"].map((r) => ({ url: `${SITE_URL}/region/${r}` })),
    ...atlas.countries.map((c) => ({ url: `${SITE_URL}/country/${c.iso3}` })),
  ];
}
