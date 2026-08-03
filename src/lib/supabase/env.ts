/**
 * Supabase environment access.
 *
 * The app is designed to degrade gracefully when Supabase is not configured:
 * auth is simply disabled and the catalog renders publicly. This keeps the
 * demo buildable and runnable without credentials, while becoming fully
 * functional the moment the two public env vars are set.
 */

export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
