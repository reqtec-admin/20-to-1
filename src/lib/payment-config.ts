/**
 * Demo mode is on by default. Set NEXT_PUBLIC_DEMO=false (or DEMO=false on the server)
 * to enable live Stripe checkout.
 */
function parseDemoFlag(value: string | undefined): boolean {
  if (value === undefined) return true;
  const normalized = value.trim().toLowerCase();
  return normalized !== "false" && normalized !== "0" && normalized !== "no";
}

export function isDemoMode(): boolean {
  const raw =
    process.env.NEXT_PUBLIC_DEMO ??
    process.env.DEMO ??
    "true";
  return parseDemoFlag(raw);
}

export function getStripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}
