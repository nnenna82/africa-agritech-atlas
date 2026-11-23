# Scheduled updates

Two automatic jobs keep the Atlas fresh. Each one is a Claude task that runs on a schedule and writes to the Supabase database.

| Job | When | What it may do |
| --- | --- | --- |
| Daily news round-up | Every day, early morning | Add up to 5 new stories to the News page |
| Monthly freshness check | 1st of each month | Mark records as "being checked" and send proposed corrections to `/admin` for the owner to approve. It never changes a record by itself |

Both jobs write through two checked helpers in the database (`supabase/phase4.sql`):

- `add_news(story)` adds one story only if it has a headline, a summary, a "why it matters", a source name, a link to the original article and a date in the last 14 days. It skips stories already in the Atlas.
- `flag_for_review(table, id, note)` turns on the small "being checked" note on one record. It does not change anything else.

New stories appear on the site within about an hour (the site keeps a copy of the data for up to an hour).

**Access:** the job needs to run SQL on Supabase project `jaexggkukamqyhxtbwlw` (Atlas). In Cowork, use the Supabase connector. In a Claude Code cloud session, use the Management API endpoint `POST https://api.supabase.com/v1/projects/jaexggkukamqyhxtbwlw/database/query`. Never paste keys into a prompt.

---

## Prompt 1: Daily news round-up

Copy everything in the box into the scheduled task.

```
You keep the News page of the Africa AgriTech Atlas up to date.
Database: Supabase project jaexggkukamqyhxtbwlw. Run SQL only through the Supabase connection you have. Use ONLY the function public.add_news; never insert, update or delete rows yourself.

1. See what is already there:
   select date, headline, url from news order by date desc limit 30;
2. Search the web for news from the last 2 days about agriculture in Africa and the infrastructure that serves it:
   inputs and seeds, irrigation and water, mechanization, storage and cold chain, processing, logistics and market access,
   finance and insurance, climate and extension advice, farm data, energy, transport, digital connectivity, industrial zones.
   Out of scope: health, mining and general fintech, unless they directly touch the farm value chain.
   Prefer original reporting (national outlets, AllAfrica, Ecofin, Reuters, Bloomberg, AfDB, FAO, ministries).
3. Pick at most 5 stories that are new (not already in the list) and concrete (money committed, a law passed, a project started, a company launched or closed, new data).
4. For each story, write in your own words, in plain English, short sentences, no jargon:
   - headline: under 90 characters
   - summary: 2 to 3 sentences with the key facts and figures, copied from the source accurately. Do not copy the article's sentences.
   - why: 1 sentence on why it matters for farmers or for people working on African agriculture
   Then add it:
   select public.add_news('{"date":"YYYY-MM-DD","headline":"…","summary":"…","why":"…","countries":["KEN"],"region":"East","segment":"energy","type":"infrastructure","source":"Name of outlet","url":"https://…"}'::jsonb);
   Rules for the fields:
   - date: the article's publication date
   - countries: ISO-3 codes of the African countries involved, or ["AU"] for a continent-wide story
   - region: North, West, Central, East, Southern, or Continental (if several regions)
   - segment: one of: inputs & seeds, irrigation & water, mechanization, storage & cold chain, processing, logistics & market access, finance & insurance, climate & extension, data, energy, transport, digital connectivity, industrial zones, policy
   - type: one of funding, policy, market, infrastructure, research, company
   - Escape any single quote in the text by doubling it ('').
5. Reply with a short list: each headline and the result add_news returned. If nothing new and solid was found, add nothing and say so.
```

## Prompt 2: Monthly freshness check

```
You run the monthly freshness check for the Africa AgriTech Atlas.
Database: Supabase project jaexggkukamqyhxtbwlw. Run SQL only through the Supabase connection you have.
You may ONLY (a) call public.flag_for_review and (b) insert rows into the suggestions table as shown below. Never update or delete content rows yourself: the owner approves every change on /admin.

1. Load what to check:
   select id, name, role, organization, countries, source, last_verified, needs_review from people order by last_verified nulls first;
   select id, name, status, notable_funding, website, last_verified from startups order by last_verified nulls first;
   select id, title, scope, status, year from policies where scope <> 'AU';
2. Check on the web, using recent and reliable public sources:
   - People: is each person still in the role listed? Ministers and heads of agencies matter most (reshuffles happen often).
   - Startups: is each still operating? Any new funding round, acquisition, shutdown or pivot?
   - Policies: has any been replaced, passed into law or ended?
   Spend your effort on the oldest last_verified dates first. Check at least 25 records.
3. When something has changed and you have a link that confirms it:
   a) Mark the record:
      select public.flag_for_review('people', '<id>', 'Monthly check <Month YYYY>: <what changed, in one line>');
   b) Send the correction for the owner to approve. Put ONLY the fields that change in data:
      insert into suggestions (record_type, kind, target_id, data, source_url, note, status)
      values ('people', 'correction', '<id>', '{"role":"<new role>"}'::jsonb, 'https://<confirming link>', 'Monthly check <Month YYYY>', 'pending');
      For startups the status field must be one of: active, restructuring, pivoted, acquired, shut down (you may add a short reason after a colon, for example "shut down: ran out of funding (2026)").
4. When you could not confirm a record either way, do nothing to it.
5. Never record personal emails or phone numbers. Public professional information only.
6. Reply with a plain-English summary: how many records you checked, what you flagged (with links), and anything you were unsure about.
```

## Checking that they work

- Daily: open the News page. New stories show "Today" or "Yesterday".
- Monthly: open `/admin`. Proposed corrections wait under "Waiting". Approving one updates the record, adds the new source link and clears nothing else. To clear a "being checked" note after approving, approve a correction that confirms the record (the approval sets `needs_review` back to off).
