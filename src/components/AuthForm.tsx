"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signup" | "signin";

export type AuthFormProps = {
  /** Called after a session is established (sign in, or sign up w/o confirmation). */
  onAuthenticated?: () => void;
  defaultMode?: Mode;
  /** Heading copy; checkout passes context-specific text. */
  title?: string;
  subtitle?: string;
};

export function AuthForm({
  onAuthenticated,
  defaultMode = "signup",
  title,
  subtitle,
}: AuthFormProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();
  const authEnabled = Boolean(supabase);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!supabase) {
      setError(
        "Authentication is not configured for this environment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // With email confirmation enabled there is no session yet.
        if (!data.session) {
          setInfo("Check your email to confirm your account, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onAuthenticated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-700">
        {title ?? (mode === "signup" ? "Create your account" : "Sign in")}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500 font-light">{subtitle}</p>
      )}

      {!authEnabled && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Auth is not configured in this environment. The form is shown for
          demonstration; connect Supabase to enable sign up.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="auth-email" className="block text-sm font-medium text-slate-500">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 placeholder:text-slate-400 transition-colors duration-200 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="block text-sm font-medium text-slate-500">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 placeholder:text-slate-400 transition-colors duration-200 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-400 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-500 disabled:opacity-70 active:scale-[0.99]"
        >
          {loading
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "signup" ? "signin" : "signup"));
          setError(null);
          setInfo(null);
        }}
        className="mt-4 w-full text-center text-sm text-sky-600 transition-colors duration-200 hover:text-sky-700"
      >
        {mode === "signup"
          ? "Already have an account? Sign in"
          : "Need an account? Create one"}
      </button>
    </div>
  );
}
