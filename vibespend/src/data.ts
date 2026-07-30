export type TabId = "home" | "community" | "coach" | "profile";

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

export const savingsGoals = [
  { id: "emergency", name: "Emergency Fund", progress: 100, target: "$3,000" },
  { id: "travel", name: "Travel Fund", progress: 42, target: "$1,800" },
  { id: "laptop", name: "New Laptop", progress: 8, target: "$1,200" },
];

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
