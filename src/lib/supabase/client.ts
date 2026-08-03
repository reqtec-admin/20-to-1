"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let browserClient: SupabaseClient | null = null;

/**
 * Browser-side Supabase client (singleton). Returns null when Supabase is not
 * configured so callers can disable auth UI gracefully.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient) return browserClient;
  const env = getSupabaseEnv();
  if (!env) return null;
  browserClient = createBrowserClient(env.url, env.anonKey);
  return browserClient;
}
