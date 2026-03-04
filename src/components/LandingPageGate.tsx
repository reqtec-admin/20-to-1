"use client";

import { useAuth } from "@/context/AuthContext";
import { PasscodeForm } from "./PasscodeForm";

export function LandingPageGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { unlocked } = useAuth();

  if (unlocked === null) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-[var(--bg)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-300 border-t-sky-600" />
      </section>
    );
  }

  if (!unlocked) {
    return <PasscodeForm />;
  }

  return <>{children}</>;
}
