import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-sky-200/80"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium tracking-wide text-sky-600/90">
          {product.category}
        </p>
        <h2 className="mt-1 font-semibold text-slate-700 transition-colors duration-200 group-hover:text-sky-600">
          {product.name}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500 font-light">
          {product.description}
        </p>
        <p className="mt-auto pt-3 text-lg font-semibold text-slate-700">
          ${product.price.toFixed(2)}{" "}
          <span className="text-sm font-normal text-slate-400">/ month</span>
        </p>
      </div>
    </Link>
  );
}
