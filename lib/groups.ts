// Color groups (docs/05-score-method.md). Scores are never shown as numbers, only as these groups.

import type { Country, PillarKey, Region } from "./types";

/** 0 = Early stage … 4 = Leading. null = Not enough data. */
export type Tier = 0 | 1 | 2 | 3 | 4 | null;

export const TIER_NAMES = ["Early stage", "Emerging", "Middle", "Advancing", "Leading"] as const;
export const NO_DATA = "Not enough data";

export const tierName = (t: Tier) => (t == null ? NO_DATA : TIER_NAMES[t]);
/** CSS color for a group; the actual colors live in globals.css so they switch with dark mode. */
export const tierColor = (t: Tier) => (t == null ? "var(--nodata)" : `var(--t${t + 1})`);

/**
 * Overall groups: sort the countries that have a score, then split them into five equal-sized groups.
 * Countries with fewer than 4 of 5 pillars have score = null and get "Not enough data".
 */
export function computeTiers(countries: Country[]): Record<string, Tier> {
  const scored = countries
    .filter((c) => c.atlas?.score != null && (c.atlas.n_pillars ?? 0) >= 4)
    .sort((a, b) => (b.atlas!.score as number) - (a.atlas!.score as number));
  const n = scored.length;
  const out: Record<string, Tier> = {};
  for (const c of countries) out[c.iso3] = null;
  scored.forEach((c, i) => {
    out[c.iso3] = (4 - Math.min(4, Math.floor((i * 5) / n))) as Tier;
  });
  return out;
}

/** Pillars use fixed bands: 80+ Leading, 60+ Advancing, 40+ Middle, 20+ Emerging, below 20 Early stage. */
export function pillarTier(v: number | null | undefined): Tier {
  if (v == null) return null;
  return v >= 80 ? 4 : v >= 60 ? 3 : v >= 40 ? 2 : v >= 20 ? 1 : 0;
}

export const PILLARS: { key: PillarKey; label: string; question: string }[] = [
  { key: "productivity", label: "Productivity", question: "How much do farms produce?" },
  { key: "inputs_water", label: "Inputs & water", question: "Do farmers have fertilizer and irrigation?" },
  { key: "policy", label: "Policy", question: "Is government committed?" },
  { key: "infrastructure", label: "Infrastructure", question: "Can farms connect?" },
  { key: "finance", label: "Finance", question: "Can farmers pay and borrow?" },
];

export const REGIONS: Region[] = ["North", "West", "Central", "East", "Southern"];
export const regionSlug = (r: Region) => r.toLowerCase();
export const regionFromSlug = (s: string) => REGIONS.find((r) => r.toLowerCase() === s.toLowerCase());
export const regionColor = (r: Region) => `var(--r-${r.toLowerCase()})`;

export type RegionStats = {
  region: Region;
  countries: Country[];
  /** How many countries in each group, index 0 (Early stage) to 4 (Leading). */
  mix: number[];
  noData: number;
  deep: number;
  leaders: Country[];
  advancing: Country[];
};

export function regionStats(region: Region, countries: Country[], tiers: Record<string, Tier>): RegionStats {
  const cs = countries.filter((c) => c.region === region);
  const mix = [0, 0, 0, 0, 0];
  let noData = 0;
  for (const c of cs) {
    const t = tiers[c.iso3];
    if (t == null) noData++;
    else mix[t]++;
  }
  return {
    region,
    countries: cs,
    mix,
    noData,
    deep: cs.filter((c) => c.deep).length,
    leaders: cs.filter((c) => tiers[c.iso3] === 4),
    advancing: cs.filter((c) => tiers[c.iso3] === 3),
  };
}

/** Sort countries from Leading to Early stage (Not enough data last), then by name. */
export function byTier(tiers: Record<string, Tier>) {
  return (a: Country, b: Country) =>
    (tiers[b.iso3] ?? -1) - (tiers[a.iso3] ?? -1) || a.name.localeCompare(b.name);
}
