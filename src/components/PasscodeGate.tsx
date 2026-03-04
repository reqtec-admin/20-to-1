"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function PasscodeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { unlocked } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (unlocked === null) return;
    setChecking(false);
    if (pathname !== "/" && !unlocked) {
      router.replace("/");
    }
  }, [pathname, unlocked, router]);

  if (checking || (pathname !== "/" && !unlocked)) {
    return null;
  }

  return <>{children}</>;
}
