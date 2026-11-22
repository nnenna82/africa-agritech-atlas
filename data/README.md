# Data

Exported from the live Cowork prototype in November 2026. One JSON file per table; each file is an array of records (except `meta.json`, one object). Fields are explained in `docs/03-data-model.md`.

| File | Records | Notes |
| --- | --- | --- |
| countries.json | 54 | 10 deep dives (`deep: true`); `atlas` holds pillar scores |
| organizations.json | 139 | 1 flagged for review |
| people.json | 76 | 16 flagged (role may have changed) |
| startups.json | 54 | 6 flagged (status not confirmed) |
| policies.json | 70 | |
| gaps.json | 68 | |
| benchmarks.json | 24 | Global playbooks |
| news.json | 20 | Sample stories, 4–17 Nov 2026 |
| meta.json | 1 | "Why leaders lead" drivers, funding note, score method |

**Loading:** in Phase 1 ask Claude Code to write a small script (`scripts/load-data.ts`) that reads these files and inserts them into Supabase using the service key from `.env.local`. Run it once; re-run it safely after edits (upsert by `id` / `iso3`).

**Rules:** keep `source` and `last_verified` on every record. Do not fill gaps with estimates. People records are public professional information only.
