"use client";

// The news page list: newest first, filtered by type, part of the chain, and the bar's region and country.

import { useState } from "react";
import { useBar } from "@/lib/bar";
import { makeScope, type CountryLite } from "@/lib/scope";
import type { NewsItem as News } from "@/lib/types";
import BarNotice, { filterCls } from "./BarNotice";
import NewsItem, { newsMatches, relDay, useToday } from "./NewsItem";

export default function NewsList({ news, countries }: { news: News[]; countries: CountryLite[] }) {
  const bar = useBar();
  const today = useToday();
  const [type, setType] = useState("");
  const [segment, setSegment] = useState("");
  const sc = makeScope(countries, bar.region, bar.country);
  const types = [...new Set(news.map((n) => n.type).filter(Boolean) as string[])].sort();
  const segments = [...new Set(news.map((n) => n.segment).filter(Boolean) as string[])].sort();
  const shown = news.filter(
    (n) => newsMatches(n, bar) && (!type || n.type === type) && (!segment || n.segment === segment),
  );
  const latest = news[0]?.date;
  const when = latest ? relDay(latest, today) : null;

  return (
    <>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {when ? `Updated ${when === "Today" ? "today" : when === "Yesterday" ? "yesterday" : `on ${when}`}` : "News"}
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">What&rsquo;s happening in African agriculture</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Short, plain summaries of the latest developments: funding, policy, markets and infrastructure. Each one links
        to the original report.
      </p>
      <BarNotice label={sc.label} extra="plus continental stories" />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          aria-label="Type of story"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={`${filterCls} w-full sm:w-auto`}
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          aria-label="Part of the chain"
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className={`${filterCls} w-full sm:w-auto`}
        >
          <option value="">Any part of the chain</option>
          {segments.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="font-mono text-xs text-muted" aria-live="polite">
          {shown.length} {shown.length === 1 ? "story" : "stories"}
        </span>
      </div>
      <div className="mt-2">
        {shown.length ? (
          shown.map((n) => <NewsItem key={n.id} item={n} nameOf={sc.nameOf} />)
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-center text-muted">
            No stories match. Try a wider region or another filter.
          </p>
        )}
      </div>
      <p className="mt-4 text-xs text-muted">
        Summaries are written for the Atlas in our own words; figures come from the linked source. Read the original
        before citing.
      </p>
    </>
  );
}
