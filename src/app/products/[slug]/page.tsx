"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getProductBySlug } from "@/lib/products";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <p className="text-slate-500">Agent not found.</p>
        <Link href="/products" className="mt-4 inline-block text-sky-600 hover:underline">
          Back to agents
        </Link>
      </div>
    );
  }

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/products"
        className="text-sm text-slate-500 transition-colors duration-200 hover:text-sky-600 animate-fade-in"
      >
        ← Back to agents
      </Link>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 animate-fade-in-up">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
          <p className="text-xs font-medium tracking-wide text-sky-600/90">
            {product.category}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-700 sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-3 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
            Coming soon
          </p>
          <p className="mt-4 text-lg font-semibold text-slate-700">
            ${product.price.toFixed(2)}{" "}
            <span className="text-sm font-normal text-slate-400">/ month</span>
          </p>
          <p className="mt-4 text-slate-500 font-light leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Qty</span>
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-center text-sm text-slate-700 transition-colors duration-200 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
              />
            </label>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`rounded-xl px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-300 ${
                added
                  ? "bg-emerald-400/90 scale-[0.98]"
                  : "bg-sky-400 hover:bg-sky-500 active:scale-[0.98]"
              }`}
            >
              {added ? "Added to cart" : "Add to cart"}
            </button>
            <Link
              href="/cart"
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:border-sky-200"
            >
              View cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
