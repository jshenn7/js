"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Zap } from "lucide-react";
import { Panel, SectionHeader, StatusTag } from "@/components/ui";
import { bills as initialBills, calendarDays, formatMoney } from "@/lib/data";
import { useProgress } from "@/lib/progress-store";

export default function BillsPage() {
  const { recordAction } = useProgress();
  const visited = useRef(false);
  const [subs, setSubs] = useState(
    Object.fromEntries(
      initialBills.filter((b) => b.toggle).map((b) => [b.id, true]),
    ) as Record<string, boolean>,
  );

  // Reviewing bills counts toward the daily quest (server caps the XP).
  useEffect(() => {
    if (visited.current) return;
    visited.current = true;
    void recordAction("bills");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          Bills & Subscriptions
        </h1>
        <p className="mt-1 text-sm text-muted">The Manager — stay ahead of every obligation</p>
      </div>

      <Panel className="animate-rise-delay-1">
        <SectionHeader
          title="Upcoming timeline"
          subtitle="Visual calendar of what’s due next"
        />
        <div className="flex gap-3 overflow-x-auto pb-1">
          {calendarDays.map((day) => (
            <div
              key={`${day.label}-${day.day}-${day.title}`}
              className="min-w-[110px] rounded-2xl border border-line bg-bg/60 p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {day.label}
              </p>
              <p className="mt-1 text-3xl font-extrabold text-ink">{day.day}</p>
              <p className="mt-2 truncate text-sm font-semibold text-ink-soft">{day.title}</p>
              <div className="mt-2">
                <StatusTag status={day.status} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="animate-rise-delay-2">
        <SectionHeader title="All obligations" subtitle="Track recurring costs with quick toggles" />
        <ul className="space-y-3">
          {initialBills.map((bill) => (
            <li
              key={bill.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/80 bg-bg/40 px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ink">{bill.name}</p>
                  <StatusTag status={bill.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  Due {bill.due} · {bill.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-extrabold text-ink">{formatMoney(bill.amount)}</p>
                {bill.toggle ? (
                  <button
                    type="button"
                    aria-pressed={subs[bill.id]}
                    onClick={() =>
                      setSubs((prev) => ({ ...prev, [bill.id]: !prev[bill.id] }))
                    }
                    className={`tactile relative h-7 w-12 rounded-full transition-colors ${
                      subs[bill.id] ? "bg-primary" : "bg-line"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                        subs[bill.id] ? "left-[1.35rem]" : "left-0.5"
                      }`}
                    />
                    <span className="sr-only">Track {bill.name}</span>
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="animate-rise-delay-3 border-none bg-gradient-to-r from-accent-soft to-sun-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-ink">Automate Electric?</p>
              <p className="mt-1 text-sm text-ink-soft">
                AI noticed it’s overdue. Auto-pay from your checking account to protect your streak.
              </p>
            </div>
          </div>
          <button className="tactile inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white">
            <Zap className="h-4 w-4" />
            Set up automation
          </button>
        </div>
      </Panel>
    </div>
  );
}
