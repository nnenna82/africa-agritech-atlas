# Data model

All content lives in `data/` as JSON, one file per table. `supabase/schema.sql` creates matching tables. Countries are linked everywhere by ISO-3 code (for example `KEN`); continental records use `AU`.

Every table except `news` has `last_verified` (date) and `needs_review` (true/false, with `review_note`). 23 records are flagged for review: mostly people whose role may have changed and startups with unconfirmed status.

## Tables

| Table | Rows | Key fields |
| --- | --- | --- |
| `countries` | 54 | `iso3` (key), `name`, `region` (North/West/Central/East/Southern), `recs` (trade blocs), `capital`, `population_m`, `ag_gdp_pct`, `ag_jobs_pct`, `electricity_access_pct`, `internet_users_pct`, `caadp_br4_score`, `deep` (has a deep dive), `summary`, `narrative`, `strengths[]`, `flagship_programs[]`, `atlas` (score object, below), `sources[]` |
| `organizations` | 139 | `id`, `name`, `type` (gov, regulator, research, DFI, investor, corporate, NGO, multilateral), `subtype`, `countries[]`, `sector_tags[]`, `what`, `website`, `funder` (true for investors and DFIs) |
| `people` | 76 | `id`, `name`, `role`, `organization`, `countries[]`, `diaspora`, `based_in`, `focus`, `talk_to_about`, `public_links[]`, `source` |
| `startups` | 54 | `id`, `name`, `countries[]`, `hq_iso3`, `segment`, `founded`, `stage`, `status`, `notable_funding`, `model`, `diaspora_founded`, `website`, `source` |
| `policies` | 70 | `id`, `title`, `scope` (ISO-3 or `AU`), `type` (law, strategy, program, treaty), `year`, `status`, `summary`, `link` |
| `gaps` | 68 | `id`, `title`, `scope` (ISO-3 or `AU`), `segment`, `root_causes`, `evidence`, `evidence_source`, `who_is_working`, `opportunity` |
| `benchmarks` | 24 | `id`, `source_country`, `theme`, `what_happened`, `outcome`, `transferability` (starts with High/Medium/Low), `link` |
| `news` | 20 | `id`, `date`, `headline`, `summary`, `why`, `countries[]`, `region` (or Continental), `segment`, `type` (funding, policy, market, infrastructure, research, company), `source`, `url` |
| `meta` | 1 | `lead_drivers[]` (eight "why leaders lead" drivers with `explanation` and `examples`), `market_note`, `score_method` |
| `suggestions` | new | Phase 3: `record_type`, `data` (JSON), `source_url`, `status` (pending/approved/rejected), `created_at` |

## The `atlas` object on each country

```json
{
  "pillars": {"productivity": 59, "inputs_water": 68, "policy": 54, "infrastructure": 35, "finance": 38},
  "score": 51,
  "n_pillars": 5,
  "indicators": {"cereal_yield_t_ha": 1.78, "ag_va_per_worker_usd": 1615, "fertilizer_kg_ha": 24.64, "irrigated_pct_cropland": 5.0, "caadp_br4": 8.07, "ag_spend_pct_budget": 2.2, "electricity_pct": 48.7, "internet_pct": 31.7, "account_pct": 42.1}
}
```

Display pillars and the composite as **color groups only** (see `05-score-method.md`). `score` is null for Eritrea and Seychelles (not enough data).

## Value-chain segments (shared tags)

inputs & seeds · irrigation & water · mechanization · storage & cold chain · processing · logistics & market access · finance & insurance · climate & extension · data · energy · transport · digital connectivity · industrial zones

## Access rules

| Table | Visitors | Owner |
| --- | --- | --- |
| All content tables | Read | Read, add, edit, delete |
| `suggestions` | Add only (status forced to `pending`) | Read, approve, reject |
