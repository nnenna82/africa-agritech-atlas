// Shared lists for Phase 2: visitor roles, the 13 parts of the value chain, and the four Crop Journeys.

import type { Person } from "./types";

export type Role = "student" | "builder" | "funder" | "policy" | "research";

export const ROLES: { key: Role; label: string }[] = [
  { key: "student", label: "Student or newcomer" },
  { key: "builder", label: "Founder or builder" },
  { key: "funder", label: "Investor or funder" },
  { key: "policy", label: "Policy or development professional" },
  { key: "research", label: "Researcher or analyst" },
];
export const roleLabel = (r: string) => ROLES.find((x) => x.key === r)?.label ?? "";

/** The 13 value-chain segments (docs/03-data-model.md). */
export const SEGMENTS = [
  "inputs & seeds",
  "irrigation & water",
  "mechanization",
  "storage & cold chain",
  "processing",
  "logistics & market access",
  "finance & insurance",
  "climate & extension",
  "data",
  "energy",
  "transport",
  "digital connectivity",
  "industrial zones",
] as const;

/**
 * Plain-language explanation of each segment, for the interest panel on Home.
 * `match` picks global examples (benchmarks) about this part of the chain; `crop` links a Crop Journey.
 */
export const SEGMENT_INFO: Record<string, { stage: string; what: string; why: string; match: RegExp; crop?: string }> = {
  "inputs & seeds": {
    stage: "Upstream",
    what: "Seed, fertilizer and crop protection that farmers buy before planting.",
    why: "Inputs are the biggest single lever on yield. Without good seed and fertilizer, nothing later in the chain can make up the difference.",
    match: /green revolution|biological|bimas|phosphate|seed|fertili/i,
    crop: "maize",
  },
  "irrigation & water": {
    stage: "On the farm",
    what: "Getting water to crops when rain is not enough: pumps, canals, drip lines and the water itself.",
    why: "Rain-fed farms rise and fall with the weather. Irrigation turns one uncertain harvest into reliable, often multiple harvests a year.",
    match: /irrigation|drip|water|tubewell/i,
    crop: "tomatoes",
  },
  mechanization: {
    stage: "On the farm",
    what: "Tractors, tillers, threshers and other machines, usually rented as a service rather than owned.",
    why: "Hand tools cap how much land a family can farm and how fast it can plant when the rains come.",
    match: /machin|tiller|mechaniz/i,
  },
  "storage & cold chain": {
    stage: "Midstream",
    what: "Keeping crops safe after harvest: dry stores and airtight bags for grain, cold rooms and refrigerated trucks for fresh food.",
    why: "Losses here wipe out the farmer's work after it is done. Good storage also lets farmers sell later at better prices.",
    match: /storage|cold|e-commerce/i,
    crop: "tomatoes",
  },
  processing: {
    stage: "Midstream to downstream",
    what: "Turning raw crops into products: milling, drying, grinding cocoa, making paste or oil.",
    why: "Processing is where most value is added. Exporting raw crops sends that value, and the jobs, abroad.",
    match: /processing|phosphate|economic zone|value/i,
    crop: "cocoa",
  },
  "logistics & market access": {
    stage: "Midstream",
    what: "Collecting crops from many small farms, moving them, and connecting farmers to buyers and markets.",
    why: "Thin, scattered markets mean low farm prices and high shop prices, with traders carrying the risk in between.",
    match: /e-nam|market|e-commerce|trade|ban/i,
    crop: "maize",
  },
  "finance & insurance": {
    stage: "Enabler, every stage",
    what: "Loans for inputs and equipment, crop insurance, and payment systems that reach farmers.",
    why: "Farmers can rarely invest without credit, and one bad season without insurance can wipe them out.",
    match: /credit|safra|insurance|upi|pm-kisan|finance|carbon/i,
    crop: "maize",
  },
  "climate & extension": {
    stage: "Enabler, on the farm",
    what: "Advice to farmers on what and how to plant (called extension), plus weather and climate information.",
    why: "Better advice is one of the cheapest ways to raise yields, and climate change makes it more urgent.",
    match: /extension|\bai\b|backyard|land-grant|advisory/i,
  },
  data: {
    stage: "Enabler, every stage",
    what: "Farmer registries, crop and price data, and maps that let governments and companies target help.",
    why: "You cannot deliver subsidies, loans or advice to farmers you cannot identify.",
    match: /agristack|registry|data|upi|pm-kisan/i,
  },
  energy: {
    stage: "Enabler, every stage",
    what: "Electricity for pumping, cooling, milling and processing, from the grid, mini-grids or solar.",
    why: "Without power, irrigation, cold storage and processing stay out of reach.",
    match: /power|energy|solar|economic zone/i,
  },
  transport: {
    stage: "Enabler, midstream",
    what: "Rural roads, rail, ports and trucking that move crops to market.",
    why: "Bad roads raise costs and losses at every step between the farm and the buyer.",
    match: /road|infrastructure|economic zone/i,
    crop: "tomatoes",
  },
  "digital connectivity": {
    stage: "Enabler, every stage",
    what: "Mobile networks and internet access in rural areas.",
    why: "Digital payments, advice and markets only work where farmers can get online.",
    match: /digital|upi|e-commerce|\bai\b/i,
  },
  "industrial zones": {
    stage: "Downstream",
    what: "Areas with shared power, water and transport where processors cluster.",
    why: "Zones can make processing affordable, but many in Africa have struggled without reliable power and anchor investors.",
    match: /economic zone|phosphate|industr/i,
    crop: "cocoa",
  },
};

/** The Crop Journeys page (a separate interactive page, served from public/crop-journeys.html). */
export const CJ_URL = "/crop-journeys.html";

export const CROPS: { key: string; name: string; hook: string; countries: string[] }[] = [
  { key: "cocoa", name: "Cocoa", hook: "Why farmers get about 11% of a chocolate bar's price", countries: ["CIV", "GHA"] },
  { key: "maize", name: "Maize", hook: "Store or sell? Try the storage lab", countries: ["KEN", "TZA", "NGA"] },
  { key: "coffee", name: "Coffee", hook: "How washing stations multiplied Rwanda's coffee value", countries: ["ETH", "RWA"] },
  { key: "tomatoes", name: "Tomatoes", hook: "Ride the truck: why Nigeria loses up to half its crop", countries: ["NGA", "MAR"] },
];

/** A rough guess at which kind of visitor a person is most useful to, from their role and organization. */
export function personKind(p: Pick<Person, "role" | "organization">): Role {
  const role = p.role ?? "";
  const r = `${role} ${p.organization ?? ""}`;
  if (/minister|secretary|prime minister|permanent|principal secretary|deputy/i.test(role)) return "policy";
  if (/invest|fund|capital|bank|afdb|dfi|acumen|agdevco|partech|novastar/i.test(r)) return "funder";
  if (/kalro|ilri|iita|cgiar|um6p|research|\barc\b|crig|cnra|eiar|institute|university|rab\b/i.test(r)) return "research";
  return "builder";
}

/** The kind of person shown first for each visitor role (students learn from researchers). */
export const peopleKindFor = (role: string): Role | null =>
  role === "student" ? "research" : ROLES.some((r) => r.key === role) ? (role as Role) : null;

export const PILLAR_LABELS: Record<string, string> = {
  productivity: "productivity",
  inputs_water: "inputs and water",
  policy: "policy",
  infrastructure: "infrastructure",
  finance: "finance",
};
