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
| `docs/07-user-test.md` | The 5-person Phase 2 test: tasks and results sheet |
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

The owner wants to be hands-off. Claude builds, tests and ships on its own, and only stops to ask when it must.

1. Start fresh. Read this file and the build plan.
2. Build the whole phase (or the whole task asked for), one feature at a time, without waiting for approval between features.
3. Test everything yourself before calling it done: phone width (about 400px), light and dark mode, keyboard focus, and the live site after each deploy.
4. Commit when something works and push as you go. Pushing to `main` updates the live site.
5. **Only stop and ask the owner** before deleting files or data, or when something involves keys, passwords or money (accounts, paid plans, spending limits). Never ask for keys in chat.
6. At the end, report back in plain words: what was built, anything blocked, and exactly what to check on a phone.
7. Before ending: update the **Progress** section below.

## Progress

- [x] Phase 0: Set up (skeleton site live on Vercel)
- [x] Phase 1: Data in Supabase, Home map, Africa → region → country pages (live site reads from Supabase since 23 Nov)
- [ ] Phase 2: Gap map, People, the bar, For you and interest panels, Crop Journeys band, News (all built 23 Nov; waiting on the 5-person test in `docs/07-user-test.md`)
- [ ] Phase 3: Startups and funders, Regulation, Global page, suggestions with approval
- [ ] Phase 4: Launch checks, README, scheduled updates
- [ ] Phase 5: Chat, downloads, accounts, more deep dives

Notes from the last session (23 Nov 2026): **Data is now in Supabase.** Project `africa-agritech-atlas`, ref `jaexggkukamqyhxtbwlw` (URL `https://jaexggkukamqyhxtbwlw.supabase.co`, not a secret). Ran `supabase/schema.sql`, `seed-1.sql`, `seed-2.sql` through the Management API SQL endpoint (`POST https://api.supabase.com/v1/projects/jaexggkukamqyhxtbwlw/database/query`). Row counts match `data/README.md` exactly (54 / 139 / 76 / 54 / 70 / 68 / 24 / 20 / 1, suggestions 0). The cloud credential for `api.supabase.com` works for this project, but cannot list projects or read API keys, so always use the ref above.

Added `grant` lines at the end of `schema.sql`: new Supabase projects no longer give the visitor role (`anon`) table access by default, so without them visitors got "permission denied". Tested as `anon`: can read all content tables; cannot insert, update or delete; cannot read suggestions; can only add a suggestion with status `pending`. `OWNER_EMAIL` in the policies is still a placeholder (fill in during Phase 3 when login is added).

**Live site confirmed on Supabase (23 Nov):** Vercel already had `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set for all environments; after the owner redeployed, `/`, `/africa` and `/country/NGA` show `data-source="supabase"`. Checked `/`, `/africa`, `/countries`, `/country/KEN` at 400px in light and dark: all load, no page errors, no sideways scroll. Next session: start Phase 2.

Vercel deploys from `main`: work on the session branch, then fast-forward `main` to publish.

**Phase 2 built (23 Nov, second session):** the bar (`components/BarControls.tsx`, choices saved in the browser via `lib/bar.ts`, key `atlas_bar`), `/gaps`, `/people`, `/news`, For you + interest panels + latest 3 news on Home (`components/HomePanels.tsx`), "My interest" map colors and region fading on the Home map, Crop Journeys gold menu button, band on Home and crop cards on country pages. Crop Journeys is served from `public/crop-journeys.html` (a copy of `prototype/crop-journeys.html` with a doctype, viewport and a "Back to the Atlas" link) so visitors do not need a Claude login. Role, segment and crop lists live in `lib/chain.ts`. The bar's Interested in is the same as the Gap map's "Part of the chain" filter; News keeps its own segment filter (spec). Tested at 400px and 1280px, light and dark, keyboard focus: no page errors, no sideways scroll.

Data notes: only 18 of 68 gaps have `evidence_source`, `opportunity` and `who_is_working`; the other 50 name their source inside the evidence text. Startups, Organizations, Regulation, Global and Learn pages are not in the menu yet (Phase 3). Next: run the 5-person test, log results as Round 3 in `docs/06-feedback-log.md`, then tick Phase 2.
