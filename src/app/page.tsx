import Link from "next/link";
import { LandingHero } from "@/components/LandingHero";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/products";

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 3);

  return (
    <>
      <LandingHero />

      <section
        id="how-it-works"
        className="relative border-t border-slate-200/80 bg-white/60 py-16 px-4 sm:px-6 scroll-mt-20"
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium tracking-[0.2em] text-sky-600/90 text-center mb-2">
            How it works
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-700 text-center mb-10">
            The premier agentic solution provider for small businesses
          </h2>
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <p>
              Small businesses are the backbone of the economy. So much of the AI revolution can feel
              out of touch—not practically applicable to the day-to-day reality of running a small
              business.
            </p>
            <p>
              Let&apos;s be honest: AI is overwhelming, and Silicon Valley often seems lost in its
              own technical jargon. We get it. We focus on <strong className="text-slate-700">real
              use cases for real businesses</strong>—the kind that everyday business owners can
              actually benefit from.
            </p>
            <p>
              Are you an executive drowning in email and scheduling, with no time left to grow your
              business? Explore our{" "}
              <Link
                href="/products/executive-assistant"
                className="font-medium text-sky-600 hover:text-sky-500 underline underline-offset-4"
              >
                Executive Assistant
              </Link>{" "}
              agent.
            </p>
            <p>
              Running a roofing company and too busy placing bids, organizing crews, and ordering
              materials to be at your computer answering calls and inquiries? Take a look at our{" "}
              <Link
                href="/products/roofing-company-assistant"
                className="font-medium text-sky-600 hover:text-sky-500 underline underline-offset-4"
              >
                Roofing Company Assistant
              </Link>.
            </p>
            <p>
              Our agents aren&apos;t generic—they&apos;re specific. They meet your business exactly
              where you are. We believe the goal is simple: <strong className="text-slate-700">grow
              your small business</strong>. Select an agent that fits, and keep your competitive
              edge.
            </p>
            <p>
              Here&apos;s how we work with you: we match you with the right agent for your industry
              and workflow, get you set up with clear processes (calling, email, data collection—whatever
              you need), and we don&apos;t leave you to figure it out alone. Where possible, we
              provide <strong className="text-slate-700">on-site assistance</strong> to get you up
              and running, so you feel confident from day one.
            </p>
            <p>
              Agentic adoption is growing across industries—from real estate and roofing to
              marketing, operations, and support. Small businesses that lean into practical AI now
              are the ones staying ahead. We&apos;re here to make that adoption straightforward,
              human-centered, and tailored to you.
            </p>
          </div>
        </div>
      </section>

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
    </>
  );
}
