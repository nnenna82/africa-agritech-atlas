"use client";

// The Supabase connection used in the browser: the suggestion form (anyone) and the admin page (owner).
// It uses the public "publishable" key, which is safe to show. The database rules decide what each person may do.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/** null when the site has no Supabase settings (for example on a laptop without .env.local). */
export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  client = url && key ? createClient(url, key, { auth: { flowType: "implicit", persistSession: true, detectSessionInUrl: true } }) : null;
  return client;
}
