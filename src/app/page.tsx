import Link from "next/link";
import { LandingPageGate } from "@/components/LandingPageGate";
import { LandingHero } from "@/components/LandingHero";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/products";

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 3);

  return (
    <LandingPageGate>
      <LandingHero />

      <section className="relative border-t border-slate-200/80 bg-white/60 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10 animate-fade-in-up">
            <p className="text-xs font-medium tracking-[0.2em] text-sky-600/90">
              See what&apos;s possible
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-700 mt-2">
              Featured agents
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${150 + i * 80}ms`, animationFillMode: "both" }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="text-sm font-medium text-sky-600 border border-sky-300/60 rounded-xl px-6 py-3 inline-block transition-all duration-200 hover:bg-sky-50 hover:border-sky-400/80"
            >
              View all agents →
            </Link>
          </div>
        </div>
      </section>
    </LandingPageGate>
  );
}
