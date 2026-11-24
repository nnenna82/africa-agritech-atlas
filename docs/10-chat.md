# Ask the Atlas (chat)

`/ask` lets visitors ask a question and get a short answer written by AI from Atlas records only, with numbered links to the records it used. The page and its menu link stay hidden until the two private settings below are in Vercel.

## How it keeps costs safe

- **Daily and monthly spending caps.** After each answer, the server adds up what it actually cost (from the token counts the AI service reports) in a private database table. When the day's total reaches `CHAT_DAILY_BUDGET_USD` (default US$0.90) the chat pauses until the next day (UTC); when the month's total reaches `CHAT_MONTHLY_BUDGET_USD` (default US$25) it pauses until the next month. Parley also has MIT's own hard limit of US$30 a month.
- **10 questions per visitor per day** (`CHAT_PER_VISITOR`). Visitors are counted by a one-way scrambled version of their network address, never the address itself.
- **Saved answers.** The same question about the same country is answered from a saved copy for a week, for free.
- **Short answers.** Each answer is capped (2,000 tokens) and runs at low effort. With Claude Opus 5.5 a typical answer costs about US$0.02–0.04, so the default daily cap allows roughly 25–40 answers a day.

Spending totals: Supabase → Table Editor → `chat_usage` (one row per day).

## Switching it on (owner)

You need two private values. Never paste them into chat or code.

1. **Parley key and address.** From the course's Parley page, copy your API key, and the web address (base URL) it tells you to use.
2. **Supabase secret key.** In Supabase: Project Settings → API Keys → Secret keys. Copy the key that starts with `sb_secret_` (create one if there is none).
3. In Vercel: your project → Settings → Environment Variables. Add, for all environments:
   - `PARLEY_API_KEY` = the Parley key
   - `PARLEY_BASE_URL` = the Parley web address (leave it out only if Parley says to use the standard Anthropic address)
   - `SUPABASE_SECRET_KEY` = the Supabase secret key
   - Optional: `CHAT_DAILY_BUDGET_USD`, `CHAT_MONTHLY_BUDGET_USD`, `CHAT_PER_VISITOR`, `CHAT_MODEL` (default `claude-opus-5-5`)
4. Redeploy (Vercel → Deployments → the latest one → Redeploy). "Ask the Atlas" then appears in the menu.

If Parley uses a different request format from Anthropic's, answers will fail with "the chat could not answer just now". Tell Claude the Parley instructions and it will adapt `app/api/ask/route.ts`.

## Turning it off

Delete `PARLEY_API_KEY` in Vercel and redeploy, or set `CHAT_DAILY_BUDGET_USD` to `0`.

## Files

- `app/api/ask/route.ts`: the server side (limits, model call, cost, saved answers)
- `lib/ask.ts`: picks the Atlas records related to a question (word matching, no AI)
- `components/AskChat.tsx`, `app/ask/page.tsx`: the page
- `supabase/phase5.sql`: the private tables and limit functions
- `scripts/try-ask-retrieval.mts`: shows which records a sample question would use (`npx tsx scripts/try-ask-retrieval.mts`)
