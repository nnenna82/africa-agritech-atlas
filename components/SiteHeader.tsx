"use client";

// Top menu. On wide screens the links sit beside the title (wrapping onto two lines if needed);
// on phones a "Menu" button opens them in a list below the title.
// Only pages that exist are listed; more are added as each phase is built.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home", match: [] },
  { href: "/crop-journeys.html", label: "Crop Journeys ↗", match: [], gold: true },
  { href: "/africa", label: "Africa & regions", match: ["/africa", "/region/", "/country/", "/countries"] },
  { href: "/gaps", label: "Gaps", match: ["/gaps"] },
  { href: "/startups", label: "Startups", match: ["/startups"] },
  { href: "/people", label: "People", match: ["/people"] },
  { href: "/organizations", label: "Organizations", match: ["/organizations"] },
  { href: "/regulation", label: "Regulation", match: ["/regulation"] },
  { href: "/global", label: "Global", match: ["/global"] },
  { href: "/news", label: "News", match: ["/news"] },
] as { href: string; label: string; match: string[]; gold?: boolean }[];

export default function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const isCurrent = (l: (typeof LINKS)[number]) =>
    path === l.href || l.match.some((m) => path.startsWith(m));

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-fg no-underline">
          <span className="font-display text-xl font-bold">Africa AgriTech Atlas</span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">54 countries</span>
        </Link>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium md:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            {open ? "×" : "☰"}
          </span>
          Menu
        </button>
        <nav
          id="site-menu"
          aria-label="Main"
          className={`${open ? "block" : "hidden"} w-full md:block md:w-auto`}
        >
          <ul className="flex flex-col gap-1 pb-2 md:flex-row md:flex-wrap md:pb-0">
            {LINKS.map((l) => {
              const current = isCurrent(l);
              if (l.gold)
                return (
                  <li key={l.href}>
                    {/* A plain link: Crop Journeys is a separate page, not part of the Next.js app. */}
                    <a
                      href={l.href}
                      className="flex min-h-11 items-center rounded-md bg-gold-soft px-3 text-sm font-semibold text-fg no-underline hover:outline hover:outline-1 hover:outline-gold"
                    >
                      {l.label}
                    </a>
                  </li>
                );
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium no-underline ${
                      current ? "bg-accent-soft text-fg" : "text-muted hover:bg-sunk hover:text-fg"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
