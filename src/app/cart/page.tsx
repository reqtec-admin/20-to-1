"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

function upgradeLabel(upgrade: "advanced" | "premium" | null): string {
  if (upgrade === "advanced") return "Advanced — Native Model";
  if (upgrade === "premium") return "Premium — On Premise";
  return "";
}

function proServiceLabel(pro: "silver" | "gold" | "platinum" | null): string {
  if (pro === "silver") return "Silver";
  if (pro === "gold") return "Gold";
  if (pro === "platinum") return "Platinum";
  return "";
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center animate-fade-in-up">
        <h1 className="text-2xl font-semibold text-slate-700">Your cart is empty</h1>
        <p className="mt-2 text-slate-500 font-light">
          Add agents from the catalog to get started.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-sky-400 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-500 active:scale-[0.98]"
        >
          Explore agents
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-700 animate-fade-in-up">Cart</h1>
      <p className="mt-1 text-slate-500 font-light animate-fade-in-up" style={{ animationDelay: "50ms", animationFillMode: "both" }}>
        {itemCount} item(s)
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-slate-200/80 border border-slate-200/80 rounded-2xl bg-white shadow-sm overflow-hidden">
            {items.map(({ id, product, quantity, upgrade, proService }, i) => (
              <li
                key={id}
                className="flex gap-4 p-4 sm:p-6 transition-colors duration-200 hover:bg-slate-50/50 animate-fade-in-up"
                style={{ animationDelay: `${80 + i * 50}ms`, animationFillMode: "both" }}
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="96px"
                  />
                </div>
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-medium text-slate-700 transition-colors duration-200 hover:text-sky-600"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-slate-500">
                      ${product.price.toFixed(2)} / month
                    </p>
                    {(upgrade || proService) && (
                      <p className="text-xs text-slate-400 mt-1">
                        {[upgradeLabel(upgrade), proServiceLabel(proService)].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) =>
                        updateQuantity(id, Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-14 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(id)}
                      className="text-sm text-red-500/90 transition-colors duration-200 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-right font-medium text-slate-700 sm:self-center">
                  ${(product.price * quantity).toFixed(2)} / month
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">Order summary (per month)</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-700">
                ${subtotal.toFixed(2)} / month
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Tax calculated at checkout.</p>
            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-xl bg-sky-400 py-3 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-sky-500 active:scale-[0.98]"
            >
              Proceed to checkout
            </Link>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm text-sky-600 transition-colors duration-200 hover:text-sky-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
