"use client";

import { useSession } from "@/context/SessionProvider";

/**
 * Renders an "Owned" pill when the signed-in org has the given agent. Reads the
 * entitlement catalog the middleware feeds into the session context.
 */
export function OwnedBadge({ slug }: { slug: string }) {
  const { ownedAgents } = useSession();
  if (!ownedAgents.includes(slug)) return null;

  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
      Owned
    </span>
  );
}
