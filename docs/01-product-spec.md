# Product spec

**Promise:** someone arrives wanting to help with African agriculture and leaves knowing a real problem and who to talk to about it.

**Audiences:** students and newcomers, founders and builders, investors and funders, policy and development professionals, researchers.

**Scope:** agriculture (inputs, irrigation, mechanization, storage, processing, logistics, finance, data, extension) and the infrastructure that enables it (energy, transport, digital, industrial zones). Health, mining and general fintech are out of scope unless they touch the farm value chain.

The live Cowork prototype in `prototype/atlas-prototype.html` and the screenshots in `screenshots/` are the reference for every page below. Where this spec and the prototype disagree, follow this spec.

---

## The bar (every page)

A dark bar under the menu with four dropdowns:

| Dropdown | Options | Effect |
| --- | --- | --- |
| I am a | Student or newcomer · Founder or builder · Investor or funder · Policy or development professional · Researcher or analyst | Shows a "For you" panel on Home; reorders People so matching roles come first |
| Region | All of Africa · North · West · Central · East · Southern | Filters every list and the news to that region (continental items always show); fades other regions on the Home map |
| Country | Locked until a region is picked; lists that region's countries, deep dives first | Filters everything to the country; switching region clears it |
| Interested in | The 13 value-chain segments (see data model) | Shows the interest panel on Home and colors the map by "documented gap in this area" |

A **Clear** button resets all four. Choices are remembered in the visitor's browser only.

## Menu

Home · Crop Journeys ↗ (gold, opens the separate Crop Journeys page) · Africa & regions · Gaps · Startups · People · Organizations · Regulation · Global · News · Learn

The menu wraps onto two lines on narrow screens; nothing is cut off.

## Pages

### Home (`/`)
1. Title and one-line intro
2. **Crop Journeys band:** four crop cards (Cocoa, Maize, Coffee, Tomatoes) each with a one-line hook, linking to the Crop Journeys page at that crop
3. **Map + regions:** clickable Africa map on the left with buttons to color it by Regions / Atlas groups / My interest; five region cards on the right (color swatch, countries count, deep dives, strongest countries, a small color-mix bar). Hover shows "Country · Region · Group"; click opens the country
4. "For you" panel (if a role is picked) and the interest panel (if an interest is picked)
5. Latest three news stories, with a link to all news
6. Four links: gaps, people, startups, global examples

### Africa (`/africa`)
Breadcrumb Home › Africa. Headline finding, region map and cards, the CAADP review leaders, **"What the leaders have in common"** (eight drivers, each a card with explanation and examples), biggest continental gaps, funding climate, top 15 countries by color group, link to the full countries table.

### Region (`/region/[name]`)
Breadcrumb Home › Africa › East Africa. Summary line (countries, deep dives, startups, people, trade blocs). Zoomed map colored by group (keep the full map's proportions; fade neighbors). "How the region compares" (group mix and leaders), "Most documented gaps here", startups based here, and a grid of country cards sorted from Leading to Early stage.

### Country (`/country/[iso3]`)
Breadcrumb Home › Africa › Region › Country. Color-group scale, key facts, **Score by pillar** (each pillar as a color group with its real indicator values), "Why it is where it is" (deep dives) or a baseline summary, flagship programs, crop cards for crops grown there, gaps, people to talk to, stakeholders, startups, policies, sources, and a "Suggest an addition or correction" box.

### Gaps (`/gaps`)
Cards with segment, scope, evidence, root causes, who is working on it, opportunity. Filters: search, segment, scope.

### People (`/people`)
Cards: name, role, organization, countries, diaspora tag, focus, "Talk to them about", public links, "being checked" note if `needs_review`. Filters: search, country, diaspora only.

### News (`/news`)
Newest first, labelled Today / Yesterday / date. Each item: headline, summary, "Why it matters", country and segment tags, type, "Read at <source> ↗". Filters: type and segment, plus the bar's region and country.

### Learn (`/learn`)
12-week roadmap, link to Crop Journeys, how the color groups work, glossary.

### Phase 3 pages
- **Startups** (`/startups`): table with segment, countries, founded, status chip (active / restructuring / shut down), model, funding; funders below. Failures stay visible on purpose
- **Organizations** (`/organizations`), **Regulation** (`/regulation`, newest first)
- **Global** (`/global`): bars comparing Africa's median with India, Brazil, Vietnam, China, the Netherlands and the US (cereal yield, fertilizer use, value added per worker) plus the visitor's chosen country; key gap figures; "Playbooks that closed the gap" tabs (Asia, Americas, Europe & Middle East, African peers, Global trends) with transferability chips and "for you" tags by role
- **Suggest an addition or correction** (`/suggest`): explains the three steps (you suggest → owner reviews → it appears), then a form by record type that requires a source link. Linked from a box at the end of each list page and country page. Submissions go to `suggestions` with status `pending`; the owner approves from a simple admin page

### Later (Phase 5)
Chat ("Ask the Atlas", answers drawn from Atlas data, with a spending limit); downloadable PDFs of country profiles and crop journeys; accounts with saved roadmap progress.

## Crop Journeys
A separate interactive page (`prototype/crop-journeys.html`), already working. In v1, link to it. A later phase can move it into the Next.js site as `/journeys/[crop]`.
