import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Sparkles, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative min-h-screen">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0a6b48] via-[#0d8a5b] to-[#2a9ec4]"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,241,168,0.55), transparent 35%), radial-gradient(circle at 80% 30%, rgba(255,106,61,0.35), transparent 30%), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.18), transparent 40%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(8,50,34,0.35))]"
          aria-hidden
        />

        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-white">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-primary shadow-soft">
              F
            </span>
            FinGo
          </div>
          <Link
            href="/app"
            className="tactile rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm"
          >
            Open app
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-6xl flex-col justify-end px-5 pb-16 pt-10 md:justify-center md:px-8 md:pb-24">
          <div className="animate-rise max-w-2xl">
            <p className="text-6xl font-extrabold tracking-tight text-white drop-shadow-sm md:text-8xl">
              FinGo
            </p>
            <h1 className="mt-4 max-w-xl text-2xl font-semibold leading-snug text-white/95 md:text-3xl">
              Money habits that feel like a win streak.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
              Budget, save with friends, and level up with an AI coach — the playful way to grow
              financial confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="tactile inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-base font-bold text-primary-deep shadow-lift"
              >
                Start your streak
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/app/coach"
                className="tactile inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3.5 text-base font-semibold text-white ring-1 ring-white/35 backdrop-blur-sm"
              >
                Meet the AI Coach
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section className="relative z-10 bg-[#f4fbf7]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3 md:px-8">
          <Feature
            icon={<Flame className="h-5 w-5" />}
            title="Gamified progress"
            body="Levels, streaks, and Goal Points turn healthy habits into something you’ll actually keep."
          />
          <Feature
            icon={<Users className="h-5 w-5" />}
            title="Social saving"
            body="Pool money for trips, gifts, and shared adventures with transparent contribution feeds."
          />
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="AI Coach"
            body="Conversational guidance grounded in your real spending — tips you can act on today."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="animate-rise">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
