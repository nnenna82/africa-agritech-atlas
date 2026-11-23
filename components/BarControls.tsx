"use client";

// The dark bar under the menu: I am a · Region · Country · Interested in · Clear.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearBar, setBar, useBar } from "@/lib/bar";
import { ROLES, SEGMENTS, roleLabel } from "@/lib/chain";
import { REGIONS } from "@/lib/groups";
import type { CountryLite } from "@/lib/scope";

const selectCls =
  "min-h-11 w-full min-w-0 rounded-md border border-transparent bg-surface px-2 font-sans text-sm normal-case tracking-normal text-fg disabled:cursor-not-allowed disabled:opacity-60";
const labelCls = "flex min-w-0 flex-col gap-1 font-mono text-[11px] uppercase tracking-widest text-bar-fg/80";

export default function BarControls({ countries }: { countries: CountryLite[] }) {
  const bar = useBar();
  const path = usePathname();
  const inRegion = countries.filter((c) => c.region === bar.region);
  const deep = inRegion.filter((c) => c.deep);
  const rest = inRegion.filter((c) => !c.deep);
  const any = bar.role || bar.region || bar.country || bar.segment;

  return (
    <div className="border-b border-line bg-bar text-bar-fg">
      <form
        className="mx-auto grid max-w-6xl grid-cols-2 gap-x-3 gap-y-2 px-4 py-3 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr_auto] lg:items-end"
        aria-label="Tailor the Atlas to you"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className={labelCls}>
          I am a
          <select className={selectCls} value={bar.role} onChange={(e) => setBar({ role: e.target.value })}>
            <option value="">Choose your role</option>
            {ROLES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Region
          <select className={selectCls} value={bar.region} onChange={(e) => setBar({ region: e.target.value })}>
            <option value="">All of Africa</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r} Africa
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Country
          <select
            className={selectCls}
            value={bar.country}
            disabled={!bar.region}
            onChange={(e) => setBar({ country: e.target.value })}
          >
            <option value="">{bar.region ? `All of ${bar.region} Africa` : "Pick a region first"}</option>
            {deep.length ? (
              <optgroup label="Deep dives">
                {deep.map((c) => (
                  <option key={c.iso3} value={c.iso3}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {rest.length ? (
              <optgroup label={deep.length ? "Other countries" : "Countries"}>
                {rest.map((c) => (
                  <option key={c.iso3} value={c.iso3}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
        </label>
        <label className={labelCls}>
          Interested in
          <select className={selectCls} value={bar.segment} onChange={(e) => setBar({ segment: e.target.value })}>
            <option value="">Any part of the chain</option>
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={clearBar}
          disabled={!any}
          className="min-h-11 rounded-md border border-bar-fg/40 px-4 text-sm font-medium text-bar-fg hover:bg-bar-fg/10 disabled:opacity-40"
        >
          Clear
        </button>
        <p className="self-center text-xs text-bar-fg/80 lg:col-span-5 lg:text-right">
          {bar.role ? (
            <>
              Tailored for: {roleLabel(bar.role)}.{" "}
              {path !== "/" ? (
                <Link href="/#for-you" className="font-medium text-bar-fg underline underline-offset-2">
                  See your &ldquo;For you&rdquo; panel on Home →
                </Link>
              ) : null}
            </>
          ) : (
            "Pick a role to tailor the Atlas to you. Your choices stay in this browser only."
          )}
        </p>
      </form>
    </div>
  );
}
