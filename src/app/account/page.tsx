"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionProvider";
import { AuthForm } from "@/components/AuthForm";

export default function AccountPage() {
  const router = useRouter();
  const { authEnabled, signedIn, email, orgId, catalog } = useSession();

  if (!authEnabled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center animate-fade-in-up">
        <h1 className="text-2xl font-semibold text-slate-700">Accounts are not enabled</h1>
        <p className="mt-2 text-slate-500 font-light">
          Connect Supabase (set the public env vars) to enable sign in and agent
          entitlements.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block text-sky-600 transition-colors duration-200 hover:underline"
        >
          Browse agents
        </Link>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-700 animate-fade-in-up">
          Sign in to your account
        </h1>
        <div
          className="mt-8 animate-fade-in-up"
          style={{ animationDelay: "80ms", animationFillMode: "both" }}
        >
          <AuthForm
            defaultMode="signin"
            title="Sign in"
            subtitle="Access your organization and provisioned agents."
            onAuthenticated={() => router.refresh()}
          />
        </div>
      </div>
    );
  }

  const ownedEntries = catalog.entries.filter((entry) => entry.owned);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold text-slate-700">My Agents</h1>
        <p className="mt-1 text-slate-500 font-light">
          Signed in as <span className="font-medium text-slate-700">{email}</span>
          {orgId && (
            <>
              {" · "}
              <span className="text-slate-400">org {orgId.slice(0, 8)}</span>
            </>
          )}
        </p>
      </div>

      {ownedEntries.length === 0 ? (
        <div
          className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm animate-fade-in-up"
          style={{ animationDelay: "80ms", animationFillMode: "both" }}
        >
          <p className="text-slate-600">
            Your organization doesn&apos;t have any agents yet.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-xl bg-sky-400 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-500 active:scale-[0.98]"
          >
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ownedEntries.map((entry, i) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm animate-fade-in-up"
              style={{ animationDelay: `${60 + i * 50}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={entry.image}
                    alt={entry.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-700">{entry.name}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                </div>
              </div>
              <Link
                href={`/products/${entry.slug}`}
                className="mt-4 inline-block text-sm text-sky-600 transition-colors duration-200 hover:text-sky-700"
              >
                Manage / view details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
