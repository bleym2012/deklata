// app/lib/supabaseServer.ts
//
// A Supabase client that runs on the SERVER only.
// Uses the same env vars as the browser client — no new secrets needed.
// Import this ONLY in Server Components (no "use client" files).

import { createClient } from "@supabase/supabase-js";

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}
