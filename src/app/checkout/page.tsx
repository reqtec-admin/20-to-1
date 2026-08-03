"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/context/SessionProvider";
import { AuthForm } from "@/components/AuthForm";
import { getUpgradeFee, getProServiceFee, type UpgradeOption } from "@/lib/checkout-fees";

function planFromUpgrade(upgrade: UpgradeOption): "standard" | "advanced" | "premium" {
  if (upgrade === "advanced") return "advanced";
  if (upgrade === "premium") return "premium";
  return "standard";
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { signedIn, email, authEnabled } = useSession();
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalOneTime = items.reduce(
    (sum, item) => sum + getUpgradeFee(item.upgrade) + getProServiceFee(item.proService),
    0
  );

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center animate-fade-in-up">
        <h1 className="text-2xl font-semibold text-slate-700">No items to checkout</h1>
        <Link
          href="/products"
          className="mt-6 inline-block text-sky-600 transition-colors duration-200 hover:underline"
        >
          Explore agents
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center animate-scale-in">
        <h1 className="text-2xl font-semibold text-slate-700">Order placed</h1>
        <p className="mt-2 text-slate-500 font-light">
          Your agents have been provisioned to your organization.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/account"
            className="inline-block rounded-xl bg-sky-400 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-500 active:scale-[0.98]"
          >
            View My Agents
          </Link>
          <Link
            href="/products"
            className="inline-block text-sm text-sky-600 transition-colors duration-200 hover:text-sky-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Build the entitlement grant from the cart contents.
    const agents = items.map((item) => ({
      slug: item.product.slug,
      plan: planFromUpgrade(item.upgrade),
    }));

    setLoading(true);
    try {
      if (authEnabled) {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agents }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? "Could not complete checkout.");
        }
        // Pull the refreshed session so entitlements appear immediately.
        router.refresh();
      } else {
        // Demo fallback when Supabase is not configured.
        await new Promise((r) => setTimeout(r, 400));
      }
      clearCart();
      setPlaced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Account creation gate: require a signed-in user before purchase.
  if (authEnabled && !signedIn) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-700 animate-fade-in-up">
          Create your account to continue
        </h1>
        <p
          className="mt-2 text-slate-500 font-light animate-fade-in-up"
          style={{ animationDelay: "60ms", animationFillMode: "both" }}
        >
          Your agents are provisioned to an organization tied to your account.
          Create one now (or sign in) to complete checkout.
        </p>
        <div
          className="mt-8 animate-fade-in-up"
          style={{ animationDelay: "120ms", animationFillMode: "both" }}
        >
          <AuthForm
            defaultMode="signup"
            title="Create your account"
            subtitle="One account manages your organization and its agents."
            onAuthenticated={() => router.refresh()}
          />
        </div>
        <Link
          href="/cart"
          className="mt-4 block text-center text-sm text-sky-600 transition-colors duration-200 hover:text-sky-700"
        >
          Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-700 animate-fade-in-up">Checkout</h1>
      <div
        className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 animate-fade-in-up"
        style={{ animationDelay: "80ms", animationFillMode: "both" }}
      >
        Demo only: this checkout is for demonstration purposes only. No real payments will be
        collected.
      </div>

      {signedIn && (
        <p
          className="mt-3 text-sm text-slate-500 animate-fade-in-up"
          style={{ animationDelay: "100ms", animationFillMode: "both" }}
        >
          Signed in as <span className="font-medium text-slate-700">{email}</span>. Agents
          will be added to your organization.
        </p>
      )}

      <form onSubmit={handlePlaceOrder} className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {[
            { id: "name", label: "Full name", type: "text", placeholder: "Jane Doe" },
            { id: "address", label: "Address", type: "text", placeholder: "123 Main St, City, State, ZIP" },
          ].map((field, i) => (
            <div key={field.id} className="animate-fade-in-up" style={{ animationDelay: `${50 + i * 60}ms`, animationFillMode: "both" }}>
              <label htmlFor={field.id} className="block text-sm font-medium text-slate-500">
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                required
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 placeholder:text-slate-400 transition-colors duration-200 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
              />
            </div>
          ))}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">Order summary</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map(({ id, product, quantity, upgrade, proService }) => (
                <li key={id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">{product.name} × {quantity}</span>
                    <span className="font-medium text-slate-700">
                      ${(product.price * quantity).toFixed(2)} / month
                    </span>
                  </div>
                  {(upgrade || proService) && (
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0 text-xs text-slate-500">
                      {upgrade && (
                        <span>
                          {upgrade === "advanced" ? "Advanced — Native Model" : "Premium — On Premise"}
                          {" "}(+${getUpgradeFee(upgrade).toLocaleString()})
                        </span>
                      )}
                      {proService && (
                        <span>
                          Pro: {proService.charAt(0).toUpperCase() + proService.slice(1)}
                          {" "}(+${getProServiceFee(proService).toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="text-slate-600">Subtotal (per month)</span>
              <span className="font-medium text-slate-700">${subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-4 flex flex-col gap-1 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm font-medium text-slate-700">
                <span>Total one-time</span>
                <span>${totalOneTime.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-700">
                <span>Total per month</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 mt-1 text-base font-semibold text-slate-800">
                <span>Total amount</span>
                <span>
                  ${totalOneTime.toLocaleString()} one-time + ${subtotal.toFixed(2)} / month
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Demo only. No payment is processed.
            </p>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-sky-400 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-sky-500 disabled:opacity-70 active:scale-[0.99]"
            >
              {loading ? "Placing order…" : "Place order"}
            </button>
            <Link
              href="/cart"
              className="mt-3 block text-center text-sm text-sky-600 transition-colors duration-200 hover:text-sky-700"
            >
              Back to cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
