// Loads all Atlas content.
//
// First choice: the Supabase database (read-only, using the public "publishable" key that is
// set in Vercel). If Supabase is not set up yet, or a table is missing or empty, that table is
// read from the backup JSON files in data/ instead, so the site never shows a blank page.

import { cacheLife, cacheTag } from "next/cache";
import type { Atlas, Meta } from "./types";

import countriesFile from "@/data/countries.json";
import organizationsFile from "@/data/organizations.json";
import peopleFile from "@/data/people.json";
import startupsFile from "@/data/startups.json";
import policiesFile from "@/data/policies.json";
import gapsFile from "@/data/gaps.json";
import benchmarksFile from "@/data/benchmarks.json";
import newsFile from "@/data/news.json";
import metaFile from "@/data/meta.json";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function readTable<T>(table: string, backup: unknown, fallbacks: string[]): Promise<T[]> {
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
        headers: { apikey: SUPABASE_KEY, Accept: "application/json" },
      });
      if (res.ok) {
        const rows = (await res.json()) as T[];
        if (Array.isArray(rows) && rows.length > 0) return rows;
      }
      console.warn(`[atlas] Supabase table "${table}" not ready (status ${res.status}); using data/ files`);
    } catch (err) {
      console.warn(`[atlas] Could not reach Supabase for "${table}"; using data/ files`, err);
    }
  }
  fallbacks.push(table);
  return backup as T[];
}

export async function getAtlas(): Promise<Atlas> {
  "use cache";
  cacheLife("hours");
  // Approving a suggestion on /admin refreshes everything tagged "atlas" straight away.
  cacheTag("atlas");

  const fallbacks: string[] = [];
  const [countries, organizations, people, startups, policies, gaps, benchmarks, news, metaRows] =
    await Promise.all([
      readTable<Atlas["countries"][number]>("countries", countriesFile, fallbacks),
      readTable<Atlas["organizations"][number]>("organizations", organizationsFile, fallbacks),
      readTable<Atlas["people"][number]>("people", peopleFile, fallbacks),
      readTable<Atlas["startups"][number]>("startups", startupsFile, fallbacks),
      readTable<Atlas["policies"][number]>("policies", policiesFile, fallbacks),
      readTable<Atlas["gaps"][number]>("gaps", gapsFile, fallbacks),
      readTable<Atlas["benchmarks"][number]>("benchmarks", benchmarksFile, fallbacks),
      readTable<Atlas["news"][number]>("news", newsFile, fallbacks),
      readTable<{ data: Meta }>("meta", [{ data: metaFile }], fallbacks),
    ]);

  return {
    countries: [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    organizations,
    people,
    startups,
    policies,
    gaps,
    benchmarks,
    news: [...news].sort((a, b) => b.date.localeCompare(a.date)),
    meta: metaRows[0]?.data ?? {},
    source: fallbacks.length ? "files" : "supabase",
  };
}
