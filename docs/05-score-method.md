# How countries get their color group

The Atlas places each country into one of five color groups. It is a **comparison with other African countries**, not a grade. We show groups, not numbers, because testers said exact numbers were hard to justify.

## Five pillars, nine indicators

| Pillar | What it asks | Indicators (latest data) |
| --- | --- | --- |
| Productivity | How much do farms produce? | Cereal yield, t/ha (FAO, 2024) · Ag value added per worker, US$ (World Bank, 2025) |
| Inputs & water | Do farmers have fertilizer and irrigation? | Fertilizer kg/ha of cropland (FAO, 2023) · Irrigated share of cropland (CIA/FAO; national figures for Rwanda, Kenya, Ghana) |
| Policy | Is government committed? | CAADP 4th Biennial Review score vs the 9.29 "on track" mark · Ag share of public spending vs the 10% Maputo target |
| Infrastructure | Can farms connect? | Electricity access % · Internet users % |
| Finance | Can farmers pay and borrow? | Adults with a bank or mobile-money account % (Global Findex, 2024) |

## The rules

1. Each indicator becomes a 0–100 rank against the other African countries with data (policy indicators are scored against their targets instead).
2. A pillar is the average of its indicators.
3. The overall score is the average of the pillars. A country needs **at least 4 of 5 pillars**, otherwise it shows "Not enough data" (Eritrea and Seychelles today).
4. **Display:** split the 52 scored countries into five equal-sized groups:
   Early stage · Emerging · Middle · Advancing · Leading.
   Pillars use fixed bands: 80+ Leading, 60+ Advancing, 40+ Middle, 20+ Emerging, below 20 Early stage.
5. On country pages, show each pillar's group **and** its real indicator values (for example "Cereal yield 1.8 t/ha"), so visitors can see why.

## Known weak spots (say so on the Learn page)
- 20 countries have no CAADP review score, so their policy pillar uses spending only.
- Irrigation figures are old for most countries.
- The groups move when data updates; record the data date in `meta.score_method.version`.

The scores are pre-computed in `data/countries.json` (`atlas` field). The app only needs to turn them into groups. Group cut-offs: sort the 52 scores and split into fifths.
