"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

export function PasscodeForm() {
  const { verifyPasscode } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (verifyPasscode(code)) {
      return;
    }
    setError("Incorrect passcode. Try again.");
  }

  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 py-20 sm:px-6 bg-[var(--bg)]">
      <div className="w-full max-w-sm mx-auto">
        <p className="text-center text-sm font-medium tracking-[0.2em] text-sky-600/90 mb-1">
          20 to 1
        </p>
        <p className="text-center text-[0.7rem] font-semibold tracking-[0.28em] text-slate-400 uppercase mb-4">
          Investors
        </p>
        <p className="text-slate-500 text-sm text-center leading-relaxed mb-6">
          This space is reserved for investors and partners. Once you enter the
          passcode, you&apos;ll get access to a focused view of our strategy,
          traction, and roadmap.
        </p>

        <h1 className="text-2xl font-semibold text-slate-700 text-center mb-2">
          Enter passcode
        </h1>
        <p className="text-slate-500 text-sm text-center mb-8 font-light">
          Use the passcode provided to you to access the site.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoComplete="off"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            placeholder="Passcode"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 placeholder:text-slate-400 transition-colors duration-200 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
          />
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-sky-400 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-500 active:scale-[0.98]"
          >
            Continue
          </button>
        </form>
        <p className="mt-8 text-sm text-center text-slate-500">
          Interested?{" "}
          <a
            href="mailto:20to1@reqtec.com"
            className="font-medium text-sky-600 hover:text-sky-500 underline underline-offset-4"
          >
            Request your Access Code
          </a>
          .
        </p>
      </div>
    </section>
  );
}
