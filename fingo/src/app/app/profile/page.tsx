"use client";

import { useState } from "react";
import { ShoppingBag, Trophy } from "lucide-react";
import { Avatar, Panel, ProgressBar, SectionHeader } from "@/components/ui";
import { contributions, formatMoney, shopItems, user } from "@/lib/data";

export default function ProfilePage() {
  const [points, setPoints] = useState(user.goalPoints);
  const [owned, setOwned] = useState(
    new Set(shopItems.filter((i) => i.owned).map((i) => i.id)),
  );

  function buy(id: string, cost: number) {
    if (owned.has(id) || points < cost) return;
    setPoints((p) => p - cost);
    setOwned((prev) => new Set(prev).add(id));
  }

  return (
    <div className="space-y-5">
      <div className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          Profile & Community
        </h1>
        <p className="mt-1 text-sm text-muted">The Identity — your level, streak, and crew</p>
      </div>

      <Panel className="animate-rise-delay-1">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar initials={user.avatarInitials} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-extrabold text-ink">{user.name}</h2>
            <p className="text-sm text-muted">{user.handle}</p>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-sm font-semibold">
                <span>Level {user.level}</span>
                <span className="text-muted">
                  {user.xp}/{user.xpToNext} XP
                </span>
              </div>
              <ProgressBar value={user.xp} max={user.xpToNext} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Level" value={String(user.level)} tone="primary" />
          <Stat label="Streak" value={`${user.streak}d`} tone="accent" />
          <Stat label="Points" value={points.toLocaleString()} tone="sun" />
        </div>
      </Panel>

      <Panel className="animate-rise-delay-2">
        <SectionHeader
          title="Avatar Shop"
          subtitle="Spend Goal Points on badges, pets, and themes"
          action={
            <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-deep">
              <ShoppingBag className="h-4 w-4" />
              {points.toLocaleString()} pts
            </span>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {shopItems.map((item) => {
            const isOwned = owned.has(item.id);
            const canBuy = !isOwned && points >= item.cost;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-line bg-bg/50 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink">{item.name}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {item.type}
                    </p>
                  </div>
                  <Trophy className="h-4 w-4 text-sun" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-ink-soft">{item.cost} pts</span>
                  <button
                    type="button"
                    disabled={!canBuy && !isOwned}
                    onClick={() => buy(item.id, item.cost)}
                    className={`tactile rounded-xl px-3 py-2 text-xs font-bold ${
                      isOwned
                        ? "bg-primary-soft text-primary-deep"
                        : canBuy
                          ? "bg-primary text-white"
                          : "cursor-not-allowed bg-line text-muted"
                    }`}
                  >
                    {isOwned ? "Owned" : "Buy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="animate-rise-delay-3">
        <SectionHeader
          title="Community feed"
          subtitle="Cheer on friends and celebrate milestones"
        />
        <ul className="space-y-3">
          {contributions.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-line/70 bg-bg/40 px-4 py-3"
            >
              <p className="font-semibold text-ink">
                <span className="text-primary-deep">{c.user}</span> {c.action}
              </p>
              <p className="mt-1 text-xs text-muted">
                {c.time} · {c.cheer} cheers · avg gift {formatMoney(20)}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "accent" | "sun";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary-deep",
    accent: "bg-accent-soft text-accent",
    sun: "bg-sun-soft text-[#8a6a00]",
  };
  return (
    <div className={`animate-streak rounded-2xl p-3 text-center ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}
