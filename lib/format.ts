// Small helpers for showing numbers, dates and links in plain words.

/** A number with sensible decimals, or null if there is no value. */
export function num(v: number | null | undefined, digits?: number): string | null {
  if (v == null || Number.isNaN(Number(v))) return null;
  const n = Number(v);
  const d = digits ?? (Math.abs(n) < 10 ? 1 : 0);
  return n.toLocaleString("en", { maximumFractionDigits: d });
}

/** "3 Nov 2026" from "2026-11-03". */
export function date(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** "allafrica.com" from a full link, for short link labels. */
export function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export const isUrl = (s: string | null | undefined): s is string => !!s && /^https?:\/\//.test(s.trim());

/** Some source fields hold several links separated by " ; ". Split them into a clean list. */
export function links(...values: (string | string[] | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    const parts = Array.isArray(v) ? v : v ? v.split(/\s+;\s+|\s*;\s*(?=https?:)/) : [];
    for (const p of parts) {
      const t = p.trim();
      if (t && !out.includes(t)) out.push(t);
    }
  }
  return out;
}

/** The first sentence of a paragraph. */
export function firstSentence(t: string | null | undefined): string {
  const s = String(t ?? "");
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
