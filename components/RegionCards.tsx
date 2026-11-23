import Link from "next/link";
import { REGIONS, regionColor, regionSlug, regionStats, type Tier } from "@/lib/groups";
import { plural } from "@/lib/format";
import type { Country } from "@/lib/types";
import { MixBar } from "./ui";

export default function RegionCards({ countries, tiers }: { countries: Country[]; tiers: Record<string, Tier> }) {
  return (
    <ul className="flex flex-col gap-3">
      {REGIONS.map((r) => {
        const st = regionStats(r, countries, tiers);
        const top = (st.leaders.length ? st.leaders : st.advancing).slice(0, 3).map((c) => c.name);
        return (
          <li key={r}>
            <Link
              href={`/region/${regionSlug(r)}`}
              className="group flex items-stretch gap-3 rounded-lg border border-line bg-surface p-3 text-fg no-underline hover:border-accent sm:p-4"
            >
              <span aria-hidden="true" className="w-1.5 shrink-0 rounded-full" style={{ background: regionColor(r) }} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <b className="font-display text-lg group-hover:underline">{r} Africa</b>
                  <MixBar stats={st} className="w-24" />
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {plural(st.countries.length, "country", "countries")} · {plural(st.deep, "deep dive")}
                  {top.length ? ` · Strongest: ${top.join(", ")}` : ""}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
