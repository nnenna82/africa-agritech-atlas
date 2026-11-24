"use client";

// The 12-week learning roadmap with tick boxes. Progress is saved in this browser only (no account needed).

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { CJ_URL } from "@/lib/chain";

const KEY = "atlas_learn";

type Step = { id: string; when: string; title: string; body: ReactNode; make: string };

const STEPS: Step[] = [
  {
    id: "orient",
    when: "Weeks 1–2",
    title: "Get oriented",
    body: (
      <>
        Learn the big frameworks: Agenda 2063, CAADP (the African Union&rsquo;s farming commitments), AfCFTA (the
        continental free-trade area), PIDA (the infrastructure plan) and Mission 300 (power for 300 million people).
        Start in the{" "}
        <Link href="/regulation" className="underline underline-offset-2">
          Regulation tracker
        </Link>{" "}
        with Scope set to Continental.
      </>
    ),
    make: "A one-page map of the main institutions: AU, the regional blocs, AfDB, CGIAR, AGRA, FAO.",
  },
  {
    id: "chain",
    when: "Weeks 3–4",
    title: "Walk a value chain",
    body: (
      <>
        Follow one crop from seed to sale in{" "}
        <a href={CJ_URL} className="underline underline-offset-2">
          Crop Journeys
        </a>
        , then use the{" "}
        <Link href="/gaps" className="underline underline-offset-2">
          Gap map
        </Link>{" "}
        to see where value leaks.
      </>
    ),
    make: "A sketch of the chain with each loss point tied to a documented gap.",
  },
  {
    id: "compare",
    when: "Weeks 5–6",
    title: "Compare countries",
    body: (
      <>
        Read three deep dives with different models:{" "}
        <Link href="/country/RWA" className="underline underline-offset-2">
          Rwanda
        </Link>{" "}
        (state-led),{" "}
        <Link href="/country/KEN" className="underline underline-offset-2">
          Kenya
        </Link>{" "}
        (market-led and digital) and{" "}
        <Link href="/country/MAR" className="underline underline-offset-2">
          Morocco
        </Link>{" "}
        (export champion). Look at each pillar, not just the overall group.
      </>
    ),
    make: "A short memo on what explains the difference in results.",
  },
  {
    id: "abroad",
    when: "Week 7",
    title: "Learn from abroad",
    body: (
      <>
        On the{" "}
        <Link href="/global" className="underline underline-offset-2">
          Global page
        </Link>
        , study three playbooks rated High transferability, such as Brazil&rsquo;s Embrapa, Vietnam&rsquo;s land reform or
        India&rsquo;s digital public infrastructure.
      </>
    ),
    make: "Notes on what would and would not work in an African country, and why.",
  },
  {
    id: "talk",
    when: "Weeks 8–10",
    title: "Talk to people",
    body: (
      <>
        Pick one country and one gap. Contact 5–8 people from the{" "}
        <Link href="/people" className="underline underline-offset-2">
          People directory
        </Link>{" "}
        with a specific question and a reason you chose them.
      </>
    ),
    make: "Interview notes, organized around the gap.",
  },
  {
    id: "contribute",
    when: "Weeks 11–12",
    title: "Contribute",
    body: (
      <>
        Choose a path: build (a startup or product), fund (an investment thesis), shape (a policy brief) or research (a
        data project). Check the{" "}
        <Link href="/startups" className="underline underline-offset-2">
          Startups list
        </Link>{" "}
        first to see who already tried.
      </>
    ),
    make: "A problem statement and a first small experiment.",
  },
];

// --- tiny store for the ticks, saved in localStorage ---
const listeners = new Set<() => void>();
let cacheRaw: string | null | undefined;
let cacheVal: string[] = [];
function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw === cacheRaw) return cacheVal;
  cacheRaw = raw;
  try {
    const v = raw ? JSON.parse(raw) : [];
    cacheVal = Array.isArray(v) ? v.map(String) : [];
  } catch {
    cacheVal = [];
  }
  return cacheVal;
}
function write(v: string[]) {
  const raw = JSON.stringify(v);
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    cacheRaw = raw;
    cacheVal = v;
  }
  listeners.forEach((f) => f());
}
const EMPTY: string[] = [];
function useDone() {
  return useSyncExternalStore(
    (f) => {
      listeners.add(f);
      return () => listeners.delete(f);
    },
    read,
    () => EMPTY,
  );
}

export default function Roadmap() {
  const done = useDone();
  const count = STEPS.filter((s) => done.includes(s.id)).length;
  const toggle = (id: string) => write(done.includes(id) ? done.filter((x) => x !== id) : [...done, id]);

  return (
    <section aria-labelledby="roadmap-h" className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="roadmap-h" className="font-display text-2xl font-bold">
          Your 12-week roadmap
        </h2>
        <p className="font-mono text-xs text-muted" aria-live="polite">
          {count} of {STEPS.length} stages done
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunk" aria-hidden="true">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(count / STEPS.length) * 100}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">
        About three hours a week. Each stage ends with something you make. Tick a stage when you finish it: your
        progress is saved in this browser only.
      </p>
      <ol className="mt-5 space-y-4">
        {STEPS.map((s, i) => {
          const on = done.includes(s.id);
          return (
            <li key={s.id} className={`rounded-lg border bg-surface p-4 ${on ? "border-accent" : "border-line"}`}>
              <div className="flex items-start gap-3">
                <input
                  id={`step-${s.id}`}
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(s.id)}
                  className="mt-1 h-6 w-6 shrink-0 accent-[var(--accent)]"
                />
                <div className="min-w-0">
                  <label htmlFor={`step-${s.id}`} className="cursor-pointer">
                    <span className="block font-mono text-xs uppercase tracking-widest text-muted">
                      Stage {i + 1} · {s.when}
                    </span>
                    <span className="font-display text-lg font-bold">{s.title}</span>
                    {on ? <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[11px]">done</span> : null}
                  </label>
                  <p className="mt-1 text-sm">{s.body}</p>
                  <p className="mt-2 text-sm text-muted">
                    <b className="text-fg">Make:</b> {s.make}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {count ? (
        <button type="button" onClick={() => write([])} className="mt-4 min-h-11 rounded-md border border-line px-4 text-sm">
          Clear my progress
        </button>
      ) : null}
    </section>
  );
}
