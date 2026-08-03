import { NextResponse } from "next/server";
import { buildStripeLineItems, validateCheckoutItems } from "@/lib/checkout-session";
import { isDemoMode } from "@/lib/payment-config";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Creates a Stripe Checkout Session for live payments.
 * Disabled while NEXT_PUBLIC_DEMO / DEMO is true (default).
 */
export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Payments are disabled in demo mode." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const items = validateCheckoutItems(body.items ?? []);

    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { error: "You must be signed in to complete checkout." },
          { status: 401 }
        );
      }
    }

    const customerEmail =
      typeof body.email === "string" ? body.email.trim() : undefined;

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000";

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: buildStripeLineItems(items),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      customer_email: customerEmail || undefined,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      metadata: {
        item_count: String(items.length),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to start Stripe checkout." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create checkout session";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
