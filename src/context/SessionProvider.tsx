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

  // Keep client state in sync with server-rendered props (e.g. after a
  // router.refresh() following provisioning at checkout).
  useEffect(() => {
    setEmail(initialEmail);
    setOrgId(initialOrgId);
    setOwnedAgents(initialOwnedAgents);
  }, [initialEmail, initialOrgId, initialOwnedAgents]);

  // React to client-side auth changes (sign in/out, token refresh) by pulling
  // fresh server state, which re-runs the middleware and updates entitlements.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      router.refresh();
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
