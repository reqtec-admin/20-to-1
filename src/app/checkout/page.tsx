"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { saveCartToSession } from "@/lib/cart-storage";
import { getUpgradeFee, getProServiceFee } from "@/lib/checkout-fees";
import { isDemoMode } from "@/lib/payment-config";

const demoMode = isDemoMode();

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

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
          Thank you. This is a demo—no payment was collected.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-sky-400 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-500 active:scale-[0.98]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  async function handleStripeCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      saveCartToSession(items);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            upgrade: item.upgrade,
            proService: item.proService,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to start checkout");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout");
      setLoading(false);
    }
  }

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      clearCart();
      setPlaced(true);
      setLoading(false);
    }, 600);
  }

  const handleSubmit = demoMode ? handlePlaceOrder : handleStripeCheckout;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-700 animate-fade-in-up">Checkout</h1>
      {demoMode && (
        <div
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 animate-fade-in-up"
          style={{ animationDelay: "80ms", animationFillMode: "both" }}
        >
          Demo only: this checkout is for demonstration purposes only. No real payments will be
          collected.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {[
            { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
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
                value={field.id === "email" ? email : undefined}
                onChange={field.id === "email" ? (e) => setEmail(e.target.value) : undefined}
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
            {demoMode ? (
              <p className="mt-2 text-xs text-slate-400">
                Demo only. No payment is processed.
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Secure payment powered by Stripe. Billing address collected at checkout.
              </p>
            )}
            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-sky-400 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-sky-500 disabled:opacity-70 active:scale-[0.99]"
            >
              {loading
                ? demoMode
                  ? "Placing order…"
                  : "Redirecting to Stripe…"
                : demoMode
                  ? "Place order"
                  : "Pay with Stripe"}
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
