export type TabId = "home" | "goals" | "insights" | "coach" | "profile";

export type Goal = {
  id: string;
  name: string;
  progress: number;
  target: string;
  targetAmount: number;
  savedAmount: number;
};

export const profile = {
  name: "Alex Rivera",
  handle: "@alexr",
  level: 12,
  xp: 340,
  xpToNext: 500,
  city: "Austin",
  joined: "Mar 2025",
  totalSaved: "$4,280",
  budgetsHit: 18,
};

export const streak = {
  current: 14,
  best: 21,
  checkedInToday: true,
  week: [
    { day: "M", done: true },
    { day: "T", done: true },
    { day: "W", done: true },
    { day: "T", done: true },
    { day: "F", done: true },
    { day: "S", done: true },
    { day: "S", done: false },
  ],
};

export const budgetCategories = [
  { name: "Housing", value: 34, color: "#e07a5f" },
  { name: "Food", value: 20, color: "#f2cc8f" },
  { name: "Transit", value: 12, color: "#81b29a" },
  { name: "Fun", value: 18, color: "#3d8ea5" },
  { name: "Save", value: 16, color: "#2a9d8f" },
];

export const spendingTrend = [
  { month: "Jun", amount: 118 },
  { month: "Jul", amount: 96 },
  { month: "Aug", amount: 142 },
  { month: "Sep", amount: 108 },
  { month: "Oct", amount: 88 },
];

export const revenueVsSpending = [
  { month: "Jun", revenue: 4200, spending: 3180 },
  { month: "Jul", revenue: 4350, spending: 2960 },
  { month: "Aug", revenue: 4100, spending: 3520 },
  { month: "Sep", revenue: 4480, spending: 3080 },
  { month: "Oct", revenue: 4600, spending: 2840 },
];

export const topSpending = [
  { name: "Rent · Oak Street", amount: 1450, share: "51%" },
  { name: "Groceries · FreshMart", amount: 312, share: "11%" },
  { name: "Dining · local spots", amount: 248, share: "9%" },
  { name: "Transit · Metro pass", amount: 96, share: "3%" },
  { name: "Subscriptions", amount: 74, share: "3%" },
];

export const topIncome = [
  { name: "Payroll · Northwind Co", amount: 3900, share: "85%" },
  { name: "Freelance · design gig", amount: 420, share: "9%" },
  { name: "Interest · HYSA", amount: 48, share: "1%" },
  { name: "Refund · Marketplace", amount: 36, share: "1%" },
];

/** Daily net saved over the last week — used for the short recent-insights graph. */
export const recentInsights = [
  { day: "Mon", saved: 42, spent: 68 },
  { day: "Tue", saved: 55, spent: 51 },
  { day: "Wed", saved: 28, spent: 74 },
  { day: "Thu", saved: 61, spent: 49 },
  { day: "Fri", saved: 38, spent: 82 },
  { day: "Sat", saved: 72, spent: 40 },
  { day: "Sun", saved: 48, spent: 45 },
];

export const savingsGoals: Goal[] = [
  {
    id: "emergency",
    name: "Emergency Fund",
    progress: 100,
    target: "$3,000",
    targetAmount: 3000,
    savedAmount: 3000,
  },
  {
    id: "travel",
    name: "Travel Fund",
    progress: 42,
    target: "$1,800",
    targetAmount: 1800,
    savedAmount: 756,
  },
  {
    id: "laptop",
    name: "New Laptop",
    progress: 8,
    target: "$1,200",
    targetAmount: 1200,
    savedAmount: 96,
  },
];

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildGoal(name: string, targetAmount: number, savedAmount = 0): Goal {
  const safeTarget = Math.max(1, Math.round(targetAmount));
  const safeSaved = Math.max(0, Math.min(safeTarget, Math.round(savedAmount)));
  const progress = Math.round((safeSaved / safeTarget) * 100);
  return {
    id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    progress,
    target: formatMoney(safeTarget),
    targetAmount: safeTarget,
    savedAmount: safeSaved,
  };
}

export const quickActions = [
  { id: "expense", label: "Add", color: "#3d8ea5", icon: "plus" as const },
  { id: "transfer", label: "Move", color: "#2a9d8f", icon: "transfer" as const },
  { id: "goal", label: "Goal", color: "#e07a5f", icon: "trophy" as const },
  { id: "ask", label: "Ask AI", color: "#1d4e56", icon: "spark" as const },
];

export const achievements = [
  { id: "budget-master", title: "Budget Master", detail: "5 weeks on track", emoji: "🔥" },
  { id: "emergency-starter", title: "Safety Net", detail: "Emergency fund complete", emoji: "🏅" },
  { id: "travel-streak", title: "Travel Streak", detail: "42% funded", emoji: "✈️" },
  { id: "no-spend", title: "No-Spend Sunday", detail: "Kept the streak alive", emoji: "🧊" },
];

export const coachTips = [
  "Cut dining out a bit this week and your travel goal stays in reach.",
  "Transit is under budget — nice cushion for the laptop fund.",
  "Try an auto-transfer of $40 into Travel every Friday.",
];

export const communityFeed = [
  {
    id: "1",
    name: "Jordan",
    initials: "JO",
    color: "#3d8ea5",
    action: "saved $62 this week by packing lunch instead of takeout",
    time: "2h ago",
    cheers: 12,
  },
  {
    id: "2",
    name: "Sam",
    initials: "SA",
    color: "#2a9d8f",
    action: "hit a 30-day budget streak — skipped 4 impulse buys",
    time: "5h ago",
    cheers: 28,
  },
  {
    id: "3",
    name: "Riley",
    initials: "RI",
    color: "#e07a5f",
    action: "moved $120 into Travel by canceling an unused subscription",
    time: "Yesterday",
    cheers: 19,
  },
  {
    id: "4",
    name: "Casey",
    initials: "CA",
    color: "#81b29a",
    action: "saved $45 this week biking to work twice",
    time: "Yesterday",
    cheers: 9,
  },
  {
    id: "5",
    name: "Morgan",
    initials: "MO",
    color: "#1d6f78",
    action: "finished their Emergency Fund goal — celebrating with a free park day",
    time: "2d ago",
    cheers: 41,
  },
];

export const leaderboard = [
  { name: "Sam", streak: 30, saved: "$210" },
  { name: "You", streak: 14, saved: "$186" },
  { name: "Jordan", streak: 12, saved: "$148" },
  { name: "Riley", streak: 9, saved: "$120" },
];
