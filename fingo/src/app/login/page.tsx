"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { demoAccount } from "@/lib/auth";
import {
  employmentOptions,
  goalOptions,
  loadProfile,
  saveProfile,
} from "@/lib/profile";

const SALARY_PRESETS = [25000, 45000, 65000, 90000, 120000];

const steps = ["name", "employment", "salary", "goal", "signin"] as const;
type Step = (typeof steps)[number];

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/app";
  }, [searchParams]);

  const [step, setStep] = useState<Step>("name");
  const stepIndex = steps.indexOf(step);

  const [name, setName] = useState("");
  const [employment, setEmployment] = useState<string>("full-time");
  const [salary, setSalary] = useState("");
  const [goal, setGoal] = useState<string | null>(null);

  const [email, setEmail] = useState(demoAccount.email);
  const [password, setPassword] = useState(demoAccount.password);
  const [error, setError] = useState<string | null>(
    () => searchParams.get("error") || null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = loadProfile();
    if (!existing) return;
    setName(existing.name);
    setEmployment(existing.employment);
    if (existing.salary) setSalary(String(existing.salary));
    setGoal(existing.goal);
  }, []);

  function persistProfile() {
    saveProfile({
      name: name.trim(),
      employment,
      salary: salary ? Number(salary) : null,
      goal,
    });
  }

  function goNext() {
    setError(null);
    if (step === "name" && !name.trim()) {
      setError("Tell us your name so your coach knows what to call you.");
      return;
    }
    if (stepIndex < steps.length - 1) {
      const next = steps[stepIndex + 1];
      if (next === "signin") persistProfile();
      setStep(next);
    }
  }

  function goBack() {
    setError(null);
    if (stepIndex > 0) setStep(steps[stepIndex - 1]);
  }

  async function submit(payload: { email?: string; password?: string; demo?: boolean }) {
    setLoading(true);
    setError(null);
    persistProfile();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, name: name.trim() || undefined }),
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

  const googleHref = `/api/auth/google?next=${encodeURIComponent(nextPath)}${
    name.trim() ? `&name=${encodeURIComponent(name.trim())}` : ""
  }`;

  const firstName = name.trim().split(/\s+/)[0] || "";

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
            {step === "signin"
              ? `Almost there${firstName ? `, ${firstName}` : ""}!`
              : "Let’s set up your money game."}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
            {step === "signin"
              ? "Sign in and your coach will use your answers to personalize every tip."
              : "A few quick questions so your budgets, goals, and AI coach fit your real life."}
          </p>
        </div>

        <div className="animate-rise-delay-1 rounded-[1.75rem] border border-white/50 bg-surface/95 p-6 shadow-lift backdrop-blur-md md:p-8">
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <span>{step === "signin" ? "Sign in" : "About you"}</span>
              <span className="text-muted">
                {stepIndex + 1} / {steps.length}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {step === "name" ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-ink">What’s your name?</h2>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goNext()}
                placeholder="e.g. Alex Rivera"
                className="w-full rounded-2xl border border-line bg-bg/40 px-4 py-3.5 text-base font-semibold text-ink outline-none ring-primary/30 focus:ring-2"
              />
            </div>
          ) : null}

          {step === "employment" ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-ink">
                What do you do{firstName ? `, ${firstName}` : ""}?
              </h2>
              <div className="grid gap-2">
                {employmentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEmployment(opt.id)}
                    className={`tactile flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold ${
                      employment === opt.id
                        ? "border-primary bg-primary-soft text-primary-deep"
                        : "border-line bg-bg/40 text-ink"
                    }`}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === "salary" ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-ink">What’s your yearly income?</h2>
              <p className="text-sm text-muted">
                Rough is fine — it helps size your budgets. You can skip this.
              </p>
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-muted">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goNext()}
                  placeholder="65000"
                  className="w-full rounded-2xl border border-line bg-bg/40 py-3.5 pl-9 pr-4 text-base font-semibold text-ink outline-none ring-primary/30 focus:ring-2"
                />
              </span>
              <div className="flex flex-wrap gap-2">
                {SALARY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSalary(String(preset))}
                    className={`tactile rounded-full border px-3 py-1.5 text-xs font-bold ${
                      salary === String(preset)
                        ? "border-primary bg-primary-soft text-primary-deep"
                        : "border-line bg-bg/40 text-ink-soft"
                    }`}
                  >
                    ${(preset / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === "goal" ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-ink">What’s your top money goal?</h2>
              <div className="grid grid-cols-2 gap-2">
                {goalOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGoal(goal === opt.id ? null : opt.id)}
                    className={`tactile flex flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left text-sm font-bold ${
                      goal === opt.id
                        ? "border-primary bg-primary-soft text-primary-deep"
                        : "border-line bg-bg/40 text-ink"
                    }`}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === "signin" ? (
            <>
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
                  <p
                    className="rounded-2xl bg-danger-soft px-3 py-2 text-sm font-semibold text-danger"
                    role="alert"
                  >
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

              <a
                href={googleHref}
                onClick={persistProfile}
                className="tactile flex w-full items-center justify-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink shadow-soft"
              >
                <GoogleLogo />
                Continue with Google
              </a>

              <button
                type="button"
                disabled={loading}
                onClick={() => void submit({ demo: true })}
                className="tactile mt-3 w-full rounded-2xl border border-line bg-bg/50 px-4 py-3 text-sm font-bold text-ink disabled:opacity-70"
              >
                Continue with demo account
              </button>

              <p className="mt-4 rounded-2xl bg-primary-soft/70 px-3 py-2 text-xs leading-relaxed text-primary-deep">
                Demo login: <span className="font-bold">{demoAccount.email}</span> /{" "}
                <span className="font-bold">{demoAccount.password}</span>
                <br />
                Or use any email + password (6+ characters).
              </p>

              <button
                type="button"
                onClick={goBack}
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </>
          ) : (
            <>
              {error ? (
                <p
                  className="mt-4 rounded-2xl bg-danger-soft px-3 py-2 text-sm font-semibold text-danger"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <div className="mt-6 flex items-center justify-between">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-ink"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={goNext}
                  className="tactile inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-soft"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
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
