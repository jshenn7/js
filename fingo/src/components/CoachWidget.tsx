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
export function CoachWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const chatRef = useRef<CoachChatHandle>(null);

  useEffect(() => {
    function onOpenCoach(event: Event) {
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

  // The full coach page already has the chat — no need for the widget there.
  if (pathname.startsWith("/app/coach")) return null;

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

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI Coach" : "Open AI Coach"}
        className="tactile fixed bottom-[max(5.25rem,calc(env(safe-area-inset-bottom)+4.5rem))] right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-sky px-4 py-3 font-bold text-white shadow-lift md:bottom-6 md:right-6"
      >
        <Sparkles className="h-5 w-5" />
        <span className="hidden text-sm sm:inline">{open ? "Close" : "AI Coach"}</span>
      </button>
    </>
  );
}
