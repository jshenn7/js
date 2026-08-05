"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, LoaderCircle, MessageCircleQuestion, Sparkles } from "lucide-react";
import { MomentumChart } from "@/components/MomentumChart";
import { SpendingPieChart } from "@/components/SpendingPieChart";
import { Panel, ProgressBar, SectionHeader } from "@/components/ui";
import { formatMoney, tipOfDay, user } from "@/lib/data";
import { loadProfile } from "@/lib/profile";
import { useSpending } from "@/lib/spending-store";

type Tip = { title: string; body: string; source: "ai" | "static" };

export default function HomeDashboard() {
  const { categories, transactions } = useSpending();
  const topSpend = [...categories].sort((a, b) => b.spent - a.spent)[0];
  const latestReceipt = transactions[0];

  const [firstName, setFirstName] = useState(user.name.split(" ")[0]);
  useEffect(() => {
    const profile = loadProfile();
    if (profile?.name) setFirstName(profile.name.split(/\s+/)[0]);
  }, []);

  const [tip, setTip] = useState<Tip>({ ...tipOfDay, source: "static" });
  const [tipLoading, setTipLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms);
        controller.signal.addEventListener("abort", () => {
          window.clearTimeout(id);
          resolve();
        });
      });

    async function fetchTip(): Promise<Tip | null> {
      try {
        const res = await fetch("/api/coach/tip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            categories: categories.map((c) => ({
              name: c.name,
              spent: c.spent,
              budget: c.budget,
            })),
            recent: transactions.slice(0, 5).map((t) => ({
              merchant: t.merchant,
              amount: t.amount,
              date: t.date,
            })),
            profile: loadProfile() || undefined,
          }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { tip?: Tip };
        return data.tip?.body ? data.tip : null;
      } catch {
        return null;
      }
    }

    // The first attempt can catch the model mid-load; retry a couple of
    // times before settling for the static tip.
    async function loadTip() {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (controller.signal.aborted) return;
        const result = await fetchTip();
        if (result?.source === "ai") {
          setTip(result);
          setTipLoading(false);
          return;
        }
        if (result) setTip(result);
        await sleep(8000);
      }
      if (!controller.signal.aborted) setTipLoading(false);
    }

    void loadTip();
    return () => controller.abort();
    // Fetch once on mount with whatever spending data is loaded by then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="animate-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">
            Good afternoon, {firstName}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Your Hub
          </h1>
        </div>
        <Link
          href="/app/scan"
          className="tactile inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft"
        >
          <Camera className="h-4 w-4" />
          Scan receipt
        </Link>
      </div>

      <Panel className="animate-rise-delay-1 relative overflow-hidden border-none bg-gradient-to-br from-primary to-sky text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {tipLoading ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {tip.source === "ai" ? "Live coach tip" : tip.title}
            </div>
            <p className="text-lg font-semibold leading-snug md:text-xl">{tip.body}</p>
            {latestReceipt ? (
              <p className="mt-3 text-sm text-white/85">
                Latest scan: {latestReceipt.merchant} · {formatMoney(latestReceipt.amount)}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("fingo:open-coach", {
                    detail: { prompt: `Tell me more about this tip and how to act on it: ${tip.body}` },
                  }),
                )
              }
              className="tactile inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-primary-deep shadow-soft"
            >
              <MessageCircleQuestion className="h-4 w-4" />
              Ask the coach
            </button>
            <Link
              href="/app/scan"
              className="tactile rounded-2xl bg-white/15 px-4 py-2 text-center text-xs font-bold text-white ring-1 ring-white/30"
            >
              Add from photo
            </Link>
          </div>
        </div>
      </Panel>

      <Panel className="animate-rise-delay-2">
        <SectionHeader
          title="Where your money went"
          subtitle={`This month’s top spend is ${topSpend.name} at ${formatMoney(topSpend.spent)}`}
        />
        <SpendingPieChart categories={categories} />
      </Panel>

      <Panel className="animate-rise-delay-3">
        <SectionHeader
          title="Momentum Tracker"
          subtitle="Income vs spending over the last five months"
          action={
            <div className="flex gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-primary">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Income
              </span>
              <span className="inline-flex items-center gap-1.5 text-accent">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Spending
              </span>
            </div>
          }
        />
        <MomentumChart />
      </Panel>

      <Panel className="animate-rise-delay-3">
        <SectionHeader
          title="Category budgets"
          subtitle="Updates instantly when you scan a receipt"
        />
        <div className="space-y-5">
          {categories.map((cat) => {
            const remaining = cat.budget - cat.spent;
            return (
              <div key={cat.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{cat.name}</p>
                    <p className="text-sm text-muted">
                      {formatMoney(cat.spent)} of {formatMoney(cat.budget)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold ${remaining < 80 ? "text-accent" : "text-primary-deep"}`}
                  >
                    {formatMoney(remaining)} left
                  </p>
                </div>
                <ProgressBar value={cat.spent} max={cat.budget} color={cat.color} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
