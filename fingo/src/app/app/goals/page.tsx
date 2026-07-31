import { Heart, UserPlus } from "lucide-react";
import { Avatar, Panel, ProgressBar, SectionHeader } from "@/components/ui";
import { contributions, formatMoney, goals } from "@/lib/data";

export default function GoalsPage() {
  return (
    <div className="space-y-5">
      <div className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Collaborative Goals
          </h1>
          <p className="mt-1 text-sm text-muted">The Social Lab — save together, celebrate together</p>
        </div>
        <button className="tactile inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft">
          <UserPlus className="h-4 w-4" />
          Invite friends
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {goals.map((goal, index) => {
          const pct = Math.round((goal.raised / goal.target) * 100);
          return (
            <Panel
              key={goal.id}
              className={index === 0 ? "animate-rise-delay-1" : "animate-rise-delay-2"}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-ink">{goal.title}</h2>
                  <p className="mt-1 text-sm text-muted">Deadline {goal.deadline}</p>
                </div>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary-deep">
                  {pct}%
                </span>
              </div>
              <ProgressBar
                value={goal.raised}
                max={goal.target}
                color={goal.emojiTone === "sun" ? "var(--sun)" : "var(--accent)"}
              />
              <p className="mt-2 text-sm font-semibold text-ink-soft">
                {formatMoney(goal.raised)} of {formatMoney(goal.target)}
              </p>
              <div className="mt-4 flex items-center gap-2">
                {goal.members.map((m, i) => (
                  <Avatar
                    key={m.name}
                    initials={m.initials}
                    size="sm"
                    tone={(["primary", "sky", "accent", "sun"] as const)[i % 4]}
                  />
                ))}
                <span className="ml-1 text-sm text-muted">{goal.members.length} savers</span>
              </div>
              <ul className="mt-4 space-y-2 border-t border-line pt-3">
                {goal.members.map((m) => (
                  <li key={m.name} className="flex justify-between text-sm">
                    <span className="font-medium text-ink-soft">{m.name}</span>
                    <span className="font-bold text-ink">{formatMoney(m.amount)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          );
        })}
      </div>

      <Panel className="animate-rise-delay-3">
        <SectionHeader
          title="Contribution feed"
          subtitle="Real-time accountability and encouragement"
        />
        <ul className="space-y-3">
          {contributions.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-bg/40 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-ink">
                  <span className="text-primary-deep">{c.user}</span> {c.action}
                </p>
                <p className="mt-0.5 text-xs text-muted">{c.time}</p>
              </div>
              <button className="tactile inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent">
                <Heart className="h-3.5 w-3.5" />
                {c.cheer}
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
