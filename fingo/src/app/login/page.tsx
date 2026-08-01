"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { demoAccount } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/app";
  }, [searchParams]);

  const [email, setEmail] = useState(demoAccount.email);
  const [password, setPassword] = useState(demoAccount.password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(payload: { email?: string; password?: string; demo?: boolean }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not sign in.");
        setLoading(false);
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void submit({ email, password });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a6b48] via-[#0d8a5b] to-[#2a9ec4]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(255,241,168,0.5), transparent 35%), radial-gradient(circle at 85% 25%, rgba(255,106,61,0.3), transparent 30%), radial-gradient(circle at 50% 90%, rgba(255,255,255,0.16), transparent 40%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 grid w-full max-w-5xl gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="animate-rise text-white md:pr-6">
          <div className="mb-5 inline-flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-primary shadow-soft">
              F
            </span>
            FinGo
          </div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Sign in and keep your streak alive.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
            Your budgets, shared goals, and AI coach are waiting — one login away from today’s win.
          </p>
        </div>

        <div className="animate-rise-delay-1 rounded-[1.75rem] border border-white/50 bg-surface/95 p-6 shadow-lift backdrop-blur-md md:p-8">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Welcome back</p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink">Log in to FinGo</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Email</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-bg/40 py-3 pl-10 pr-4 text-sm text-ink outline-none ring-primary/30 focus:ring-2"
                  placeholder="you@email.com"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Password</span>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-bg/40 py-3 pl-10 pr-4 text-sm text-ink outline-none ring-primary/30 focus:ring-2"
                  placeholder="••••••••"
                />
              </span>
            </label>

            {error ? (
              <p className="rounded-2xl bg-danger-soft px-3 py-2 text-sm font-semibold text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="tactile flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-soft disabled:opacity-70"
            >
              {loading ? "Signing in…" : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void submit({ demo: true })}
            className="tactile w-full rounded-2xl border border-line bg-bg/50 px-4 py-3 text-sm font-bold text-ink disabled:opacity-70"
          >
            Continue with demo account
          </button>

          <p className="mt-4 rounded-2xl bg-primary-soft/70 px-3 py-2 text-xs leading-relaxed text-primary-deep">
            Demo login: <span className="font-bold">{demoAccount.email}</span> /{" "}
            <span className="font-bold">{demoAccount.password}</span>
            <br />
            Or use any email + password (6+ characters).
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-primary text-white">
          Loading FinGo…
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
