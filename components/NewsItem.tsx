"use client";

// One news story: relative date, headline, summary, why it matters, tags and a link to the original.

import { useSyncExternalStore } from "react";
import { date as fmtDate, host, isUrl } from "@/lib/format";
import type { NewsItem as News } from "@/lib/types";
import type { BarState } from "@/lib/bar";
import { Chip } from "./ui";

const noop = () => () => {};
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Today's date in the visitor's time zone (null while the page is drawn on the server). */
export function useToday(): string | null {
  return useSyncExternalStore(noop, todayIso, () => null);
}

/** "Today", "Yesterday" or "17 Nov 2026". */
export function relDay(iso: string, today: string | null): string {
  if (today) {
    const diff = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)) / 864e5);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
  }
  return fmtDate(iso) ?? iso;
}

/** Does a story match the bar? Continental stories always show. */
export function newsMatches(n: News, bar: Pick<BarState, "region" | "country">): boolean {
  const cs = n.countries ?? [];
  if (n.region === "Continental" || cs.includes("AU")) return true;
  if (bar.country) return cs.includes(bar.country);
  if (bar.region) return n.region === bar.region;
  return true;
}

export default function NewsItem({ item, nameOf }: { item: News; nameOf: (iso: string) => string }) {
  const today = useToday();
  return (
    <article className="grid gap-1 border-b border-line py-5 sm:grid-cols-[7rem_1fr] sm:gap-4">
      <p className="font-mono text-xs text-muted">
        <time dateTime={item.date}>{relDay(item.date, today)}</time>
      </p>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold leading-snug">{item.headline}</h3>
        {item.summary ? <p className="mt-1">{item.summary}</p> : null}
        {item.why ? (
          <p className="mt-2 text-sm text-muted">
            <b className="text-fg">Why it matters:</b> {item.why}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {(item.countries ?? []).map((c) => (
            <Chip key={c}>{nameOf(c)}</Chip>
          ))}
          {item.segment ? <Chip accent>{item.segment}</Chip> : null}
          {item.type ? <Chip>{item.type}</Chip> : null}
          {isUrl(item.url) ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex min-h-11 items-center text-sm underline underline-offset-2"
            >
              Read at {item.source || host(item.url)}
              <span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
