"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/context/SessionProvider";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const { itemCount } = useCart();
  const { signedIn, email, catalog, signOut } = useSession();
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
            href="/investors"
            className="hidden text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-sky-600 sm:inline"
          >
            Investor Relations
          </Link>
          {signedIn && (
            <Link
              href="/account"
              className="relative flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-sky-600"
            >
              My Agents
              {catalog.ownedCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-xs font-medium text-white">
                  {catalog.ownedCount}
                </span>
              )}
            </Link>
          )}
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
          {signedIn ? (
            <div className="flex items-center gap-3">
              <span
                className="hidden max-w-[10rem] truncate text-sm font-light text-slate-400 md:inline"
                title={email ?? undefined}
              >
                {email}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-sky-600"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/account"
              className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-sky-600"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
