// The clickable Africa map. Outlines are pre-drawn by scripts/build-map.mjs (Natural Earth, public domain).
// Drawn on the server; MapShell adds hover, tap, keyboard and the color-mode switch.

import mapData from "@/lib/africa-map.json";
import { regionColor, tierColor, tierName, TIER_NAMES, REGIONS, type Tier } from "@/lib/groups";
import type { Region } from "@/lib/types";
import MapShell, { type MapMode } from "./MapShell";
import { Swatch } from "./ui";

type MapCountry = {
  iso3: string;
  name: string;
  region: Region;
  d: string;
  bbox: [number, number, number, number];
  center: [number, number];
  dot: [number, number] | null;
};

const MAP = mapData as { width: number; height: number; westernSahara: string; countries: MapCountry[] };

/** A view box around one region, with the same proportions as the full map (pad the shorter side). */
function regionViewBox(region: Region): string {
  const cs = MAP.countries.filter((c) => c.region === region);
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const c of cs) {
    x0 = Math.min(x0, c.bbox[0]);
    y0 = Math.min(y0, c.bbox[1]);
    x1 = Math.max(x1, c.bbox[2]);
    y1 = Math.max(y1, c.bbox[3]);
  }
  const pad = 16;
  x0 -= pad;
  y0 -= pad;
  x1 += pad;
  y1 += pad;
  const ratio = MAP.width / MAP.height;
  let w = x1 - x0;
  let h = y1 - y0;
  if (w / h < ratio) {
    const nw = h * ratio;
    x0 -= (nw - w) / 2;
    w = nw;
  } else {
    const nh = w / ratio;
    y0 -= (nh - h) / 2;
    h = nh;
  }
  return [x0, y0, w, h].map((n) => Math.round(n)).join(" ");
}

export default function AfricaMap({
  tiers,
  mode = "region",
  allowModeSwitch = true,
  focusRegion,
  label = "Map of Africa",
  followBar = false,
  interest,
}: {
  tiers: Record<string, Tier>;
  mode?: MapMode;
  allowModeSwitch?: boolean;
  focusRegion?: Region;
  label?: string;
  followBar?: boolean;
  interest?: Record<string, string[]>;
}) {
  const viewBox = focusRegion ? regionViewBox(focusRegion) : `0 0 ${MAP.width} ${MAP.height}`;
  // Keep island dots the same size on screen when zoomed in.
  const scale = focusRegion ? Number(viewBox.split(" ")[2]) / MAP.width : 1;
  const info = Object.fromEntries(
    MAP.countries.map((c) => [c.iso3, { name: c.name, region: c.region, group: tierName(tiers[c.iso3] ?? null) }]),
  );
  // Draw the faded countries first so the region in focus sits on top.
  const ordered = focusRegion
    ? [...MAP.countries].sort((a, b) => Number(a.region === focusRegion) - Number(b.region === focusRegion))
    : MAP.countries;

  return (
    <MapShell info={info} initialMode={mode} allowModeSwitch={allowModeSwitch} followBar={followBar} interest={interest}>
      <svg
        viewBox={viewBox}
        className="block h-auto w-full"
        role="group"
        aria-label={`${label}. Each country is a link: use Tab to move between them and Enter to open one.`}
      >
        <path d={MAP.westernSahara} fill="var(--wsah)" className="map-wsah" aria-hidden="true">
          <title>Western Sahara (status disputed; not covered by the Atlas)</title>
        </path>
        {ordered.map((c) => {
          const faded = focusRegion && c.region !== focusRegion;
          const t = tiers[c.iso3] ?? null;
          const style = {
            // Countries outside the region in focus are drawn in plain grey and faded.
            ["--fill-region" as string]: faded ? "var(--wsah)" : regionColor(c.region),
            ["--fill-tier" as string]: faded ? "var(--wsah)" : tierColor(t),
            opacity: faded ? 0.45 : undefined,
          };
          const a11y = `${c.name}, ${c.region} Africa, ${tierName(t)}`;
          return (
            <g
              key={c.iso3}
              data-iso={c.iso3}
              data-region={c.region}
              className={`map-country${focusRegion && !faded ? " map-focus" : ""}`}
              style={style}
              tabIndex={0}
              role="link"
              aria-label={a11y}
            >
              <title>{`${c.name} · ${c.region} · ${tierName(t)}`}</title>
              <path d={c.d} />
              {c.dot ? (
                <circle cx={c.dot[0]} cy={c.dot[1]} r={6 * scale} />
              ) : null}
            </g>
          );
        })}
      </svg>
      <Legend />
    </MapShell>
  );
}

function Legend() {
  return (
    <>
      <ul className="legend-region mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
        {REGIONS.map((r) => (
          <li key={r} className="flex items-center gap-1.5">
            <Swatch color={regionColor(r)} />
            {r}
          </li>
        ))}
      </ul>
      <ul className="legend-tier mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
        {TIER_NAMES.map((n, i) => (
          <li key={n} className="flex items-center gap-1.5">
            <Swatch color={tierColor(i as Tier)} />
            {n}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <Swatch color="var(--nodata)" />
          Not enough data
        </li>
      </ul>
      <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-muted">
        <Swatch color="var(--wsah)" /> Western Sahara (grey, not covered)
      </p>
    </>
  );
}
