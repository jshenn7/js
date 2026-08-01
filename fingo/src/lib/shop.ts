export type ShopItemType = "Badge" | "Pet" | "Theme";

export type ShopItem = {
  id: string;
  name: string;
  cost: number;
  type: ShopItemType;
  description: string;
  glyph: string;
  ownedByDefault?: boolean;
  theme?: {
    panel: string;
    accent: string;
    text: string;
  };
};

export const shopCatalog: ShopItem[] = [
  {
    id: "s1",
    name: "Leaf Badge",
    cost: 120,
    type: "Badge",
    description: "A fresh growth badge for steady savers.",
    glyph: "🌿",
    ownedByDefault: true,
  },
  {
    id: "s4",
    name: "Streak Flame",
    cost: 200,
    type: "Badge",
    description: "Show off your login streak energy.",
    glyph: "🔥",
  },
  {
    id: "s5",
    name: "Goal Star",
    cost: 260,
    type: "Badge",
    description: "Earned for hitting collaborative targets.",
    glyph: "⭐",
  },
  {
    id: "s2",
    name: "Coin Fox Pet",
    cost: 480,
    type: "Pet",
    description: "A clever fox that guards your Goal Points.",
    glyph: "🦊",
  },
  {
    id: "s6",
    name: "Budget Owl Pet",
    cost: 420,
    type: "Pet",
    description: "Wise company for late-night budgeting.",
    glyph: "🦉",
  },
  {
    id: "s3",
    name: "Sunrise Theme",
    cost: 320,
    type: "Theme",
    description: "Warm gold wash for your profile card.",
    glyph: "🌅",
    theme: {
      panel: "linear-gradient(135deg, #fff3c4 0%, #ffe4db 55%, #ffffff 100%)",
      accent: "#ff6a3d",
      text: "#13261f",
    },
  },
  {
    id: "s7",
    name: "Mint Grove Theme",
    cost: 280,
    type: "Theme",
    description: "Cool mint atmosphere for calm money days.",
    glyph: "🍃",
    theme: {
      panel: "linear-gradient(135deg, #d4f5e6 0%, #d9f1fb 50%, #ffffff 100%)",
      accent: "#0d8a5b",
      text: "#13261f",
    },
  },
  {
    id: "s8",
    name: "Ocean Focus Theme",
    cost: 300,
    type: "Theme",
    description: "Sky-blue profile styling for deep focus.",
    glyph: "🌊",
    theme: {
      panel: "linear-gradient(135deg, #d9f1fb 0%, #e8f5ee 60%, #ffffff 100%)",
      accent: "#3aa8d8",
      text: "#13261f",
    },
  },
];

export type EquippedLoadout = {
  Badge: string | null;
  Pet: string | null;
  Theme: string | null;
};

export type ShopState = {
  points: number;
  owned: string[];
  equipped: EquippedLoadout;
};

export const SHOP_STORAGE_KEY = "fingo-avatar-shop-v1";

export function createDefaultShopState(startingPoints: number): ShopState {
  const owned = shopCatalog.filter((i) => i.ownedByDefault).map((i) => i.id);
  return {
    points: startingPoints,
    owned,
    equipped: {
      Badge: owned.includes("s1") ? "s1" : null,
      Pet: null,
      Theme: null,
    },
  };
}

export function getShopItem(id: string | null | undefined) {
  if (!id) return undefined;
  return shopCatalog.find((item) => item.id === id);
}
