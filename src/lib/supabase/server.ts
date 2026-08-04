import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthCookieDomain, getSupabaseEnv } from "./env";

/**
 * Server-side Supabase client bound to the request cookies. Use inside Server
 * Components, Route Handlers and Server Actions. Returns null when Supabase is
 * not configured.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  const cookieDomain = getAuthCookieDomain();

  return createServerClient(env.url, env.anonKey, {
    ...(cookieDomain ? { cookieOptions: { domain: cookieDomain } } : {}),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(
              name,
              value,
              cookieDomain ? { ...options, domain: cookieDomain } : options
            )
          );
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Session refresh is handled by the middleware instead.
        }
      },
    },
  });
}
