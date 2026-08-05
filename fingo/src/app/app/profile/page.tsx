"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ShoppingBag, Sparkles } from "lucide-react";
import { XpHistory } from "@/components/ProgressUI";
import { Panel, ProgressBar, SectionHeader } from "@/components/ui";
import { contributions, formatMoney, user } from "@/lib/data";
import { useAccount } from "@/lib/account-store";
import { loadProfile } from "@/lib/profile";
import { useProgress } from "@/lib/progress-store";
import { useShop } from "@/lib/shop-store";
import type { ShopItem, ShopItemType } from "@/lib/shop";

const filters: Array<"All" | ShopItemType> = ["All", "Badge", "Pet", "Theme"];

export default function ProfilePage() {
  const {
    points,
    catalog,
    buy,
    equip,
    unequip,
    isOwned,
    isEquipped,
    equippedItems,
  } = useShop();
  const { snapshot, recordAction } = useProgress();
  const { user: account } = useAccount();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [toast, setToast] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(user.name);
  useEffect(() => {
    const profile = loadProfile(account?.email);
    if (profile?.name) setDisplayName(profile.name);
    else if (account?.name) setDisplayName(account.name);
  }, [account?.email, account?.name]);

  const level = snapshot?.level ?? user.level;
  const xpInto = snapshot?.xpInto ?? user.xp;
  const xpForNext = snapshot?.xpForNext ?? user.xpToNext;
  const streak = snapshot?.streak ?? user.streak;
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const visibleItems = useMemo(
    () => (filter === "All" ? catalog : catalog.filter((item) => item.type === filter)),
    [catalog, filter],
  );

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  function onBuy(item: ShopItem) {
    const result = buy(item.id);
    flash(result.message);
    if (result.ok) {
      void recordAction("shop", { itemId: item.id });
    }
  }

  function onEquipToggle(item: ShopItem) {
    if (isEquipped(item.id)) {
      unequip(item.type);
      flash(`Unequipped ${item.name}.`);
      return;
    }
    const result = equip(item.id);
    flash(result.message);
  }

  const themeStyle = equippedItems.theme?.theme
    ? {
        background: equippedItems.theme.theme.panel,
        borderColor: "transparent",
      }
    : undefined;

  return (
    <div className="space-y-5">
      <div className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Profile & Community
          </h1>
          <p className="mt-1 text-sm text-muted">The Identity — your level, streak, and crew</p>
        </div>
        {toast ? (
          <div
            className="animate-streak rounded-2xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lift"
            role="status"
          >
            {toast}
          </div>
        ) : null}
      </div>

      <Panel className="animate-rise-delay-1 transition-colors" style={themeStyle}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-xl font-extrabold text-white shadow-soft">
              {initials}
            </div>
            {equippedItems.badge ? (
              <span
                className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-surface text-sm shadow-soft ring-2 ring-primary/20"
                title={equippedItems.badge.name}
              >
                {equippedItems.badge.glyph}
              </span>
            ) : null}
            {equippedItems.pet ? (
              <span
                className="absolute -bottom-1 -left-1 grid h-8 w-8 place-items-center rounded-full bg-sun-soft text-base shadow-soft ring-2 ring-white"
                title={equippedItems.pet.name}
              >
                {equippedItems.pet.glyph}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold text-ink">{displayName}</h2>
              {equippedItems.badge ? (
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary-deep">
                  {equippedItems.badge.glyph} {equippedItems.badge.name}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-muted">
              {account?.handle ||
                (account?.username ? `@${account.username}` : user.handle)}
            </p>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-sm font-semibold">
                <span>Level {level}</span>
                <span className="text-muted">
                  {xpInto}/{xpForNext} XP
                </span>
              </div>
              <ProgressBar
                value={xpInto}
                max={xpForNext}
                color={equippedItems.theme?.theme?.accent}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Level" value={String(level)} tone="primary" />
          <Stat label="Streak" value={`${streak}d`} tone="accent" />
          <Stat label="Points" value={points.toLocaleString()} tone="sun" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <LoadoutChip
            label="Badge"
            value={equippedItems.badge?.name ?? "None"}
            glyph={equippedItems.badge?.glyph}
          />
          <LoadoutChip
            label="Pet"
            value={equippedItems.pet?.name ?? "None"}
            glyph={equippedItems.pet?.glyph}
          />
          <LoadoutChip
            label="Theme"
            value={equippedItems.theme?.name ?? "Default"}
            glyph={equippedItems.theme?.glyph}
          />
        </div>
      </Panel>

      <Panel className="animate-rise-delay-2">
        <SectionHeader
          title="Avatar Shop"
          subtitle="Buy cosmetics with Goal Points, then equip them on your profile"
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary-deep">
              <ShoppingBag className="h-4 w-4" />
              {points.toLocaleString()} pts
            </span>
          }
        />

        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`tactile rounded-full px-3 py-1.5 text-xs font-bold ${
                filter === item
                  ? "bg-ink text-white"
                  : "bg-bg text-ink-soft ring-1 ring-line"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {visibleItems.map((item) => {
            const owned = isOwned(item.id);
            const equipped = isEquipped(item.id);
            const canBuy = !owned && points >= item.cost;
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  equipped
                    ? "border-primary bg-primary-soft/40"
                    : "border-line bg-bg/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface text-2xl shadow-soft"
                    aria-hidden
                  >
                    {item.glyph}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-ink">{item.name}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                          {item.type}
                        </p>
                      </div>
                      {equipped ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          <Check className="h-3 w-3" />
                          Equipped
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink-soft">
                    {owned ? "Owned" : `${item.cost} pts`}
                  </span>
                  <div className="flex gap-2">
                    {owned ? (
                      <button
                        type="button"
                        onClick={() => onEquipToggle(item)}
                        className={`tactile rounded-xl px-3 py-2 text-xs font-bold ${
                          equipped
                            ? "bg-surface text-ink ring-1 ring-line"
                            : "bg-primary text-white"
                        }`}
                      >
                        {equipped ? "Unequip" : "Equip"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => onBuy(item)}
                        className={`tactile inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold ${
                          canBuy
                            ? "bg-primary text-white"
                            : "cursor-not-allowed bg-line text-muted"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {canBuy ? "Buy & equip" : "Not enough pts"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>

      <div className="animate-rise-delay-3">
        <XpHistory />
      </div>

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

function LoadoutChip({
  label,
  value,
  glyph,
}: {
  label: string;
  value: string;
  glyph?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1.5 font-semibold text-ink ring-1 ring-line">
      <span className="text-muted">{label}:</span>
      <span>
        {glyph ? `${glyph} ` : ""}
        {value}
      </span>
    </span>
  );
}
