"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  createDefaultSpendingState,
  SPENDING_STORAGE_KEY,
  type CategoryId,
  type ReceiptTransaction,
  type SpendingCategory,
  type SpendingState,
} from "@/lib/spending";

type SpendingContextValue = {
  ready: boolean;
  categories: SpendingCategory[];
  transactions: ReceiptTransaction[];
  addReceipt: (input: {
    merchant: string;
    amount: number;
    categoryId: CategoryId;
    date?: string;
    note?: string;
  }) => ReceiptTransaction;
  resetSpending: () => void;
};

const SpendingContext = createContext<SpendingContextValue | null>(null);
const defaultState = createDefaultSpendingState();
const listeners = new Set<() => void>();

let memoryState: SpendingState = defaultState;
let hasHydrated = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function parseStored(raw: string | null): SpendingState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SpendingState>;
    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.transactions)) return null;
    return {
      categories: parsed.categories as SpendingCategory[],
      transactions: parsed.transactions as ReceiptTransaction[],
    };
  } catch {
    return null;
  }
}

function persist(next: SpendingState) {
  memoryState = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SPENDING_STORAGE_KEY, JSON.stringify(next));
  }
  emit();
}

function ensureHydrated() {
  if (hasHydrated || typeof window === "undefined") return;
  memoryState = parseStored(window.localStorage.getItem(SPENDING_STORAGE_KEY)) ?? defaultState;
  hasHydrated = true;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getClientSnapshot() {
  ensureHydrated();
  return memoryState;
}

function getServerSnapshot() {
  return defaultState;
}

export function SpendingProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const addReceipt = useCallback(
    (input: {
      merchant: string;
      amount: number;
      categoryId: CategoryId;
      date?: string;
      note?: string;
    }) => {
      const current = getClientSnapshot();
      const now = new Date();
      const tx: ReceiptTransaction = {
        id: `rx-${now.getTime()}-${current.transactions.length + 1}`,
        merchant: input.merchant.trim() || "Receipt",
        amount: Math.round(input.amount * 100) / 100,
        categoryId: input.categoryId,
        date: input.date || now.toISOString().slice(0, 10),
        note: input.note,
        createdAt: now.toISOString(),
      };

      const categories = current.categories.map((cat) =>
        cat.id === input.categoryId
          ? { ...cat, spent: Math.round((cat.spent + tx.amount) * 100) / 100 }
          : cat,
      );

      persist({
        categories,
        transactions: [tx, ...current.transactions].slice(0, 50),
      });
      return tx;
    },
    [],
  );

  const resetSpending = useCallback(() => {
    persist(createDefaultSpendingState());
  }, []);

  const value = useMemo<SpendingContextValue>(
    () => ({
      ready: hasHydrated || typeof window === "undefined",
      categories: state.categories,
      transactions: state.transactions,
      addReceipt,
      resetSpending,
    }),
    [addReceipt, resetSpending, state.categories, state.transactions],
  );

  return <SpendingContext.Provider value={value}>{children}</SpendingContext.Provider>;
}

export function useSpending() {
  const ctx = useContext(SpendingContext);
  if (!ctx) throw new Error("useSpending must be used within SpendingProvider");
  return ctx;
}
