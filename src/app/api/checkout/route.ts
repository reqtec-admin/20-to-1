import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type CheckoutAgent = { slug: string; plan?: string };
type CheckoutBody = { orgName?: string; agents?: CheckoutAgent[] };

const VALID_PLANS = new Set(["standard", "advanced", "premium"]);

/**
 * Finalizes a (demo) purchase. In a real deployment this runs only after a
 * payment provider webhook confirms the charge. It provisions the buyer's
 * organization on first purchase and grants the purchased agents via the
 * `provision_checkout` RPC. The agent entitlements then flow into the JWT and
 * are surfaced to the UI on the next session refresh.
 */
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Auth is not configured for this environment." },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to complete checkout." },
      { status: 401 }
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const agents = Array.isArray(body.agents) ? body.agents : [];
  const normalizedAgents = agents
    .filter((a) => a && typeof a.slug === "string" && a.slug.trim() !== "")
    .map((a) => ({
      slug: a.slug.trim(),
      plan: a.plan && VALID_PLANS.has(a.plan) ? a.plan : "standard",
    }));

  if (normalizedAgents.length === 0) {
    return NextResponse.json(
      { error: "No agents in the order." },
      { status: 400 }
    );
  }

  const orgName =
    typeof body.orgName === "string" && body.orgName.trim() !== ""
      ? body.orgName.trim()
      : (user.email?.split("@")[0] ?? "My") + "'s Organization";

  const { data, error } = await supabase.rpc("provision_checkout", {
    p_org_name: orgName,
    p_agents: normalizedAgents,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Refresh the session so the new `agents` claim is minted into the JWT.
  await supabase.auth.refreshSession();

  return NextResponse.json({ ok: true, result: data });
}
