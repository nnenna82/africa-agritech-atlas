-- Phase 3: owner login, suggestions with review.
-- Run once after schema.sql. Safe to run again.
--
-- The owner's email is NOT written in this file (it is public on GitHub). It lives in the private
-- `owners` table, added separately with:
--   insert into owners (email) values ('the-owner@example.com');
-- Visitors cannot read that table; the access rules ask is_owner() instead.

create table if not exists owners (email text primary key);
alter table owners enable row level security;
revoke all on owners from anon, authenticated;

-- True when the person logged in is the owner. "security definer" lets it look in the private table.
create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from owners where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

-- Replace the OWNER_EMAIL placeholder rules with is_owner().
do $$ declare t text; begin
  foreach t in array array['countries','organizations','people','startups','policies','gaps','benchmarks','news','meta'] loop
    execute format('drop policy if exists "owner write" on %I', t);
    execute format('create policy "owner write" on %I for all to authenticated using (public.is_owner()) with check (public.is_owner())', t);
  end loop;
end $$;

-- Suggestions: a few more fields, and size limits so the form cannot be used to store junk.
alter table suggestions add column if not exists kind text not null default 'addition';
alter table suggestions add column if not exists target_id text;
alter table suggestions add column if not exists note text;
alter table suggestions add column if not exists reviewed_at timestamptz;
alter table suggestions add column if not exists result_id text;
alter table suggestions drop constraint if exists suggestions_kind;
alter table suggestions add constraint suggestions_kind check (kind in ('addition', 'correction'));
alter table suggestions drop constraint if exists suggestions_size;
alter table suggestions add constraint suggestions_size check (
  octet_length(data::text) < 10000 and length(source_url) < 1000 and coalesce(length(note), 0) < 2000
  and coalesce(length(target_id), 0) < 200
);

drop policy if exists "anyone can suggest" on suggestions;
create policy "anyone can suggest" on suggestions for insert to anon, authenticated
  with check (status = 'pending' and reviewed_at is null and result_id is null and source_url ~* '^https?://');
drop policy if exists "owner reviews" on suggestions;
create policy "owner reviews" on suggestions for all to authenticated
  using (public.is_owner()) with check (public.is_owner());
grant select, update on suggestions to authenticated;

-- Approve or reject a suggestion in one step. Approving copies the record into its table:
-- an addition becomes a new record; a correction updates only the fields that were filled in.
create or replace function public.review_suggestion(sid bigint, decision text, edited jsonb default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  s suggestions;
  tbl text;
  rec jsonb;
  existing jsonb;
  new_id text;
  label text;
begin
  if not public.is_owner() then
    raise exception 'Only the Atlas owner can review suggestions';
  end if;
  select * into s from suggestions where id = sid for update;
  if not found then raise exception 'Suggestion % not found', sid; end if;
  if s.status <> 'pending' then raise exception 'Suggestion % was already reviewed', sid; end if;

  if decision = 'rejected' then
    update suggestions set status = 'rejected', reviewed_at = now() where id = sid;
    return null;
  elsif decision <> 'approved' then
    raise exception 'Decision must be approved or rejected';
  end if;

  tbl := s.record_type;
  if tbl not in ('people','startups','organizations','policies','gaps','benchmarks') then
    raise exception 'Unknown record type %', tbl;
  end if;
  -- Visitors (and edits) cannot set the review fields directly.
  rec := coalesce(edited, s.data) - 'id' - 'needs_review' - 'review_note' - 'last_verified';
  -- Drop empty values, so a correction only changes what was filled in.
  rec := (select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) from jsonb_each(rec)
          where value not in ('null'::jsonb, '""'::jsonb, '[]'::jsonb));

  if s.kind = 'correction' then
    if s.target_id is null then raise exception 'This correction does not say which record it is about'; end if;
    execute format('select to_jsonb(t) from %I t where id = $1', tbl) into existing using s.target_id;
    if existing is null then raise exception 'The record % no longer exists', s.target_id; end if;
    new_id := s.target_id;
    rec := existing || rec;
    -- Keep the old source and add the link that confirms the correction.
    if tbl in ('people','startups') then
      rec := rec || jsonb_build_object('source', concat_ws(' ; ', nullif(existing ->> 'source', ''), s.source_url));
    elsif tbl = 'gaps' then
      rec := rec || jsonb_build_object('evidence_source', concat_ws(' ; ', nullif(existing ->> 'evidence_source', ''), s.source_url));
    end if;
    execute format('delete from %I where id = $1', tbl) using new_id;
  else
    label := coalesce(rec ->> 'name', rec ->> 'title', rec ->> 'theme', 'record');
    new_id := trim(both '-' from left(regexp_replace(lower(label), '[^a-z0-9]+', '-', 'g'), 50)) || '-s' || sid;
  end if;

  -- Every record keeps a source link: use the suggestion's link where the record has none.
  if tbl in ('people','startups') and coalesce(rec ->> 'source', '') = '' then
    rec := rec || jsonb_build_object('source', s.source_url);
  elsif tbl = 'gaps' and coalesce(rec ->> 'evidence_source', '') = '' then
    rec := rec || jsonb_build_object('evidence_source', s.source_url);
  elsif tbl in ('policies','benchmarks') and coalesce(rec ->> 'link', '') = '' then
    rec := rec || jsonb_build_object('link', s.source_url);
  elsif tbl = 'organizations' and coalesce(rec ->> 'website', '') = '' then
    rec := rec || jsonb_build_object('website', s.source_url);
  end if;

  rec := rec || jsonb_build_object('id', new_id, 'last_verified', current_date, 'needs_review', false, 'review_note', null);
  execute format('insert into %I select * from jsonb_populate_record(null::%I, $1)', tbl, tbl) using rec;
  update suggestions set status = 'approved', reviewed_at = now(), result_id = new_id where id = sid;
  return new_id;
end $$;
revoke all on function public.review_suggestion(bigint, text, jsonb) from public;
grant execute on function public.review_suggestion(bigint, text, jsonb) to authenticated;
