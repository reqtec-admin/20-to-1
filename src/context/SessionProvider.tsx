"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildAgentCatalog, type AgentCatalog } from "@/lib/agents-catalog";

type SessionContextValue = {
  /** Whether Supabase auth is configured for this deployment. */
  authEnabled: boolean;
  signedIn: boolean;
  email: string | null;
  orgId: string | null;
  /** Catalog with per-agent ownership derived from the user's entitlements. */
  catalog: AgentCatalog;
  ownedAgents: string[];
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export type SessionProviderProps = {
  children: React.ReactNode;
  authEnabled: boolean;
  initialEmail: string | null;
  initialOrgId: string | null;
  initialOwnedAgents: string[];
};

export function SessionProvider({
  children,
  authEnabled,
  initialEmail,
  initialOrgId,
  initialOwnedAgents,
}: SessionProviderProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(initialEmail);
  const [orgId, setOrgId] = useState<string | null>(initialOrgId);
  const [ownedAgents, setOwnedAgents] = useState<string[]>(initialOwnedAgents);

  // Sync entitlements from the server after refresh. Do not clobber a live
  // client session with a transient null email (cookie/header race on login).
  useEffect(() => {
    if (initialEmail !== null) {
      setEmail(initialEmail);
    }
    setOrgId(initialOrgId);
    setOwnedAgents(initialOwnedAgents);
  }, [initialEmail, initialOrgId, initialOwnedAgents]);

  // React to client-side auth changes. Refresh the RSC tree for entitlements
  // on sign-in / token refresh / sign-out — not on the mount INITIAL_SESSION.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        if (session?.user?.email) {
          setEmail(session.user.email);
        }
        return;
      }

      if (event === "SIGNED_OUT" || !session) {
        setEmail(null);
        setOrgId(null);
        setOwnedAgents([]);
        router.refresh();
        return;
      }

      setEmail(session.user?.email ?? null);
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setEmail(null);
    setOrgId(null);
    setOwnedAgents([]);
    router.refresh();
  }, [router]);

  const catalog = useMemo(() => buildAgentCatalog(ownedAgents), [ownedAgents]);

  const value = useMemo<SessionContextValue>(
    () => ({
      authEnabled,
      signedIn: Boolean(email),
      email,
      orgId,
      catalog,
      ownedAgents: catalog.ownedSlugs,
      signOut,
    }),
    [authEnabled, email, orgId, catalog, signOut]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
