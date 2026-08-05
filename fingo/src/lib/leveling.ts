export type ActionKind =
  | "checkin"
  | "receipt"
  | "import"
  | "coach"
  | "bills"
  | "goal"
  | "shop";

export type QuestCadence = "daily" | "weekly";

export type QuestDef = {
  id: string;
  action: ActionKind;
  cadence: QuestCadence;
  label: string;
  emoji: string;
  target: number;
  rewardXp: number;
};

/** Base XP per action, with a per-day cap so actions can't be farmed. */
export const ACTION_XP: Record<ActionKind, { xp: number; label: string; dailyCap: number }> = {
  checkin: { xp: 15, label: "Daily check-in", dailyCap: 1 },
  receipt: { xp: 40, label: "Scanned a receipt", dailyCap: 5 },
  import: { xp: 50, label: "Imported a CSV of transactions", dailyCap: 2 },
  coach: { xp: 20, label: "Coached with FinGo AI", dailyCap: 3 },
  bills: { xp: 10, label: "Reviewed bills", dailyCap: 1 },
  goal: { xp: 30, label: "Boosted a shared goal", dailyCap: 3 },
  shop: { xp: 25, label: "Avatar Shop purchase", dailyCap: 2 },
};

export const QUESTS: QuestDef[] = [
  {
    id: "q_checkin",
    action: "checkin",
    cadence: "daily",
    label: "Open FinGo today",
    emoji: "🌅",
    target: 1,
    rewardXp: 10,
  },
  {
    id: "q_scan",
    action: "receipt",
    cadence: "daily",
    label: "Scan a receipt",
    emoji: "🧾",
    target: 1,
    rewardXp: 40,
  },
  {
    id: "q_import",
    action: "import",
    cadence: "daily",
    label: "Import a CSV of spending",
    emoji: "📄",
    target: 1,
    rewardXp: 35,
  },
  {
    id: "q_coach",
    action: "coach",
    cadence: "daily",
    label: "Ask your coach anything",
    emoji: "🤖",
    target: 1,
    rewardXp: 25,
  },
  {
    id: "q_bills",
    action: "bills",
    cadence: "daily",
    label: "Review your bills",
    emoji: "📅",
    target: 1,
    rewardXp: 15,
  },
  {
    id: "q_goal",
    action: "goal",
    cadence: "daily",
    label: "Contribute to a shared goal",
    emoji: "🤝",
    target: 1,
    rewardXp: 30,
  },
  {
    id: "qw_scan3",
    action: "receipt",
    cadence: "weekly",
    label: "Scan 3 receipts this week",
    emoji: "🔥",
    target: 3,
    rewardXp: 100,
  },
  {
    id: "qw_coach5",
    action: "coach",
    cadence: "weekly",
    label: "Coach chat 5 times this week",
    emoji: "💬",
    target: 5,
    rewardXp: 75,
  },
];

/** XP needed to go from `level` to `level + 1`. */
export function xpForLevel(level: number) {
  return 80 + (level - 1) * 40;
}

export function levelFromXp(totalXp: number) {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
    if (level > 200) break;
  }
  return { level, xpInto: remaining, xpForNext: xpForLevel(level) };
}

export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** ISO-week period key, e.g. "2026-W32". */
export function weekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function periodFor(cadence: QuestCadence, date = new Date()) {
  return cadence === "daily" ? dayKey(date) : weekKey(date);
}

export type QuestStatus = QuestDef & {
  progress: number;
  completed: boolean;
};

export type ProgressSnapshot = {
  totalXp: number;
  level: number;
  xpInto: number;
  xpForNext: number;
  streak: number;
  quests: QuestStatus[];
  recent: Array<{ label: string; xp: number; createdAt: string }>;
};
