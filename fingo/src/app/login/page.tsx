"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { demoAccount } from "@/lib/auth";
import {
  employmentOptions,
  goalOptions,
  saveProfile,
} from "@/lib/profile";
import { suggestUsername, validateUsername } from "@/lib/username";

const SALARY_PRESETS = [25000, 45000, 65000, 90000, 120000];

type Mode = "signin" | "signup";
type SignupStep = "name" | "username" | "employment" | "salary" | "goal" | "account";

const signupSteps: SignupStep[] = [
  "name",
  "username",
  "employment",
  "salary",
  "goal",
  "account",
];

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

  const [mode, setMode] = useState<Mode>("signin");
  const [signupStep, setSignupStep] = useState<SignupStep>("name");
  const stepIndex = signupSteps.indexOf(signupStep);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [employment, setEmployment] = useState("full-time");
  const [salary, setSalary] = useState("");
  const [goal, setGoal] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    () => searchParams.get("error") || null,
  );
  const [loading, setLoading] = useState(false);

  const firstName = name.trim().split(/\s+/)[0] || "";

  function switchToSignIn() {
    setMode("signin");
    setSignupStep("name");
    setError(null);
    setEmail("");
    setPassword("");
  }

  function switchToSignUp() {
    setMode("signup");
    setSignupStep("name");
    setError(null);
    setEmail("");
    setPassword("");
  }

  function persistLocalProfile(accountEmail: string) {
    saveProfile(
      {
        name: name.trim(),
        employment,
        salary: salary ? Number(salary) : null,
        goal,
      },
      accountEmail,
    );
  }

  function goNext() {
    setError(null);
    if (signupStep === "name" && !name.trim()) {
      setError("Tell us your name so your coach knows what to call you.");
      return;
    }
    if (signupStep === "name" && !username.trim()) {
      setUsername(suggestUsername(name));
    }
    if (signupStep === "username") {
      const check = validateUsername(username);
      if (!check.ok) {
        setError(check.error);
        return;
      }
      setUsername(check.username);
    }
    if (stepIndex < signupSteps.length - 1) {
      setSignupStep(signupSteps[stepIndex + 1]);
    }
  }

  function goBack() {
    setError(null);
    if (stepIndex > 0) setSignupStep(signupSteps[stepIndex - 1]);
    else switchToSignIn();
  }

  async function signIn(payload: { email?: string; password?: string; demo?: boolean }) {
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

  async function createAccount() {
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    const usernameCheck = validateUsername(username);
    if (!usernameCheck.ok) {
      setError(usernameCheck.error);
      setSignupStep("username");
      return;
    }
    if (!email.includes("@") || password.length < 6) {
      setError("Enter a valid email and a password with at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name.trim(),
          username: usernameCheck.username,
          profile: {
            employment,
            salary: salary ? Number(salary) : null,
            goal,
          },
        }),
      });
      const data = (await res.json()) as { error?: string; user?: { email: string } };
      if (!res.ok) {
        setError(data.error || "Could not create account.");
        setLoading(false);
        return;
      }
      if (data.user?.email) persistLocalProfile(data.user.email);
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  function onSignInSubmit(e: FormEvent) {
    e.preventDefault();
    void signIn({ email, password });
  }

  function onSignUpSubmit(e: FormEvent) {
    e.preventDefault();
    void createAccount();
  }

  const googleHref = useMemo(() => {
    const params = new URLSearchParams({ next: nextPath });
    if (mode === "signup") {
      if (name.trim()) params.set("name", name.trim());
      if (username.trim()) params.set("username", username.trim());
      if (employment) params.set("employment", employment);
      if (salary) params.set("salary", salary);
      if (goal) params.set("goal", goal);
    }
    return `/api/auth/google?${params.toString()}`;
  }, [employment, goal, mode, name, nextPath, salary, username]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a6b48] via-[#0d8a5b] to-[#2a9ec4] dark:from-[#071a12] dark:via-[#0a2a1c] dark:to-[#0c2a36]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(255,241,168,0.5), transparent 35%), radial-gradient(circle at 85% 25%, rgba(255,106,61,0.3), transparent 30%), radial-gradient(circle at 50% 90%, rgba(255,255,255,0.16), transparent 40%)",
        }}
        aria-hidden
      />

      <div className="absolute right-4 top-4 z-20 md:right-6 md:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="animate-rise text-white md:pr-6">
          <div className="mb-5 inline-flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-primary shadow-soft">
              F
            </span>
            FinGo
          </div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            {mode === "signin"
              ? "Welcome back. Keep your streak alive."
              : signupStep === "account"
                ? `Almost there${firstName ? `, ${firstName}` : ""}!`
                : "Let’s set up your money game."}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
            {mode === "signin"
              ? "Sign in to your own account — budgets, levels, and receipts stay private to you."
              : "A few quick questions, then create your account. Your data never mixes with anyone else’s."}
          </p>
        </div>

        <div className="animate-rise-delay-1 rounded-[1.75rem] border border-white/50 bg-surface/95 p-6 shadow-lift backdrop-blur-md md:p-8">
          {mode === "signin" ? (
            <>
              <div className="mb-6">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                  Welcome back
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-ink">Log in to FinGo</h2>
              </div>

              <form onSubmit={onSignInSubmit} className="space-y-4">
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
                className="tactile flex w-full items-center justify-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink shadow-soft"
              >
                <GoogleLogo />
                Continue with Google
              </a>

              <button
                type="button"
                disabled={loading}
                onClick={() => void signIn({ demo: true })}
                className="tactile mt-3 w-full rounded-2xl border border-line bg-bg/50 px-4 py-3 text-sm font-bold text-ink disabled:opacity-70"
              >
                Continue with demo account
              </button>

              <p className="mt-4 rounded-2xl bg-primary-soft/70 px-3 py-2 text-xs leading-relaxed text-primary-deep">
                Demo login: <span className="font-bold">{demoAccount.email}</span> /{" "}
                <span className="font-bold">{demoAccount.password}</span>
              </p>

              <p className="mt-5 text-center text-sm text-ink-soft">
                New here?{" "}
                <button
                  type="button"
                  onClick={switchToSignUp}
                  className="font-bold text-primary hover:underline"
                >
                  Create an account
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  <span>{signupStep === "account" ? "Create account" : "About you"}</span>
                  <span className="text-muted">
                    {stepIndex + 1} / {signupSteps.length}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${((stepIndex + 1) / signupSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {signupStep === "name" ? (
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

              {signupStep === "username" ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-ink">Pick a username</h2>
                  <p className="text-sm text-muted">
                    This is how you show up in FinGo — unique to you, not shared with anyone else.
                  </p>
                  <span className="relative block">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-muted">
                      @
                    </span>
                    <input
                      autoFocus
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.replace(/^@+/, "").toLowerCase())
                      }
                      onKeyDown={(e) => e.key === "Enter" && goNext()}
                      placeholder="yourname"
                      className="w-full rounded-2xl border border-line bg-bg/40 py-3.5 pl-9 pr-4 text-base font-semibold text-ink outline-none ring-primary/30 focus:ring-2"
                    />
                  </span>
                  <p className="text-xs text-muted">
                    Letters, numbers, and underscores. 3–20 characters.
                  </p>
                </div>
              ) : null}

              {signupStep === "employment" ? (
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

              {signupStep === "salary" ? (
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

              {signupStep === "goal" ? (
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

              {signupStep === "account" ? (
                <>
                  <form onSubmit={onSignUpSubmit} className="space-y-4">
                    <h2 className="text-2xl font-extrabold text-ink">Create your account</h2>
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
                      <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
                        Password
                      </span>
                      <span className="relative block">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                          type="password"
                          autoComplete="new-password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-2xl border border-line bg-bg/40 py-3 pl-10 pr-4 text-sm text-ink outline-none ring-primary/30 focus:ring-2"
                          placeholder="At least 6 characters"
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
                      {loading ? "Creating account…" : "Create account"}
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
                    className="tactile flex w-full items-center justify-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink shadow-soft"
                  >
                    <GoogleLogo />
                    Sign up with Google
                  </a>

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
                    <button
                      type="button"
                      onClick={goBack}
                      className="inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-ink"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
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

              <p className="mt-5 text-center text-sm text-ink-soft">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchToSignIn}
                  className="font-bold text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
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
