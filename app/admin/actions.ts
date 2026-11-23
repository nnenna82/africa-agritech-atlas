"use server";

// Runs on the server after the owner approves a suggestion: checks that the request really comes
// from the owner, then tells the site to load fresh data so the new record appears at once.

import { updateTag } from "next/cache";

export async function refreshAtlas(accessToken: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !accessToken) return false;
  const res = await fetch(`${url}/rest/v1/rpc/is_owner`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  if (!res.ok || (await res.json()) !== true) return false;
  updateTag("atlas");
  return true;
}
