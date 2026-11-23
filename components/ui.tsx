// Small shared pieces used across pages. See docs/04-design-system.md → Components.

import Link from "next/link";
import type { ReactNode } from "react";
import { TIER_NAMES, tierColor, tierName, type Tier, type RegionStats } from "@/lib/groups";
import { date, host, isUrl } from "@/lib/format";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-sm">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <li>
          <Link href="/" className="underline-offset-2 hover:underline">
            Home
          </Link>
        </li>
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-muted">
              ›
            </span>
            {it.href ? (
              <Link href={it.href} className="underline-offset-2 hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-muted">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-widest text-muted">{children}</p>;
}

export function Swatch({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3 w-3 shrink-0 rounded-sm border border-line ${className}`}
      style={{ background: color }}
    />
  );
}

/** Swatch + group name. Never a number. */
export function TierChip({ tier, className = "" }: { tier: Tier; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-xs ${className}`}
    >
      <Swatch color={tierColor(tier)} />
      {tierName(tier)}
    </span>
  );
}

/** Five swatches with the current one outlined. */
export function TierScale({ tier }: { tier: Tier }) {
  return (
    <div className="max-w-md">
      <div className="flex gap-1" role="img" aria-label={`Atlas group: ${tierName(tier)}, on a scale from Early stage to Leading`}>
        {TIER_NAMES.map((name, i) => (
          <div
            key={name}
            title={name}
            className={`h-4 flex-1 rounded-sm ${i === tier ? "outline outline-2 outline-offset-2 outline-fg" : ""}`}
            style={{ background: tierColor(i as Tier) }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-2 font-mono text-xs text-muted">
        <span>Early stage</span>
        <span className="text-center">
          {tier == null ? (
            "Not enough data to place this country"
          ) : (
            <>
              This country: <b className="text-fg">{tierName(tier)}</b>
            </>
          )}
        </span>
        <span>Leading</span>
      </div>
    </div>
  );
}

/** A thin bar showing how many countries of a region fall in each group. */
export function MixBar({ stats, className = "" }: { stats: RegionStats; className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-2 overflow-hidden rounded-full bg-sunk ${className}`}>
      {stats.mix.map((m, i) =>
        m ? <div key={i} style={{ flex: m, background: tierColor(i as Tier) }} /> : null,
      )}
      {stats.noData ? <div style={{ flex: stats.noData, background: "var(--nodata)" }} /> : null}
    </div>
  );
}

/** Text version of the mix, for screen readers and the legend. */
export function MixLegend({ stats }: { stats: RegionStats }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
      {stats.mix.map((m, i) =>
        m ? (
          <li key={i} className="flex items-center gap-1.5">
            <Swatch color={tierColor(i as Tier)} />
            {TIER_NAMES[i]}: {m}
          </li>
        ) : null,
      )}
      {stats.noData ? (
        <li className="flex items-center gap-1.5">
          <Swatch color="var(--nodata)" />
          Not enough data: {stats.noData}
        </li>
      ) : null}
    </ul>
  );
}

export function Section({
  title,
  intro,
  children,
  id,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="mt-10" id={id}>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {intro ? <p className="mt-1 max-w-prose text-muted">{intro}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-line bg-surface p-4 ${className}`}>{children}</div>;
}

export function Chip({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 font-mono text-[11px] ${accent ? "bg-accent-soft text-fg" : "bg-sunk text-muted"}`}
    >
      {children}
    </span>
  );
}

/** "Being checked" note for records with needs_review. */
export function ReviewNote({ needs, note }: { needs?: boolean | null; note?: string | null }) {
  if (!needs) return null;
  return (
    <p className="mt-2 rounded bg-gold-soft px-2 py-1 text-xs">
      <b>Being checked:</b> {note || "some details may have changed."}
    </p>
  );
}

export function LastChecked({ value }: { value?: string | null }) {
  const d = date(value);
  if (!d) return null;
  return <p className="mt-2 font-mono text-[11px] text-muted">Last checked {d}</p>;
}

/** A list of source links, shown by website name. Plain text sources (no link) are shown as text. */
export function SourceLinks({ items, label = "Source" }: { items: string[]; label?: string }) {
  if (!items.length) return null;
  return (
    <p className="mt-2 text-xs text-muted">
      <span className="font-medium">{label}: </span>
      {items.map((s, i) => (
        <span key={s}>
          {i > 0 ? " · " : ""}
          {isUrl(s) ? (
            <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {host(s)}
              <span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          ) : (
            s
          )}
        </span>
      ))}
    </p>
  );
}

export function Kpi({ value, label }: { value: ReactNode; label: ReactNode }) {
  return (
    <div className="border-l-[3px] border-gold pl-3">
      <div className="font-display text-2xl font-bold sm:text-3xl">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}

export const NotEnough = () => <span className="text-base font-medium text-muted">Not enough data</span>;
