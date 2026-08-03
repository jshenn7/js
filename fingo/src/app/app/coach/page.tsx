"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { LoaderCircle, Send, Sparkles } from "lucide-react";
import { Panel, SectionHeader } from "@/components/ui";
import { coachStarters, insights } from "@/lib/data";

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const msgId = useRef(1);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userId = `u-${msgId.current++}`;
    const coachId = `c-${msgId.current++}`;
    const history = [...messages, { id: userId, role: "user" as const, text: trimmed }];

    setMessages([...history, { id: coachId, role: "coach", text: "" }]);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== "m0")
            .map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.text,
            })),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Coach request failed (${res.status})`);
      }

      if (!res.body) throw new Error("No response stream from coach.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part
            .split("\n")
            .map((l) => l.trim())
            .find((l) => l.startsWith("data:"));
          if (!line) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload) as { content?: string };
            if (!json.content) continue;
            full += json.content;
            const snapshot = full;
            setMessages((prev) =>
              prev.map((m) => (m.id === coachId ? { ...m, text: snapshot } : m)),
            );
          } catch {
            // ignore malformed chunks
          }
        }
      }

      if (!full.trim()) {
        throw new Error("The coach returned an empty reply. Try again.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === coachId
            ? {
                ...m,
                text: "I couldn’t reach the AI model just now. Check that Ollama is running, then try again.",
              }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

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

          <div
            ref={scrollerRef}
            className="flex max-h-[420px] flex-1 flex-col gap-3 overflow-y-auto rounded-2xl bg-bg/50 p-3"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-white"
                    : "bg-surface text-ink shadow-soft"
                }`}
              >
                {m.text || (
                  <span className="inline-flex items-center gap-2 text-muted">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Coaching…
                  </span>
                )}
              </div>
            ))}
          </div>

          {error ? (
            <p className="mt-3 rounded-2xl bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">
              {error}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {coachStarters.map((starter) => (
              <button
                key={starter}
                type="button"
                disabled={busy}
                onClick={() => void send(starter)}
                className="tactile rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              placeholder="Ask about spending, goals, or bills…"
              className="min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="tactile inline-flex items-center justify-center rounded-2xl bg-primary px-4 text-white disabled:opacity-50"
              aria-label="Send message"
            >
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
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
                  void send(`Help me act on this insight: ${insight.title}. ${insight.body}`)
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
