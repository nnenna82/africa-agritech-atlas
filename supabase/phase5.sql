-- Phase 5: "Ask the Atlas" chat. Spending limits and saved answers.
-- Run once after phase4.sql. Safe to run again.
--
-- Only the site's server touches these tables, using the Supabase secret key (service_role),
-- which is set in Vercel and never in the code. Visitors and logged-in users have no access.

create table if not exists chat_usage (
  day date primary key,
  answers int not null default 0,
  cost_usd numeric(10, 5) not null default 0
);

create table if not exists chat_visitors (
  day date not null,
  visitor text not null,          -- a one-way hash of the visitor's network address, never the address itself
  questions int not null default 0,
  primary key (day, visitor)
);

create table if not exists chat_cache (
  qkey text primary key,          -- the question in lower case, plus the region/country it was asked about
  answer jsonb not null,
  created_at timestamptz not null default now()
);

alter table chat_usage enable row level security;
alter table chat_visitors enable row level security;
alter table chat_cache enable row level security;
revoke all on chat_usage, chat_visitors, chat_cache from anon, authenticated;
grant all on chat_usage, chat_visitors, chat_cache to service_role;

-- Check every limit and count the question, in one step so two visitors at once cannot both slip past a limit.
-- Returns 'ok', 'visitor_limit', 'daily_budget' or 'monthly_budget'.
create or replace function public.chat_try_start(p_visitor text, p_daily_usd numeric, p_monthly_usd numeric, p_per_visitor int)
returns text language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'utc')::date;
  spent_today numeric;
  spent_month numeric;
  asked int;
begin
  perform pg_advisory_xact_lock(hashtext('chat_try_start'));
  select coalesce(sum(cost_usd), 0) into spent_month from chat_usage where day >= date_trunc('month', today)::date;
  if spent_month >= p_monthly_usd then return 'monthly_budget'; end if;
  select coalesce(cost_usd, 0) into spent_today from chat_usage where day = today;
  if coalesce(spent_today, 0) >= p_daily_usd then return 'daily_budget'; end if;
  select questions into asked from chat_visitors where day = today and visitor = p_visitor;
  if coalesce(asked, 0) >= p_per_visitor then return 'visitor_limit'; end if;
  insert into chat_visitors (day, visitor, questions) values (today, p_visitor, 1)
    on conflict (day, visitor) do update set questions = chat_visitors.questions + 1;
  return 'ok';
end $$;

-- Add what one answer actually cost.
create or replace function public.chat_record_cost(p_cost numeric) returns void
language sql security definer set search_path = public as $$
  insert into chat_usage (day, answers, cost_usd) values ((now() at time zone 'utc')::date, 1, p_cost)
  on conflict (day) do update set answers = chat_usage.answers + 1, cost_usd = chat_usage.cost_usd + excluded.cost_usd;
$$;

revoke all on function public.chat_try_start(text, numeric, numeric, int) from public, anon, authenticated;
revoke all on function public.chat_record_cost(numeric) from public, anon, authenticated;
grant execute on function public.chat_try_start(text, numeric, numeric, int) to service_role;
grant execute on function public.chat_record_cost(numeric) to service_role;

-- Old visitor counts are not needed after a week.
delete from chat_visitors where day < (now() at time zone 'utc')::date - 7;
