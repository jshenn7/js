"use client";

import { useState } from "react";
import { CheckCircle2, Flame, HandCoins, Sparkles, Trophy } from "lucide-react";
import { Panel, SectionHeader } from "@/components/ui";
import { useProgress } from "@/lib/progress-store";

/** Live level + streak chips for the app header. */
export function HeaderStats() {
  const { snapshot } = useProgress();
  const streak = snapshot?.streak ?? 0;
  const level = snapshot?.level ?? 1;
  const pct = snapshot ? Math.round((snapshot.xpInto / snapshot.xpForNext) * 100) : 0;

  return (
    <>
      <span className="rounded-full bg-sun-soft px-3 py-1 font-bold text-[#8a6a00]">
        🔥 {streak} day streak
      </span>
      <span
        className="hidden flex-col rounded-full bg-primary-soft px-3 py-1 font-bold text-primary-deep sm:flex"
        title={
          snapshot
            ? `${snapshot.xpInto}/${snapshot.xpForNext} XP to level ${level + 1}`
            : undefined
        }
      >
        <span>Lv {level}</span>
        <span className="mt-0.5 block h-1 w-full overflow-hidden rounded-full bg-white/70">
          <span
            className="block h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </span>
      </span>
    </>
  );
}

/** Level-up / quest-complete / XP toasts, queued by the progress store. */
export function CelebrationOverlay() {
  const { celebration, dismissCelebration } = useProgress();
  if (!celebration) return null;

  if (celebration.type === "levelup") {
    return (
      <button
        type="button"
        onClick={dismissCelebration}
        className="fixed inset-0 z-[70] grid place-items-center bg-ink/40 backdrop-blur-sm"
        aria-label="Dismiss level up"
      >
        <div className="animate-streak mx-4 flex max-w-sm flex-col items-center gap-3 rounded-[2rem] border-4 border-sun bg-surface px-10 py-8 text-center shadow-lift">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-sun-soft text-3xl">
            🏆
          </span>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Level up!</p>
          <p className="text-4xl font-extrabold text-ink">Level {celebration.level}</p>
          <p className="text-sm text-muted">Keep the streak going — new quests unlock daily.</p>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed left-1/2 top-4 z-[70] -translate-x-1/2">
      <div className="animate-streak flex items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-lift">
        {celebration.type === "quest" ? (
          <>
            <span className="text-base">{celebration.quest.emoji}</span>
            Quest complete: {celebration.quest.label}
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs">
              +{celebration.quest.rewardXp} XP
            </span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-sun" />
            +{celebration.amount} XP
          </>
        )}
      </div>
    </div>
  );
}

/** Daily & weekly quest list with progress. */
export function QuestsPanel({ className }: { className?: string }) {
  const { snapshot, ready } = useProgress();
  const quests = snapshot?.quests || [];
  const daily = quests.filter((q) => q.cadence === "daily");
  const weekly = quests.filter((q) => q.cadence === "weekly");
  const doneToday = daily.filter((q) => q.completed).length;

  return (
    <Panel className={className}>
      <SectionHeader
        title="Quests"
        subtitle="Complete quests to earn XP and level up"
        action={
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-deep">
            <Trophy className="h-3.5 w-3.5" />
            {doneToday}/{daily.length} today
          </span>
        }
      />
      {!ready ? (
        <p className="text-sm text-muted">Loading quests…</p>
      ) : (
        <div className="space-y-2.5">
          {[...daily, ...weekly].map((quest) => (
            <div
              key={quest.id}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                quest.completed
                  ? "border-primary/40 bg-primary-soft/40"
                  : "border-line/70 bg-bg/40"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface text-lg shadow-soft">
                {quest.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`truncate text-sm font-bold ${
                      quest.completed ? "text-primary-deep" : "text-ink"
                    }`}
                  >
                    {quest.label}
                  </p>
                  <span className="shrink-0 rounded-full bg-sun-soft px-2 py-0.5 text-[11px] font-bold text-[#8a6a00]">
                    +{quest.rewardXp} XP
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.round((quest.progress / quest.target) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-muted">
                    {quest.progress}/{quest.target}
                  </span>
                  {quest.cadence === "weekly" ? (
                    <span className="rounded-full bg-sky-soft px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#0b5e7d]">
                      weekly
                    </span>
                  ) : null}
                </div>
              </div>
              {quest.completed ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/** Contribute button for shared goals — records the action for XP/quests. */
export function GoalBoostButton({ amount = 25 }: { amount?: number }) {
  const { recordAction } = useProgress();
  const [busy, setBusy] = useState(false);

  async function boost() {
    setBusy(true);
    await recordAction("goal");
    setBusy(false);
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void boost()}
      className="tactile inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-soft disabled:opacity-60"
    >
      <HandCoins className="h-4 w-4" />
      Chip in ${amount}
    </button>
  );
}

/** Recent XP history feed for the profile page. */
export function XpHistory() {
  const { snapshot, ready } = useProgress();
  const events = snapshot?.recent || [];
  return (
    <Panel>
      <SectionHeader title="XP history" subtitle="Your latest wins, straight from the database" />
      {!ready ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted">No XP yet — complete a quest to get started.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event, i) => (
            <li
              key={`${event.createdAt}-${i}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-bg/40 px-4 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Flame className="h-4 w-4 shrink-0 text-accent" />
                <p className="truncate text-sm font-semibold text-ink">{event.label}</p>
              </div>
              <span className="shrink-0 text-sm font-extrabold text-primary-deep">
                +{event.xp} XP
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
