"use client";

import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { CoachChat, type CoachChatHandle } from "@/components/CoachChat";
import { Panel, SectionHeader } from "@/components/ui";
import { insights } from "@/lib/data";

export default function CoachPage() {
  const chatRef = useRef<CoachChatHandle>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-5">
      <div className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">AI Coach</h1>
        <p className="mt-1 text-sm text-muted">
          The Advisor — live answers grounded in your FinGo spending data
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel className="animate-rise-delay-1 flex min-h-[480px] flex-col">
          <SectionHeader
            title="Chat workspace"
            subtitle="Ask anything about budgets, bills, subscriptions, or goals"
            action={
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-deep">
                <Sparkles className="h-3.5 w-3.5" />
                {busy ? "Thinking…" : "Live AI"}
              </span>
            }
          />
          <CoachChat ref={chatRef} onBusyChange={setBusy} />
        </Panel>

        <div className="animate-rise-delay-2 space-y-4">
          <SectionHeader title="Insight cards" subtitle="Deep-dives from this week’s habits" />
          {insights.map((insight) => (
            <Panel key={insight.id} className="!p-4">
              <p className="font-bold text-ink">{insight.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{insight.body}</p>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  chatRef.current?.send(
                    `Help me act on this insight: ${insight.title}. ${insight.body}`,
                  )
                }
                className="tactile mt-3 text-sm font-bold text-primary disabled:opacity-50"
              >
                Ask coach about this →
              </button>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
