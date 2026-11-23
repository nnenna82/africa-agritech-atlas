// Shapes of the Atlas records (see docs/03-data-model.md).

export type Region = "North" | "West" | "Central" | "East" | "Southern";

export type Review = {
  needs_review?: boolean | null;
  review_note?: string | null;
  last_verified?: string | null;
};

export type Indicators = {
  cereal_yield_t_ha?: number | null;
  ag_va_per_worker_usd?: number | null;
  fertilizer_kg_ha?: number | null;
  irrigated_pct_cropland?: number | null;
  caadp_br4?: number | null;
  ag_spend_pct_budget?: number | null;
  electricity_pct?: number | null;
  internet_pct?: number | null;
  account_pct?: number | null;
};

export type PillarKey = "productivity" | "inputs_water" | "policy" | "infrastructure" | "finance";

export type AtlasScore = {
  pillars: Partial<Record<PillarKey, number | null>>;
  score: number | null;
  n_pillars: number;
  indicators: Indicators;
};

export type Country = Review & {
  iso3: string;
  name: string;
  region: Region;
  recs: string[] | null;
  capital: string | null;
  population_m: number | null;
  ag_gdp_pct: number | null;
  ag_jobs_pct: number | null;
  electricity_access_pct: number | null;
  internet_users_pct: number | null;
  caadp_br4_score: number | null;
  deep: boolean | null;
  summary: string | null;
  narrative: string | null;
  strengths: string[] | null;
  flagship_programs: string[] | null;
  atlas: AtlasScore | null;
  sources: string[] | null;
};

export type Organization = Review & {
  id: string;
  name: string;
  type: string | null;
  subtype?: string | null;
  countries: string[] | null;
  sector_tags: string[] | null;
  what: string | null;
  website: string | null;
  funder?: boolean | null;
};

export type Person = Review & {
  id: string;
  name: string;
  role: string | null;
  organization: string | null;
  countries: string[] | null;
  diaspora: boolean | null;
  based_in?: string | null;
  focus: string | null;
  talk_to_about: string | null;
  public_links: string[] | null;
  source: string | null;
};

export type Startup = Review & {
  id: string;
  name: string;
  countries: string[] | null;
  hq_iso3: string | null;
  segment: string | null;
  founded: number | null;
  stage: string | null;
  status: string | null;
  notable_funding: string | null;
  model: string | null;
  diaspora_founded?: boolean | null;
  website: string | null;
  source: string | null;
};

export type Policy = Review & {
  id: string;
  title: string;
  scope: string;
  type: string | null;
  year: number | null;
  status: string | null;
  summary: string | null;
  link: string | null;
};

export type Gap = Review & {
  id: string;
  title: string;
  scope: string;
  segment: string | null;
  root_causes: string | null;
  evidence: string | null;
  evidence_source: string | null;
  who_is_working: string | null;
  opportunity: string | null;
};

export type Benchmark = Review & {
  id: string;
  source_country: string | null;
  theme: string;
  what_happened: string | null;
  outcome: string | null;
  transferability: string | null;
  link: string | null;
};

export type NewsItem = {
  id: string;
  date: string;
  headline: string;
  summary: string | null;
  why: string | null;
  countries: string[] | null;
  region: string | null;
  segment: string | null;
  type: string | null;
  source: string | null;
  url: string | null;
};

export type Meta = {
  as_of?: string;
  lead_drivers?: { driver: string; explanation: string; examples: string | string[] }[];
  market_note?: { summary: string; sources?: string[] };
  score_method?: { version?: string; rule?: string };
};

export type Atlas = {
  countries: Country[];
  organizations: Organization[];
  people: Person[];
  startups: Startup[];
  policies: Policy[];
  gaps: Gap[];
  benchmarks: Benchmark[];
  news: NewsItem[];
  meta: Meta;
  /** Where the data came from: the Supabase database, or the backup files in data/. */
  source: "supabase" | "files";
};
