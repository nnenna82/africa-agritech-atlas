// Figures for the Global page. Africa's median is worked out from data/countries.json on each load;
// the comparison countries come from the Cowork prototype (prototype/atlas-prototype.html, GLOBAL),
// with their source and year shown on the page.

import type { Indicators } from "./types";

export type Measure = {
  key: "yield" | "fert" | "vapw";
  title: string;
  unit: string;
  year: string;
  digits: number;
  indicator: keyof Indicators;
  source: string;
  rows: [string, number][];
};

export const MEASURES: Measure[] = [
  {
    key: "yield",
    title: "Cereal yield",
    unit: "tonnes per hectare",
    year: "2024",
    digits: 1,
    indicator: "cereal_yield_t_ha",
    source: "FAO via Our World in Data",
    rows: [["India", 3.63], ["Brazil", 5.0], ["Vietnam", 6.04], ["China", 6.49], ["Netherlands", 6.81], ["United States", 8.41]],
  },
  {
    key: "fert",
    title: "Fertilizer use",
    unit: "kg per hectare of cropland",
    year: "2023",
    digits: 0,
    indicator: "fertilizer_kg_ha",
    source: "FAO via Our World in Data",
    rows: [["United States", 108], ["Netherlands", 126], ["India", 182], ["Vietnam", 243], ["Brazil", 285], ["China", 335]],
  },
  {
    key: "vapw",
    title: "Value added per farm worker",
    unit: "US$ (constant prices)",
    year: "2025",
    digits: 0,
    indicator: "ag_va_per_worker_usd",
    source: "World Bank WDI via Our World in Data (no comparable US figure)",
    rows: [["India", 2159], ["Vietnam", 3418], ["China", 8631], ["Brazil", 14203], ["Netherlands", 89045]],
  },
];

export const median = (vals: number[]) => {
  const v = [...vals].sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};

/** Which tab a global example belongs to. */
export type PlaybookRegion = "asia" | "americas" | "europe" | "africa" | "trends";
export const PLAYBOOK_REGIONS: { key: PlaybookRegion; label: string }[] = [
  { key: "asia", label: "Asia" },
  { key: "americas", label: "Americas" },
  { key: "europe", label: "Europe & Middle East" },
  { key: "africa", label: "African peers" },
  { key: "trends", label: "Global trends" },
];
export function playbookRegion(b: { source_country: string | null; theme: string }): PlaybookRegion {
  const c = b.source_country ?? "";
  if (/^global|trend/i.test(c) || /trend/i.test(b.theme)) return "trends";
  if (/india|china|vietnam|bangladesh|indonesia/i.test(c)) return "asia";
  if (/brazil|united states/i.test(c)) return "americas";
  if (/netherlands|israel|european/i.test(c)) return "europe";
  return "africa";
}

/** Words that make a global example especially relevant to each visitor role. */
export const ROLE_MATCH: Record<string, RegExp> = {
  builder: /\bai\b|biological|machin|mechaniz|e-commerce|digital|irrigation/i,
  funder: /credit|carbon|finance|safra|e-commerce|economic zone|phosphate/i,
  policy: /land|reform|policy|regulation|ban|cap |extension|registry|agristack|transfer|delivery|zone/i,
  research: /research|embrapa|extension|data|gene|wageningen|land-grant/i,
  student: /green revolution|doi moi|embrapa|land-grant|\bai\b/i,
};

/** "High", "Medium" or "Low" from the start of the transferability text. */
export const transferLevel = (t: string | null) => (t ?? "").match(/^(High|Medium|Low)/i)?.[1] ?? null;
