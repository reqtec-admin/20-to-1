"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "20-to-1-passcode-unlocked";
const DEFAULT_PASSCODE =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_PASSCODE ?? "demo"
    : "demo";

type AuthContextValue = {
  unlocked: boolean | null;
  verifyPasscode: (code: string) => boolean;
  unlock: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      setUnlocked(stored === "true");
    } catch {
      setUnlocked(false);
    }
  }, []);

  const unlock = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
    setUnlocked(true);
  }, []);

  const verifyPasscode = useCallback(
    (code: string): boolean => {
      const ok = code.trim() === DEFAULT_PASSCODE;
      if (ok) unlock();
      return ok;
    },
    [unlock]
  );

  const value = useMemo(
    () => ({ unlocked, verifyPasscode, unlock }),
    [unlocked, verifyPasscode, unlock]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
