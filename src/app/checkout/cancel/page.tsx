import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center animate-fade-in-up">
      <h1 className="text-2xl font-semibold text-slate-700">Checkout cancelled</h1>
      <p className="mt-2 text-slate-500 font-light">
        No payment was taken. Your cart items are still available.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/checkout"
          className="inline-block rounded-xl bg-sky-400 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-500 active:scale-[0.98]"
        >
          Return to checkout
        </Link>
        <Link
          href="/cart"
          className="inline-block text-sm text-sky-600 transition-colors duration-200 hover:text-sky-700"
        >
          Back to cart
        </Link>
      </div>
    </div>
  );
}
