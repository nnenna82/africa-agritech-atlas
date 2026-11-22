# Build plan

Six phases, built in order. Each ends with something working at a live link. Phases 0–2 are version 1. Do not start Phase 3 until Phase 2's test is passed.

## Phase 0: Set up
- GitHub, Vercel and Supabase accounts; Claude Code installed; this package in the project folder
- Next.js skeleton saved to GitHub and deployed with Vercel
- **Done when:** a "Hello, Atlas" page opens at your own web address

## Phase 1: The map and the country pages
- Create the Supabase tables (`supabase/schema.sql`) and load everything in `data/`
- Home page with the clickable Africa map and the five region cards
- Africa → region → country pages with breadcrumbs and color groups
- **Done when:** you can click from the map to any of the 54 countries on the live site, on a phone too

## Phase 2: The core promise (version 1)
- Gap map, filterable by region, country and part of the chain
- People directory with public links and "last checked" dates
- The bar: I am a · Region → Country · Interested in, with the "For you" panel and interest panel
- Crop Journeys band at the top of Home, a menu button, and crop cards on country pages
- News page and the latest three stories on Home, filtered by region and country
- **Done when:** run the demo script again and at least 4 of 5 people finish their task in under 5 minutes

## Phase 3: Version 2 features
- Startups and funders directory
- Regulation tracker
- Global page comparing Africa with Asia, the Americas and Europe
- "Suggest an addition or correction" form, linked from the end of each page, with suggestions waiting for the owner's approval; owner login and a simple approval page
- **Done when:** someone else submits a suggestion, you approve it, and it appears on the site

## Phase 4: Launch
- Safety check: Row Level Security on every table; visitors can only read; only the owner can approve or delete
- Check every page on a phone and in a private browser window
- A README on GitHub with a description, screenshot and live link
- Two scheduled updates: a daily news round-up and a monthly check for changed ministers, funding rounds and closed startups (run from Claude in Cowork, which writes to Supabase)
- **Done when:** your first real users have the link

## Phase 5: Later sprints (version 3)
- Chat: visitors ask questions and get answers drawn from the Atlas (uses the course's Parley key; set a spending limit and cache answers)
- Downloads: export a country profile or crop journey as a PDF
- Accounts and saved learning progress
- Deep dives for the next 10 countries, then more

## Habits for every Claude Code session
1. Start fresh: "Read CLAUDE.md and docs/02-build-plan.md, then let's do Phase N: <feature>."
2. One feature at a time; check it yourself, including on your phone.
3. When it works: "commit and push to GitHub." Vercel updates the live site.
4. Before ending: "update the Progress section in CLAUDE.md."
5. Never paste passwords or keys into chat or code.
