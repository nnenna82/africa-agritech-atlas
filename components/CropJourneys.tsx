// Crop Journeys: the gold band at the top of Home, and crop cards on country pages.
// Crop Journeys is a separate interactive page; each card opens it at that crop.

import { CJ_URL, CROPS } from "@/lib/chain";

const cardCls =
  "flex h-full min-h-11 flex-col gap-1 rounded-lg border border-line bg-surface p-4 text-fg no-underline hover:border-accent";

export function CropBand({ nameOf }: { nameOf: (iso: string) => string }) {
  return (
    <section aria-labelledby="cj-title" className="mt-8 rounded-xl bg-gold-soft p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Start here if you&rsquo;re new · interactive</p>
          <h2 id="cj-title" className="mt-1 font-display text-2xl font-bold">
            Crop Journeys: follow a crop from seed to shelf
          </h2>
          <p className="mt-1 text-muted">
            Walk each stage, try a hands-on lab, collect the jargon and test yourself. About 10 minutes per crop.
          </p>
        </div>
        <a
          href={CJ_URL}
          className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 font-medium text-surface no-underline"
        >
          Open Crop Journeys ↗
        </a>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CROPS.map((c) => (
          <li key={c.key}>
            <a href={`${CJ_URL}#${c.key}`} className={`${cardCls} group`}>
              <b className="font-display text-lg group-hover:underline">{c.name}</b>
              <span className="text-sm text-muted">{c.hook}</span>
              <span className="mt-auto pt-1 font-mono text-xs">{c.countries.map(nameOf).join(" · ")}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Crop cards for crops grown in this country (only the four Crop Journeys crops). */
export function CountryCrops({ iso3, name }: { iso3: string; name: string }) {
  const crops = CROPS.filter((c) => c.countries.includes(iso3));
  if (!crops.length) return null;
  return (
    <section aria-labelledby="cc-title" className="mt-10 rounded-xl bg-gold-soft p-4 sm:p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Learn by following a crop grown here</p>
      <h2 id="cc-title" className="mt-1 font-display text-2xl font-bold">
        {crops.map((c) => c.name).join(" and ")} in {name}
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {crops.map((c) => (
          <li key={c.key}>
            <a href={`${CJ_URL}#${c.key}`} className={`${cardCls} group`}>
              <b className="font-display text-lg group-hover:underline">{c.name} journey</b>
              <span className="text-sm text-muted">{c.hook}</span>
              <span className="mt-auto pt-1 font-mono text-xs text-accent">Open ↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
