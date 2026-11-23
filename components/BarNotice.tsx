"use client";

// A short line at the top of a list saying what the bar is filtering, with a quick way to widen it.

import { setBar } from "@/lib/bar";

export default function BarNotice({ label, extra }: { label: string | null; extra?: string }) {
  if (!label) return null;
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-accent-soft px-3 py-2 text-sm">
      <span>
        Showing <b>{label}</b>
        {extra ? ` ${extra}` : ""}, from your choice in the bar above.
      </span>
      <button
        type="button"
        onClick={() => setBar({ region: "", country: "" })}
        className="min-h-11 font-medium text-accent underline underline-offset-2"
      >
        Show all of Africa
      </button>
    </p>
  );
}

export const filterCls =
  "min-h-11 rounded-md border border-line bg-surface px-3 text-sm text-fg";
