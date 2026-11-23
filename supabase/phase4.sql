-- Phase 4: helpers for the two scheduled updates (see docs/08-scheduled-updates.md).
-- Run once after phase3.sql. Safe to run again.
--
-- The scheduled updates run SQL through the Supabase Management API (or the Supabase connector),
-- which can do anything. These functions give them a narrow, checked way to write, and the
-- prompts tell them to use only these.

-- No two news stories may point to the same article.
create unique index if not exists news_url_unique on news (url);

-- Add one news story. Returns 'added', or 'skipped: <reason>' without changing anything.
create or replace function public.add_news(item jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  d date := coalesce((item ->> 'date')::date, current_date);
  head text := trim(item ->> 'headline');
  link text := trim(item ->> 'url');
  reg text := coalesce(nullif(trim(item ->> 'region'), ''), 'Continental');
  new_id text;
begin
  if coalesce(head, '') = '' or coalesce(trim(item ->> 'summary'), '') = '' or coalesce(trim(item ->> 'why'), '') = '' then
    return 'skipped: headline, summary and why are all required';
  end if;
  if link is null or link !~* '^https?://' then return 'skipped: needs a link to the original article'; end if;
  if coalesce(trim(item ->> 'source'), '') = '' then return 'skipped: needs the name of the source'; end if;
  if reg not in ('North','West','Central','East','Southern','Continental') then return 'skipped: unknown region ' || reg; end if;
  if d > current_date or d < current_date - 14 then return 'skipped: date must be within the last 14 days'; end if;
  if exists (select 1 from news where url = link) then return 'skipped: already in the Atlas'; end if;
  if length(item::text) > 6000 then return 'skipped: too long'; end if;

  new_id := 'n-' || to_char(d, 'YYYYMMDD') || '-' || trim(both '-' from left(regexp_replace(lower(head), '[^a-z0-9]+', '-', 'g'), 40));
  if exists (select 1 from news where id = new_id) then new_id := new_id || '-' || substr(md5(link), 1, 6); end if;
  insert into news (id, date, headline, summary, why, countries, region, segment, type, source, url)
  values (
    new_id, d, head, trim(item ->> 'summary'), trim(item ->> 'why'),
    coalesce(array(select jsonb_array_elements_text(item -> 'countries')), '{}'),
    reg, nullif(trim(item ->> 'segment'), ''), nullif(trim(item ->> 'type'), ''), trim(item ->> 'source'), link
  );
  return 'added';
end $$;

-- Mark a record as "being checked" with a short note. Never changes the record's content.
create or replace function public.flag_for_review(tbl text, rec_id text, note text) returns text
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if tbl not in ('people','startups','organizations','policies','gaps','benchmarks') then
    return 'skipped: unknown table ' || tbl;
  end if;
  if coalesce(trim(note), '') = '' then return 'skipped: a note is required'; end if;
  execute format('update %I set needs_review = true, review_note = $1 where id = $2', tbl)
    using left(trim(note), 300), rec_id;
  get diagnostics n = row_count;
  return case when n = 1 then 'flagged' else 'skipped: no record with id ' || rec_id end;
end $$;

-- Only the database's own admin connection (used by the scheduled updates) may call these.
revoke all on function public.add_news(jsonb) from public, anon, authenticated;
revoke all on function public.flag_for_review(text, text, text) from public, anon, authenticated;
