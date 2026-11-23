"use client";

// Adds interaction to the server-drawn map:
// - mouse: hover shows "Country · Region · Group", click opens the country
// - phone: first tap shows the country and an "Open" button, a second tap opens it
// - keyboard: Tab moves between countries, Enter opens one
// - buttons switch the colors between Regions and Atlas groups

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode, type SyntheticEvent } from "react";

export type MapMode = "region" | "tier";
type Info = Record<string, { name: string; region: string; group: string }>;

const isoFrom = (e: SyntheticEvent) =>
  (e.target as Element).closest?.("[data-iso]")?.getAttribute("data-iso") ?? null;

export default function MapShell({
  info,
  initialMode,
  allowModeSwitch,
  children,
}: {
  info: Info;
  initialMode: MapMode;
  allowModeSwitch: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<MapMode>(initialMode);
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
    <div ref={box} className={`map-mode-${mode} rounded-xl border border-line bg-surface p-3 sm:p-4`}>
      {allowModeSwitch ? (
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Color the map by">
          {(
            [
              ["region", "Regions"],
              ["tier", "Atlas groups"],
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
