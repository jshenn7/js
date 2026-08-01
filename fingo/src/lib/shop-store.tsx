"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
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
const defaultState = createDefaultShopState(user.goalPoints);
const listeners = new Set<() => void>();

let memoryState: ShopState = defaultState;
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

function persist(next: ShopState) {
  memoryState = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(next));
  }
  emit();
}

function ensureHydrated() {
  if (hasHydrated || typeof window === "undefined") return;
  memoryState = parseStoredState(window.localStorage.getItem(SHOP_STORAGE_KEY)) ?? defaultState;
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

function useShopState() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const state = useShopState();
  const owned = useMemo(() => new Set(state.owned), [state.owned]);

  const buy = useCallback((id: string) => {
    const item = getShopItem(id);
    const current = getClientSnapshot();
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
    const current = getClientSnapshot();
    if (!item) return { ok: false, message: "Item not found." };
    if (!current.owned.includes(id)) return { ok: false, message: "Buy this item first." };
    persist({
      ...current,
      equipped: { ...current.equipped, [item.type]: id },
    });
    return { ok: true, message: `Equipped ${item.name}.` };
  }, []);

  const unequip = useCallback((type: ShopItemType) => {
    const current = getClientSnapshot();
    persist({
      ...current,
      equipped: { ...current.equipped, [type]: null },
    });
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      ready: hasHydrated || typeof window === "undefined",
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
    [buy, equip, owned, state.equipped, state.points, unequip],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
