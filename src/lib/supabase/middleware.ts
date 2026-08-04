import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getAuthCookieDomain, getSupabaseEnv } from "./env";

export const OWNED_AGENTS_HEADER = "x-owned-agents";
export const USER_EMAIL_HEADER = "x-user-email";
export const ORG_ID_HEADER = "x-org-id";

/** Decode a JWT payload without verifying (UI hinting only, not auth). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Refreshes the Supabase session on every request and forwards the user's
 * entitled agents (from the JWT `agents` claim) to downstream Server
 * Components via request headers. This is what "feeds the agents catalog to
 * the UI" — the layout reads these headers and seeds the catalog provider.
 *
 * When Supabase is not configured this is a no-op pass-through.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const env = getSupabaseEnv();
  if (!env) {
    return NextResponse.next({ request });
  }

  // Accumulate auth cookies set during session refresh so we can re-apply them
  // to the final response (which we rebuild after mutating request headers).
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] =
    [];
  const cookieDomain = getAuthCookieDomain();

  const supabase = createServerClient(env.url, env.anonKey, {
    ...(cookieDomain ? { cookieOptions: { domain: cookieDomain } } : {}),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          pendingCookies.push({
            name,
            value,
            options: cookieDomain ? { ...options, domain: cookieDomain } : options,
          });
        });
      },
    },
  });

  // Validates the session and refreshes tokens if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Next.js only forwards headers via `request: { headers }` — passing the
  // full NextRequest object does not reliably expose middleware-set headers
  // to `headers()` in Server Components.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(OWNED_AGENTS_HEADER);
  requestHeaders.delete(USER_EMAIL_HEADER);
  requestHeaders.delete(ORG_ID_HEADER);

  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let ownedAgents: string[] = [];
    let orgId = "";
    if (session?.access_token) {
      const claims = decodeJwtPayload(session.access_token);
      const agents = claims?.agents;
      if (Array.isArray(agents)) {
        ownedAgents = agents.filter((a): a is string => typeof a === "string");
      }
      if (typeof claims?.org_id === "string") {
        orgId = claims.org_id;
      }
    }

    requestHeaders.set(OWNED_AGENTS_HEADER, JSON.stringify(ownedAgents));
    requestHeaders.set(USER_EMAIL_HEADER, user.email ?? "");
    requestHeaders.set(ORG_ID_HEADER, orgId);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  );
  return response;
}
