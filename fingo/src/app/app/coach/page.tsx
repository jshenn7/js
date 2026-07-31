"use client";

import { FormEvent, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Panel, SectionHeader } from "@/components/ui";
import { coachReplies, coachStarters, insights } from "@/lib/data";

type Message = { id: string; role: "user" | "coach"; text: string };

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "coach",
      text: "Hey Alex — I’m your FinGo Coach. Ask me about budgets, subscriptions, or shared goals. I’ve already spotted a few wins below.",
    },
  ]);
  const [input, setInput] = useState("");
  const msgId = useRef(1);

  function replyFor(text: string) {
    const lower = text.toLowerCase();
    if (lower.includes("save") || lower.includes("200")) return coachReplies.save;
    if (lower.includes("subscription") || lower.includes("cut"))
      return coachReplies.subscription;
    if (lower.includes("grocery") || lower.includes("food")) return coachReplies.grocery;
    return coachReplies.default;
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userId = `u-${msgId.current++}`;
    const coachId = `c-${msgId.current++}`;
    const userMsg: Message = { id: userId, role: "user", text: trimmed };
    const coachMsg: Message = {
      id: coachId,
      role: "coach",
      text: replyFor(trimmed),
    };
    setMessages((prev) => [...prev, userMsg, coachMsg]);
    setInput("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="space-y-5">
      <div className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">AI Coach</h1>
        <p className="mt-1 text-sm text-muted">The Advisor — conversational insights from your data</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel className="animate-rise-delay-1 flex min-h-[480px] flex-col">
          <SectionHeader
            title="Chat workspace"
            subtitle="Personalized budgeting questions, answered in plain language"
            action={
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-deep">
                <Sparkles className="h-3.5 w-3.5" />
                Online
              </span>
            }
          />

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl bg-bg/50 p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-white"
                    : "bg-surface text-ink shadow-soft"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {coachStarters.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => send(starter)}
                className="tactile rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft"
              >
                {starter}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about spending, goals, or bills…"
              className="min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
            />
            <button
              type="submit"
              className="tactile inline-flex items-center justify-center rounded-2xl bg-primary px-4 text-white"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </Panel>

        <div className="animate-rise-delay-2 space-y-4">
          <SectionHeader title="Insight cards" subtitle="Deep-dives from this week’s habits" />
          {insights.map((insight) => (
            <Panel key={insight.id} className="!p-4">
              <p className="font-bold text-ink">{insight.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{insight.body}</p>
              <button className="tactile mt-3 text-sm font-bold text-primary">
                Turn into a goal →
              </button>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
