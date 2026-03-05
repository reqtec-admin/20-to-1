"use client";

import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden px-4 py-20 sm:px-6 bg-[var(--bg)]">
      {/* Soft grid */}
      <div
        className="pointer-events-none absolute inset-0 animate-grid-pulse"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Soft orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-sky-200/40 blur-[80px] animate-float" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-56 w-56 rounded-full bg-teal-100/50 blur-[70px] animate-float" style={{ animationDelay: "-2s" }} />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-sky-100/50 blur-[50px] animate-float" style={{ animationDelay: "-4s" }} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p
          className="animate-fade-in-up text-sm font-medium tracking-[0.28em] text-sky-600/90 mb-6"
          style={{ animationDelay: "200ms", animationFillMode: "both" }}
        >
          20 to 1
        </p>

        <h1
          className="animate-fade-in-up text-4xl font-semibold tracking-tight text-slate-700 sm:text-5xl md:text-6xl lg:text-[3.25rem] leading-tight"
          style={{ animationDelay: "400ms", animationFillMode: "both" }}
        >
          <span className="text-slate-700">Welcome to the future</span>
          <br />
          <span className="animate-gradient-text">of your business.</span>
        </h1>

        <p
          className="animate-fade-in-up mt-8 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed"
          style={{ animationDelay: "800ms", animationFillMode: "both" }}
        >
          Practical Agentic Solutions for business owners.
        </p>

        <p
          className="animate-fade-in-up mt-4 text-sm text-slate-400 max-w-xl mx-auto font-light"
          style={{ animationDelay: "1000ms", animationFillMode: "both" }}
        >
          Deploy trained agents that handle calling, emails, data collection, and workflows—so you can focus on growth.
        </p>

        <div
          className="animate-fade-in-up mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animationDelay: "1200ms", animationFillMode: "both" }}
        >
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-medium text-white bg-sky-400/90 shadow-sm transition-all duration-300 hover:bg-sky-500/90 hover:shadow-md active:scale-[0.98]"
          >
            How it works
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center rounded-xl px-8 py-3.5 text-sm font-medium text-sky-600 border border-sky-300/60 bg-white/80 transition-all duration-300 hover:bg-sky-50 hover:border-sky-400/80"
          >
            Get started
          </Link>
        </div>

        <div
          className="animate-fade-in-up mt-14 h-px w-20 mx-auto bg-gradient-to-r from-transparent via-slate-300/70 to-transparent"
          style={{ animationDelay: "1400ms", animationFillMode: "both", transformOrigin: "center" }}
        />
      </div>
    </section>
  );
}
