# Phase 1 prompts: the map and the country pages

## 1. Database
```
Read CLAUDE.md, docs/03-data-model.md and supabase/schema.sql. Explain in plain words what each table holds. Then tell me how to run schema.sql in the Supabase SQL editor (leave OWNER_EMAIL as it is for now; we set the login in Phase 3).
```

## 2. Load the data
```
Write scripts/load-data.ts that reads every file in data/ and upserts it into the matching Supabase table using the service key from .env.local. Run it, then show me the row count for each table. They should match data/README.md.
```

## 3. Home map
```
Build the Home page from docs/01-product-spec.md (items 1, 3 and 6 only for now; the Crop Journeys band, panels and news come in Phase 2). Draw the map with d3-geo, topojson-client and world-atlas following the map rules in docs/04-design-system.md. Look at screenshots/01-home.png for layout; the real map must show actual country shapes, not squares. Add a phone menu button: the prototype's phone menu is broken (see docs/06-feedback-log.md).
```

## 4. Region and country pages
```
Build /africa, /region/[name] and /country/[iso3] following docs/01-product-spec.md, with breadcrumbs. Show scores only as color groups using docs/05-score-method.md. Use screenshots 02, 03 and 04 as the visual reference.
```

## 5. Check and close
```
Give me a checklist of 6 things to click on the live site (including on my phone and in dark mode) to confirm Phase 1 is done. Then update Progress in CLAUDE.md, commit and push.
```
