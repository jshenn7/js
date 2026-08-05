"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { CoachChat, type CoachChatHandle } from "@/components/CoachChat";

/**
 * Floating AI Coach launcher pinned to the corner of every app page.
 * Other components can open it (optionally pre-sending a prompt) via:
 * window.dispatchEvent(new CustomEvent("fingo:open-coach", { detail: { prompt } }))
 */
const DISMISS_KEY = "fingo-coach-widget-dismissed";

export function CoachWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const chatRef = useRef<CoachChatHandle>(null);

  useEffect(() => {
    setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    function onOpenCoach(event: Event) {
      setDismissed(false);
      window.sessionStorage.removeItem(DISMISS_KEY);
      setOpen(true);
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) {
        // Let the panel mount before streaming into it.
        window.setTimeout(() => chatRef.current?.send(prompt), 50);
      }
    }
    window.addEventListener("fingo:open-coach", onOpenCoach);
    return () => window.removeEventListener("fingo:open-coach", onOpenCoach);
  }, []);

  function dismiss() {
    setOpen(false);
    setDismissed(true);
    window.sessionStorage.setItem(DISMISS_KEY, "1");
  }

  // The full coach page already has the chat — no need for the widget there.
  if (pathname.startsWith("/app/coach") || dismissed) return null;

  return (
    <>
      {open ? (
        <div className="fixed bottom-[max(8.75rem,calc(env(safe-area-inset-bottom)+8rem))] right-4 z-50 flex h-[min(32rem,calc(100dvh-12rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-lift md:bottom-24 md:right-6">
          <div className="flex items-center justify-between gap-2 border-b border-line/70 bg-gradient-to-r from-primary to-sky px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/20">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-extrabold leading-tight">FinGo Coach</p>
                <p className="text-[11px] text-white/80">Live AI · grounded in your numbers</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/app/coach"
                onClick={() => setOpen(false)}
                className="rounded-full px-2 py-1 text-[11px] font-bold text-white/90 hover:bg-white/15"
              >
                Full view
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close coach"
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-3">
            <CoachChat ref={chatRef} compact />
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-[max(5.25rem,calc(env(safe-area-inset-bottom)+4.5rem))] right-4 z-50 md:bottom-6 md:right-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close AI Coach" : "Open AI Coach"}
          className="tactile flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-sky px-4 py-3 font-bold text-white shadow-lift"
        >
          <Sparkles className="h-5 w-5" />
          <span className="hidden text-sm sm:inline">{open ? "Close" : "AI Coach"}</span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide AI Coach button"
          title="Hide AI Coach button"
          className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border border-line bg-surface text-ink-soft shadow-soft hover:bg-danger-soft hover:text-danger"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}
