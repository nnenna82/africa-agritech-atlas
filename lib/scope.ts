// How the bar's Region and Country choices filter lists.
// - Country chosen: keep records about that country (plus continental ones, where allowed).
// - Region chosen: keep records about any country in that region (plus continental ones, where allowed).
// - Nothing chosen: keep everything.

import type { Region } from "./types";

/** A small country record that is cheap to send to the browser. */
export type CountryLite = { iso3: string; name: string; region: Region; deep: boolean };

export function makeScope(countries: CountryLite[], region: string, country: string) {
  const regionOf = new Map(countries.map((c) => [c.iso3, c.region as string]));
  const nameOf = new Map(countries.map((c) => [c.iso3, c.name]));
  return {
    nameOf: (iso: string) => (iso === "AU" ? "Continental" : nameOf.get(iso) ?? iso),
    /** Does a record about these countries match the bar? `continental` keeps AU-wide records. */
    matches(isos: (string | null | undefined)[], continental = false): boolean {
      const list = isos.filter(Boolean) as string[];
      if (continental && list.includes("AU")) return true;
      if (country) return list.includes(country);
      if (region) return list.some((i) => regionOf.get(i) === region);
      return true;
    },
    /** Plain words for what the bar is showing, or null if nothing is chosen. */
    label: country ? nameOf.get(country) ?? country : region ? `${region} Africa` : null,
  };
}

export const toLite = (c: { iso3: string; name: string; region: Region; deep: boolean | null }): CountryLite => ({
  iso3: c.iso3,
  name: c.name,
  region: c.region,
  deep: !!c.deep,
});
