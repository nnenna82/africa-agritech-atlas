// The dashed box at the end of list pages and country pages.

import Link from "next/link";
import type { RecordType } from "@/lib/suggest";

export default function SuggestBox({ type, what, country }: { type: RecordType; what: string; country?: string }) {
  const q = new URLSearchParams({ type, ...(country ? { country } : {}) });
  return (
    <aside className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-line p-4">
      <p className="max-w-xl text-sm">
        <b>Know {what} that is missing or out of date?</b> Suggest it, and the Atlas owner will review it.
      </p>
      <Link
        href={`/suggest?${q.toString()}`}
        className="inline-flex min-h-11 items-center rounded-md border border-accent px-4 text-sm font-medium no-underline"
      >
        Suggest an addition or correction
      </Link>
    </aside>
  );
}
