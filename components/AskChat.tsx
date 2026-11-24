"use client";

// "Ask the Atlas" chat box. Each question is answered on its own (no long conversation),
// which keeps answers grounded in Atlas records and keeps costs down.

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useBar } from "@/lib/bar";
import { inputCls } from "./RecordFields";

type QA = {
  q: string;
  answer?: string;
  sources?: { n: number; title: string; href: string }[];
  saved?: boolean;
  truncated?: boolean;
  error?: string;
};

const EXAMPLES = [
  "Who should I talk to about cold storage in Nigeria?",
  "Why does Kenya lead East Africa in farm technology?",
  "Which startups work on farm finance, and which ones failed?",
  "What is holding back irrigation in Africa?",
];

export default function AskChat({ countryNames }: { countryNames: Record<string, string> }) {
  const bar = useBar();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<QA[]>([]);
  const [busy, setBusy] = useState(false);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    setBusy(true);
    setQ("");
    setItems((xs) => [{ q: text }, ...xs]);
    let next: QA;
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, country: bar.country }),
      });
      const data = await res.json();
      next = res.ok ? { q: text, ...data } : { q: text, error: data.message ?? "Sorry, something went wrong." };
    } catch {
      next = { q: text, error: "Could not reach the Atlas. Check your connection and try again." };
    }
    setItems((xs) => [next, ...xs.slice(1)]);
    setBusy(false);
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(q);
  };

  return (
    <>
      <form onSubmit={submit} className="mt-6 max-w-2xl space-y-3">
        <label htmlFor="ask-q" className="block text-sm font-medium">
          Your question
        </label>
        <textarea
          id="ask-q"
          rows={3}
          maxLength={500}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(q);
            }
          }}
          placeholder="For example: who is working on post-harvest losses in Ghana?"
          className={inputCls}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || q.trim().length < 5}
            className="min-h-11 rounded-md bg-accent px-5 font-medium text-surface disabled:opacity-60"
          >
            {busy ? "Thinking…" : "Ask"}
          </button>
          {bar.country ? (
            <span className="text-sm text-muted">Answers will focus on {countryNames[bar.country] ?? bar.country}, from your choice in the bar.</span>
          ) : null}
        </div>
      </form>

      {!items.length ? (
        <div className="mt-6 max-w-2xl">
          <p className="text-sm font-medium">Try one of these:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((x) => (
              <li key={x}>
                <button
                  type="button"
                  onClick={() => ask(x)}
                  className="min-h-11 rounded-full border border-line bg-surface px-4 text-left text-sm hover:bg-sunk"
                >
                  {x}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ol className="mt-8 max-w-2xl space-y-6" aria-live="polite">
        {items.map((it, i) => (
          <li key={`${items.length - i}`} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
            <p className="font-semibold">{it.q}</p>
            {it.error ? (
              <p className="mt-3 rounded bg-gold-soft p-3 text-sm" role="alert">
                {it.error}
              </p>
            ) : it.answer ? (
              <>
                <div className="mt-3 space-y-2 whitespace-pre-line">{it.answer}</div>
                {it.truncated ? <p className="mt-2 text-xs text-muted">The answer was cut short. Try a narrower question.</p> : null}
                {it.sources?.length ? (
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted">From the Atlas</p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {it.sources.map((s) => (
                        <li key={s.n}>
                          [{s.n}]{" "}
                          <Link href={s.href} className="underline underline-offset-2">
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="mt-3 text-xs text-muted">
                  Written by AI from Atlas records{it.saved ? " (a saved answer to the same question)" : ""}. Check the
                  linked pages and their sources before relying on it.
                </p>
              </>
            ) : (
              <p className="mt-3 text-muted">Looking through the Atlas…</p>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
