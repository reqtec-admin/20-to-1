"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/context/SessionProvider";
import {
  clearStoredCart,
  loadCartFromSession,
  planFromUpgrade,
} from "@/lib/cart-storage";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { authEnabled } = useSession();
  const [status, setStatus] = useState<"provisioning" | "done" | "error">(
    "provisioning"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finalize() {
      const stored = loadCartFromSession();
      const agents = stored.map((item) => ({
        slug: item.slug,
        plan: planFromUpgrade(item.upgrade),
      }));

      try {
        if (authEnabled && agents.length > 0) {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agents }),
          });
          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as
              | { error?: string }
              | null;
            throw new Error(data?.error ?? "Could not provision agents.");
          }
          router.refresh();
        }
        if (!cancelled) {
          clearCart();
          clearStoredCart();
          setStatus("done");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
          setStatus("error");
        }
      }
    }

    void finalize();
    return () => {
      cancelled = true;
    };
  }, [authEnabled, clearCart, router]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center animate-scale-in">
      <h1 className="text-2xl font-semibold text-slate-700">
        {status === "error" ? "Payment received" : "Payment successful"}
      </h1>
      <p className="mt-2 text-slate-500 font-light">
        {status === "provisioning" && "Setting up your agents…"}
        {status === "done" &&
          "Thank you for your order. Your agents have been provisioned to your organization."}
        {status === "error" &&
          (error ??
            "Payment succeeded, but we could not finish provisioning. Contact support with your receipt.")}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
