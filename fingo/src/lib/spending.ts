import { categories as seedCategories } from "@/lib/data";

export type CategoryId =
  | "housing"
  | "food"
  | "transport"
  | "subscriptions"
  | "leisure"
  | "health";

export type SpendingCategory = {
  id: CategoryId;
  name: string;
  spent: number;
  budget: number;
  color: string;
};

export type ReceiptTransaction = {
  id: string;
  merchant: string;
  amount: number;
  categoryId: CategoryId;
  date: string;
  note?: string;
  createdAt: string;
};

export type SpendingState = {
  categories: SpendingCategory[];
  transactions: ReceiptTransaction[];
};

export const SPENDING_STORAGE_KEY = "fingo-spending-v1";

export const categoryOptions: Array<{ id: CategoryId; name: string }> = [
  { id: "food", name: "Food" },
  { id: "transport", name: "Transport" },
  { id: "leisure", name: "Leisure" },
  { id: "subscriptions", name: "Subscriptions" },
  { id: "health", name: "Health" },
  { id: "housing", name: "Housing" },
];

export function createDefaultSpendingState(options?: { seeded?: boolean }): SpendingState {
  // Seeded demo numbers only for the demo account; everyone else starts at $0 spent.
  const seeded = Boolean(options?.seeded);
  return {
    categories: seedCategories.map((c) => ({
      id: c.id as CategoryId,
      name: c.name,
      spent: seeded ? c.spent : 0,
      budget: c.budget,
      color: c.color,
    })),
    transactions: [],
  };
}

export type ReceiptParseResult = {
  merchant: string;
  amount: number;
  date: string;
  categoryId: CategoryId;
  categoryName: string;
  confidence: "high" | "medium" | "low";
  rawText?: string;
  note?: string;
};

export function guessCategory(merchant: string, rawCategory?: string): CategoryId {
  const text = `${merchant} ${rawCategory || ""}`.toLowerCase();
  if (/rent|mortgage|apartment|landlord|housing/.test(text)) return "housing";
  if (/uber|lyft|gas|shell|chevron|transit|metro|parking|taxi/.test(text))
    return "transport";
  if (/netflix|spotify|hulu|disney|gym|membership|subscription|prime/.test(text))
    return "subscriptions";
  if (/pharmacy|cvs|walgreens|doctor|dental|health|clinic/.test(text)) return "health";
  if (/cinema|movie|game|steam|concert|bar|club|entertainment|target|mall/.test(text))
    return "leisure";
  if (
    /coffee|cafe|starbucks|restaurant|grocery|market|food|pizza|burger|chipotle|mcdonald|dunkin|whole foods|trader/.test(
      text,
    )
  ) {
    return "food";
  }
  return "food";
}
