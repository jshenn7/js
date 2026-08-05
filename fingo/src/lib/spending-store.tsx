"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { accountStorageKey, demoAccount } from "@/lib/auth";
import { useAccount } from "@/lib/account-store";
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

const listeners = new Set<() => void>();
let activeEmail: string | null = null;
let memoryState: SpendingState = createDefaultSpendingState({ seeded: true });
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

function defaultFor(email: string | null) {
  return createDefaultSpendingState({
    seeded: email === demoAccount.email,
  });
}

function persist(next: SpendingState) {
  memoryState = next;
  if (typeof window !== "undefined" && activeEmail) {
    window.localStorage.setItem(
      accountStorageKey(SPENDING_STORAGE_KEY, activeEmail),
      JSON.stringify(next),
    );
  }
  emit();
}

function bindAccount(email: string | null) {
  if (typeof window === "undefined") return;
  if (hasHydrated && activeEmail === email) return;
  activeEmail = email;
  if (!email) {
    memoryState = createDefaultSpendingState({ seeded: false });
    hasHydrated = false;
    emit();
    return;
  }
  memoryState =
    parseStored(
      window.localStorage.getItem(accountStorageKey(SPENDING_STORAGE_KEY, email)),
    ) ?? defaultFor(email);
  hasHydrated = true;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getClientSnapshot() {
  return memoryState;
}

function getServerSnapshot() {
  return createDefaultSpendingState({ seeded: true });
}

export function SpendingProvider({ children }: { children: ReactNode }) {
  const { ready: accountReady, user } = useAccount();
  const email = user?.email || null;
  const state = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!accountReady) return;
    bindAccount(email);
  }, [accountReady, email]);

  const addReceipt = useCallback(
    (input: {
      merchant: string;
      amount: number;
      categoryId: CategoryId;
      date?: string;
      note?: string;
    }) => {
      const current = memoryState;
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
    persist(defaultFor(activeEmail));
  }, []);

  const value = useMemo<SpendingContextValue>(
    () => ({
      ready: accountReady && hasHydrated,
      categories: state.categories,
      transactions: state.transactions,
      addReceipt,
      resetSpending,
    }),
    [accountReady, addReceipt, resetSpending, state.categories, state.transactions],
  );

  return <SpendingContext.Provider value={value}>{children}</SpendingContext.Provider>;
}

export function useSpending() {
  const ctx = useContext(SpendingContext);
  if (!ctx) throw new Error("useSpending must be used within SpendingProvider");
  return ctx;
}
