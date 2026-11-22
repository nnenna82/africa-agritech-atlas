# Phase 0 prompts: set up

Paste one at a time into Claude Code, opened in the `africa-agritech-atlas` folder. Wait for each to finish and check the result before the next.

## 1. Get oriented
```
Read CLAUDE.md and everything in docs/. Then explain back to me in 5 plain sentences what we're building and what Phase 0 involves. Don't write any code yet.
```

## 2. Create the skeleton
```
Set up a Next.js app (App Router, TypeScript, Tailwind) in this folder without deleting or moving docs/, data/, prompts/, supabase/, prototype/ or screenshots/. Make the home page show "Hello, Atlas" in the fonts and colors from docs/04-design-system.md. Add a .gitignore that includes .env* and node_modules. Then tell me the command to run it and what I should see.
```
Check: open http://localhost:3000 and see "Hello, Atlas".

## 3. Save to GitHub
```
Make this folder a git repository, commit everything, and help me push it to a new GitHub repository called africa-agritech-atlas. Walk me through any step I need to do in the browser.
```
Check: the files appear on github.com under your account.

## 4. Put it live
```
Walk me step by step through connecting this GitHub repository to Vercel so the site deploys automatically every time we push. Tell me exactly what to click.
```
Check: Vercel gives you a web address and "Hello, Atlas" opens there, on your phone too.

## 5. Create the database project (no code yet)
```
Walk me through creating a free Supabase project for this app. Show me where to find the project URL and keys, and how to put them in .env.local and in Vercel's environment variables without pasting them into this chat.
```

## 6. Close the session
```
Update the Progress section in CLAUDE.md (tick Phase 0 and add the live web address to the notes), then commit and push.
```
