"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { clearStoredCart } from "@/lib/cart-storage";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    clearStoredCart();
  }, [clearCart]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center animate-scale-in">
      <h1 className="text-2xl font-semibold text-slate-700">Payment successful</h1>
      <p className="mt-2 text-slate-500 font-light">
        Thank you for your order. Your subscription is being set up.
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
