"use client";

// Adds interaction to the server-drawn map:
// - mouse: hover shows "Country · Region · Group", click opens the country
// - phone: first tap shows the country and an "Open" button, a second tap opens it
// - keyboard: Tab moves between countries, Enter opens one
// - buttons switch the colors between Regions, Atlas groups and (if "Interested in" is set) My interest
// - on Home (followBar), picking a region in the bar fades the other regions

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { useBar } from "@/lib/bar";

export type MapMode = "region" | "tier" | "interest";
type Info = Record<string, { name: string; region: string; group: string }>;

const isoFrom = (e: SyntheticEvent) =>
  (e.target as Element).closest?.("[data-iso]")?.getAttribute("data-iso") ?? null;

export default function MapShell({
  info,
  initialMode,
  allowModeSwitch,
  followBar = false,
  interest = {},
  children,
}: {
  info: Info;
  initialMode: MapMode;
  allowModeSwitch: boolean;
  /** Follow the bar: fade other regions and offer the "My interest" colors. */
  followBar?: boolean;
  /** For each part of the chain, the countries with a documented gap in it. */
  interest?: Record<string, string[]>;
  children: ReactNode;
}) {
  const router = useRouter();
  const bar = useBar();
  const seg = followBar ? bar.segment : "";
  // A mode picked by the visitor, remembered together with the interest it was picked for.
  const [picked, setPicked] = useState<{ mode: MapMode; seg: string } | null>(null);
  const mode: MapMode =
    picked && picked.seg === seg && (picked.mode !== "interest" || seg)
      ? picked.mode
      : seg
        ? "interest"
        : initialMode;
  const setMode = (m: MapMode) => setPicked({ mode: m, seg });
  const scopeCls = `map-${useId().replace(/[^a-z0-9]/gi, "")}`;
  const hits = seg ? (interest[seg] ?? []) : [];
  const region = followBar ? bar.region : "";
  // Per-visitor colors are added as a small style block, so the map itself can stay drawn on the server.
  const css = [
    hits.length
      ? `.${scopeCls}.map-mode-interest :is(${hits.map((i) => `[data-iso="${i}"]`).join(",")}){fill:var(--gold)}`
      : "",
    region ? `.${scopeCls} .map-country:not([data-region="${region}"]){opacity:.3}` : "",
  ].join("");
  const [active, setActive] = useState<string | null>(null);
  const lastPointer = useRef<string>("mouse");
  const box = useRef<HTMLDivElement>(null);

  const open = (iso: string) => router.push(`/country/${iso}`);

  // Mark the active country so CSS can outline it.
  const mark = (iso: string | null) => {
    setActive(iso);
    box.current?.querySelectorAll("[data-iso]").forEach((el) => {
      el.setAttribute("data-active", String(el.getAttribute("data-iso") === iso));
    });
  };

  const current = active ? info[active] : null;

  return (
    <div ref={box} className={`${scopeCls} map-mode-${mode} rounded-xl border border-line bg-surface p-3 sm:p-4`}>
      {css ? <style>{css}</style> : null}
      {allowModeSwitch ? (
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Color the map by">
          {(
            [
              ["region", "Regions"],
              ["tier", "Atlas groups"],
              ...(seg ? ([["interest", "My interest"]] as const) : []),
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                mode === m ? "border-accent bg-accent text-surface" : "border-line bg-surface text-fg hover:bg-sunk"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onPointerOver={(e) => {
          if (e.pointerType === "mouse") {
            const iso = isoFrom(e);
            if (iso) mark(iso);
          }
        }}
        onClick={(e) => {
          const iso = isoFrom(e);
          if (!iso) return;
          // On touch screens the first tap selects, the second opens.
          if (lastPointer.current !== "mouse" && active !== iso) {
            mark(iso);
            return;
          }
          open(iso);
        }}
        onFocus={(e) => {
          // Only keyboard focus selects; a tap also focuses, and that is handled by onClick.
          const iso = isoFrom(e);
          if (iso && (e.target as Element).matches(":focus-visible")) mark(iso);
        }}
        onKeyDown={(e) => {
          const iso = isoFrom(e);
          if (iso && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            open(iso);
          }
        }}
      >
        {children}
        {mode === "interest" ? (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm border border-line bg-gold" />
              Documented gap in {seg} ({hits.length} {hits.length === 1 ? "country" : "countries"})
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm border border-line bg-nodata" />
              Not documented (deep dives cover 10 countries so far)
            </li>
          </ul>
        ) : null}
      </div>

      <div className="mt-3 flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-lg bg-sunk px-3 py-2 text-sm" aria-live="polite">
        {current && active ? (
          <>
            <span>
              <b>{current.name}</b> · {current.region} · {current.group}
            </span>
            <Link
              href={`/country/${active}`}
              className="inline-flex min-h-11 items-center rounded-md bg-accent px-3 font-medium text-surface no-underline"
            >
              Open {current.name} →
            </Link>
          </>
        ) : (
          <span className="text-muted">Hover or tap a country, then click to open it.</span>
        )}
      </div>
    </div>
  );
}
