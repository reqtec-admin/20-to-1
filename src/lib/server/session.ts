import { headers } from "next/headers";
import {
  OWNED_AGENTS_HEADER,
  USER_EMAIL_HEADER,
  ORG_ID_HEADER,
} from "@/lib/supabase/middleware";

export type ServerSession = {
  signedIn: boolean;
  email: string | null;
  orgId: string | null;
  ownedAgents: string[];
};

/**
 * Reads the per-request session data that the middleware forwarded via
 * headers. Server Components use this to render auth-aware UI and to seed the
 * client catalog provider without an extra round-trip.
 */
export async function getServerSession(): Promise<ServerSession> {
  const h = await headers();
  const email = h.get(USER_EMAIL_HEADER) || null;
  const orgId = h.get(ORG_ID_HEADER) || null;

  let ownedAgents: string[] = [];
  const raw = h.get(OWNED_AGENTS_HEADER);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        ownedAgents = parsed.filter((a): a is string => typeof a === "string");
      }
    } catch {
      ownedAgents = [];
    }
  }

  return {
    signedIn: Boolean(email),
    email,
    orgId,
    ownedAgents,
  };
}
