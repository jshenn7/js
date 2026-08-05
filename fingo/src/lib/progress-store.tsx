"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ActionKind, ProgressSnapshot } from "@/lib/leveling";

type CompletedQuest = { id: string; label: string; emoji: string; rewardXp: number };

type ProgressResponse = {
  snapshot?: ProgressSnapshot;
  awardedXp?: number;
  completedQuests?: CompletedQuest[];
  levelUp?: boolean;
};

export type Celebration =
  | { type: "levelup"; level: number }
  | { type: "quest"; quest: CompletedQuest }
  | { type: "xp"; amount: number };

type ProgressContextValue = {
  ready: boolean;
  snapshot: ProgressSnapshot | null;
  celebration: Celebration | null;
  dismissCelebration: () => void;
  recordAction: (
    action: ActionKind,
    extra?: {
      transaction?: {
        id?: string;
        merchant?: string;
        amount?: number;
        categoryId?: string;
        date?: string;
        note?: string;
      };
      itemId?: string;
    },
  ) => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const queue = useRef<Celebration[]>([]);
  const timer = useRef<number | null>(null);

  const showNext = useCallback(() => {
    const next = queue.current.shift() || null;
    setCelebration(next);
    if (timer.current) window.clearTimeout(timer.current);
    if (next) {
      timer.current = window.setTimeout(showNext, next.type === "levelup" ? 3600 : 2400);
    }
  }, []);

  const enqueue = useCallback(
    (items: Celebration[]) => {
      if (!items.length) return;
      queue.current.push(...items);
      if (!celebration) showNext();
    },
    [celebration, showNext],
  );

  const ingest = useCallback(
    (data: ProgressResponse, options?: { celebrateXp?: boolean }) => {
      if (data.snapshot) {
        setSnapshot(data.snapshot);
      }
      const items: Celebration[] = [];
      if (data.levelUp && data.snapshot) {
        items.push({ type: "levelup", level: data.snapshot.level });
      }
      for (const quest of data.completedQuests || []) {
        items.push({ type: "quest", quest });
      }
      if (
        options?.celebrateXp &&
        !items.length &&
        data.awardedXp &&
        data.awardedXp > 0
      ) {
        items.push({ type: "xp", amount: data.awardedXp });
      }
      enqueue(items);
    },
    [enqueue],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/progress");
        if (!res.ok) return;
        const data = (await res.json()) as ProgressResponse;
        if (!cancelled) ingest(data);
      } catch {
        // offline — header falls back to defaults
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recordAction = useCallback<ProgressContextValue["recordAction"]>(
    async (action, extra) => {
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...extra }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as ProgressResponse;
        ingest(data, { celebrateXp: true });
      } catch {
        // XP sync is best-effort
      }
    },
    [ingest],
  );

  return (
    <ProgressContext.Provider
      value={{
        ready,
        snapshot,
        celebration,
        dismissCelebration: showNext,
        recordAction,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
