import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";

export const metadata = {
  title: "Agents | 20 to 1",
  description: "Browse practical agentic solutions for your business.",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-700 animate-fade-in-up">All agents</h1>
      <p className="mt-2 text-slate-500 font-light animate-fade-in-up" style={{ animationDelay: "50ms", animationFillMode: "both" }}>
        {products.length} agents
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${100 + (i % 12) * 40}ms`, animationFillMode: "both" }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
