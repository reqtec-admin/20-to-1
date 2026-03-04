"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const { itemCount } = useCart();
  const [popBadge, setPopBadge] = useState(false);
  const prevCountRef = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setPopBadge(true);
      const t = setTimeout(() => setPopBadge(false), 350);
      prevCountRef.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-md transition-shadow duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-slate-700 transition-colors duration-200 hover:text-sky-600"
        >
          20 to 1
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-sky-600"
          >
            Agents
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-sky-600"
          >
            Cart
            {itemCount > 0 && (
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-400 px-1.5 text-xs font-medium text-white transition-transform duration-200 ${
                  popBadge ? "animate-cart-badge-pop" : ""
                }`}
              >
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
