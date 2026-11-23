# Africa AgriTech Atlas

A living, searchable map of agricultural and infrastructure technology across all 54 African countries. Visitors learn who is building, who funds, who regulates, where countries lead or lag and why, and leave knowing **a real problem** and **who to talk to** about it.

Owner: Nnenna Madueke (solo project, MIT AI Builder Space). Plain-language explanations please: the owner is not a professional developer.

## Read these first

| File | What it is |
| --- | --- |
| `docs/01-product-spec.md` | What the site does, page by page |
| `docs/02-build-plan.md` | The phases and what "done" means for each |
| `docs/03-data-model.md` | Tables, fields and how they link |
| `docs/04-design-system.md` | Colors, fonts, components, map rules |
| `docs/05-score-method.md` | How countries are placed into five color groups |
| `docs/06-feedback-log.md` | What testers asked for, and what changed |
| `prompts/` | Copy-paste prompts for each phase |
| `data/` | All Atlas content as JSON, one file per table |
| `supabase/schema.sql` | Starting database schema with access rules |
| `prototype/` | The working Cowork prototype (reference only) |
| `screenshots/` | How each page looks in the prototype |

## Tech stack

- **Next.js** (App Router, TypeScript) hosted on **Vercel**, deployed from GitHub
- **Supabase** for the database and, in Phase 3, the owner's login
- **Map:** `d3-geo` + `topojson-client` + `world-atlas` (Natural Earth outlines, public domain). Draw the 54 countries; show Western Sahara in grey, not clickable; add dots for Cabo Verde, São Tomé and Príncipe, Comoros, Mauritius and Seychelles if they are missing at that resolution
- No AI calls inside the app until Phase 5

## Rules

1. **Keys never go in code or chat.** Put them in `.env.local`, make sure `.env*` is in `.gitignore`, and use Vercel's environment variables for the live site.
2. **Commit before big changes, and commit when something works.** Push to GitHub at the end of every session.
3. **Ask before deleting files or data.**
4. **Data rules**
   - Every record keeps a source link and a `last_verified` date. Never invent or estimate data to fill a gap: show "Not enough data" instead.
   - People: public professional information only (name, role, organization, public links). Never store personal emails or phone numbers.
   - Records with `needs_review: true` stay visible but show a small "being checked" note.
   - News summaries are written in our own words and always link to the original article.
5. **Scores are shown as color groups, never as numbers.** Five groups, from Early stage to Leading, compared with other African countries (see `docs/05-score-method.md`). Underlying indicators (yields, electricity access) may show real values.
6. **Visitors can only read.** Only the owner can add, approve or delete records. Visitor suggestions go into a `suggestions` table with status `pending` (Phase 3).
7. **Every page must work on a phone** (about 400px wide), in light and dark mode, with keyboard focus visible.
8. Write copy in plain words, short sentences, no jargon without an explanation.

## Version 1 scope (Phases 0–2)

Home with clickable Africa map and Crop Journeys band · Africa → region → country pages with breadcrumbs and color groups · Gap map · People directory · The bar (I am a · Region → Country · Interested in) with "For you" and interest panels · News page with latest stories on Home.

Out of scope for v1: startups and funders directory, regulation tracker, Global page and the suggestion form (Phase 3); chat, downloads and accounts (Phase 5).

## How we work each session

1. Start fresh. Read this file and the build plan.
2. One feature at a time. Explain what you're about to do in a sentence first.
3. After each feature, tell the owner exactly what to click to check it.
4. When it works: commit and push.
5. Before ending: update the **Progress** section below.

## Progress

- [x] Phase 0: Set up (skeleton site live on Vercel)
- [ ] Phase 1: Data in Supabase; Home map; Africa → region → country pages
- [ ] Phase 2: Gap map, People, the bar, For you and interest panels, Crop Journeys band, News
- [ ] Phase 3: Startups and funders, Regulation, Global page, suggestions with approval
- [ ] Phase 4: Launch checks, README, scheduled updates
- [ ] Phase 5: Chat, downloads, accounts, more deep dives

Notes from the last session: Phase 0 done. Live site: https://africa-agritech-atlas.vercel.app/ (Vercel deploys automatically on every push to `main`). Supabase project created (Americas region); `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set in Vercel. Phase 1 started: `scripts/build-seed.mjs` builds `supabase/seed-1.sql` and `seed-2.sql` from `data/` (tested locally; counts match). Not yet run in Supabase. The owner wants to be hands-off, so the plan is for Claude to run `schema.sql` and the seed files itself through the Supabase Management API (`api.supabase.com`, SQL endpoint), using a `SUPABASE_ACCESS_TOKEN` the owner adds in the cloud environment settings, never in chat. Next after that: the Home map.
