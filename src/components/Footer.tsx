import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-slate-600 transition-colors duration-200 hover:text-sky-600"
          >
            20 to 1
          </Link>
          <nav className="flex gap-6 text-sm text-slate-500">
            <Link href="/products" className="transition-colors duration-200 hover:text-sky-600">
              Agents
            </Link>
            <Link href="/cart" className="transition-colors duration-200 hover:text-sky-600">
              Cart
            </Link>
            <a
              href="mailto:20to1@reqtec.com"
              className="transition-colors duration-200 hover:text-sky-600"
            >
              Contact
            </a>
            <Link href="/privacy" className="transition-colors duration-200 hover:text-sky-600">
              Privacy
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-slate-400" suppressHydrationWarning>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> 20 to 1. Practical Agentic Solutions.
        </p>
      </div>
    </footer>
  );
}
