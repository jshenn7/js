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
import { user } from "@/lib/data";
import {
  createDefaultShopState,
  getShopItem,
  SHOP_STORAGE_KEY,
  shopCatalog,
  type EquippedLoadout,
  type ShopItem,
  type ShopItemType,
  type ShopState,
} from "@/lib/shop";

type ShopContextValue = {
  ready: boolean;
  points: number;
  owned: Set<string>;
  equipped: EquippedLoadout;
  catalog: ShopItem[];
  buy: (id: string) => { ok: boolean; message: string };
  equip: (id: string) => { ok: boolean; message: string };
  unequip: (type: ShopItemType) => void;
  isOwned: (id: string) => boolean;
  isEquipped: (id: string) => boolean;
  equippedItems: {
    badge?: ShopItem;
    pet?: ShopItem;
    theme?: ShopItem;
  };
};

const ShopContext = createContext<ShopContextValue | null>(null);
const listeners = new Set<() => void>();

let activeEmail: string | null = null;
let memoryState: ShopState = createDefaultShopState(user.goalPoints);
let hasHydrated = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function parseStoredState(raw: string | null): ShopState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ShopState>;
    if (
      typeof parsed.points !== "number" ||
      !Array.isArray(parsed.owned) ||
      !parsed.equipped
    ) {
      return null;
    }
    return {
      points: parsed.points,
      owned: parsed.owned.filter((id) => shopCatalog.some((item) => item.id === id)),
      equipped: {
        Badge: parsed.equipped.Badge ?? null,
        Pet: parsed.equipped.Pet ?? null,
        Theme: parsed.equipped.Theme ?? null,
      },
    };
  } catch {
    return null;
  }
}

function defaultFor(email: string | null): ShopState {
  // Demo account starts with the published Goal Points balance; new accounts start leaner.
  const points = email === demoAccount.email ? user.goalPoints : 400;
  return createDefaultShopState(points);
}

function persist(next: ShopState) {
  memoryState = next;
  if (typeof window !== "undefined" && activeEmail) {
    window.localStorage.setItem(
      accountStorageKey(SHOP_STORAGE_KEY, activeEmail),
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
    memoryState = createDefaultShopState(0);
    hasHydrated = false;
    emit();
    return;
  }
  memoryState =
    parseStoredState(
      window.localStorage.getItem(accountStorageKey(SHOP_STORAGE_KEY, email)),
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
  return createDefaultShopState(user.goalPoints);
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { ready: accountReady, user: account } = useAccount();
  const email = account?.email || null;
  const state = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const owned = useMemo(() => new Set(state.owned), [state.owned]);

  useEffect(() => {
    if (!accountReady) return;
    bindAccount(email);
  }, [accountReady, email]);

  const buy = useCallback((id: string) => {
    const item = getShopItem(id);
    const current = memoryState;
    const ownedNow = new Set(current.owned);
    if (!item) return { ok: false, message: "Item not found." };
    if (ownedNow.has(id)) return { ok: false, message: "You already own this." };
    if (current.points < item.cost) {
      return { ok: false, message: `Need ${item.cost - current.points} more points.` };
    }

    persist({
      points: current.points - item.cost,
      owned: [...current.owned, id],
      equipped: { ...current.equipped, [item.type]: id },
    });
    return { ok: true, message: `Bought and equipped ${item.name}.` };
  }, []);

  const equip = useCallback((id: string) => {
    const item = getShopItem(id);
    const current = memoryState;
    if (!item) return { ok: false, message: "Item not found." };
    if (!current.owned.includes(id)) return { ok: false, message: "Buy this item first." };
    persist({
      ...current,
      equipped: { ...current.equipped, [item.type]: id },
    });
    return { ok: true, message: `Equipped ${item.name}.` };
  }, []);

  const unequip = useCallback((type: ShopItemType) => {
    const current = memoryState;
    persist({
      ...current,
      equipped: { ...current.equipped, [type]: null },
    });
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      ready: accountReady && hasHydrated,
      points: state.points,
      owned,
      equipped: state.equipped,
      catalog: shopCatalog,
      buy,
      equip,
      unequip,
      isOwned: (id: string) => owned.has(id),
      isEquipped: (id: string) =>
        state.equipped.Badge === id ||
        state.equipped.Pet === id ||
        state.equipped.Theme === id,
      equippedItems: {
        badge: getShopItem(state.equipped.Badge),
        pet: getShopItem(state.equipped.Pet),
        theme: getShopItem(state.equipped.Theme),
      },
    }),
    [accountReady, buy, equip, owned, state.equipped, state.points, unequip],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
