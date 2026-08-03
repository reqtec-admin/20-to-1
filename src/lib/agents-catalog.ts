import { products, type Product } from "@/lib/products";

/**
 * An agent catalog entry: a product enriched with the current org's
 * entitlement state. `owned` is derived from the JWT `agents` claim that the
 * middleware forwards from Supabase.
 */
export type AgentCatalogEntry = Product & {
  owned: boolean;
};

export type AgentCatalog = {
  entries: AgentCatalogEntry[];
  ownedSlugs: string[];
  ownedCount: number;
};

/**
 * Builds the agent catalog by overlaying the org's owned agent slugs onto the
 * full product catalog. Used by the layout (server) and the catalog context
 * (client) so the UI consistently reflects what the org has purchased.
 */
export function buildAgentCatalog(ownedSlugs: string[]): AgentCatalog {
  const ownedSet = new Set(ownedSlugs);
  const entries: AgentCatalogEntry[] = products.map((product) => ({
    ...product,
    owned: ownedSet.has(product.slug),
  }));
  const normalizedOwned = entries
    .filter((entry) => entry.owned)
    .map((entry) => entry.slug);

  return {
    entries,
    ownedSlugs: normalizedOwned,
    ownedCount: normalizedOwned.length,
  };
}
