-- Africa AgriTech Atlas: starting schema for Supabase (Postgres).
-- Run in the Supabase SQL editor during Phase 1. Visitors can read; only the owner can write.
-- Replace OWNER_EMAIL below with the owner's login email before running the policies (Phase 3 adds the login).

create table countries (
  iso3 text primary key,
  name text not null,
  region text not null check (region in ('North','West','Central','East','Southern')),
  recs text[] default '{}',
  capital text,
  population_m numeric,
  ag_gdp_pct numeric,
  ag_jobs_pct numeric,
  electricity_access_pct numeric,
  internet_users_pct numeric,
  caadp_br4_score numeric,
  deep boolean default false,
  summary text,
  narrative text,
  strengths text[] default '{}',
  flagship_programs text[] default '{}',
  atlas jsonb,
  sources text[] default '{}',
  last_verified date
);

create table organizations (
  id text primary key, name text not null, type text, subtype text,
  countries text[] default '{}', sector_tags text[] default '{}',
  what text, website text, funder boolean default false,
  needs_review boolean default false, review_note text, last_verified date
);

create table people (
  id text primary key, name text not null, role text, organization text,
  countries text[] default '{}', diaspora boolean default false, based_in text,
  focus text, talk_to_about text, public_links text[] default '{}', source text,
  needs_review boolean default false, review_note text, last_verified date
);

create table startups (
  id text primary key, name text not null, countries text[] default '{}', hq_iso3 text,
  segment text, founded int, stage text, status text, notable_funding text, model text,
  diaspora_founded boolean default false, website text, source text,
  needs_review boolean default false, review_note text, last_verified date
);

create table policies (
  id text primary key, title text not null, scope text not null, type text, year int,
  status text, summary text, link text,
  needs_review boolean default false, review_note text, last_verified date
);

create table gaps (
  id text primary key, title text not null, scope text not null, segment text,
  root_causes text, evidence text, evidence_source text, who_is_working text, opportunity text,
  needs_review boolean default false, review_note text, last_verified date
);

create table benchmarks (
  id text primary key, source_country text, theme text not null, what_happened text,
  outcome text, transferability text, link text,
  needs_review boolean default false, review_note text, last_verified date
);

create table news (
  id text primary key, date date not null, headline text not null, summary text, why text,
  countries text[] default '{}', region text, segment text, type text, source text, url text
);

create table meta (
  id int primary key default 1, data jsonb not null
);

create table suggestions (
  id bigint generated always as identity primary key,
  record_type text not null check (record_type in ('people','startups','organizations','policies','gaps','benchmarks')),
  data jsonb not null,
  source_url text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- Row Level Security: everyone can read content; nobody can write except the owner.
do $$ declare t text; begin
  foreach t in array array['countries','organizations','people','startups','policies','gaps','benchmarks','news','meta'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "owner write" on %I for all using (auth.jwt() ->> ''email'' = ''OWNER_EMAIL'') with check (auth.jwt() ->> ''email'' = ''OWNER_EMAIL'')', t);
  end loop;
end $$;

-- Suggestions: anyone can add one as pending; only the owner can read and change them.
alter table suggestions enable row level security;
create policy "anyone can suggest" on suggestions for insert with check (status = 'pending');
create policy "owner reviews" on suggestions for all using (auth.jwt() ->> 'email' = 'OWNER_EMAIL');
