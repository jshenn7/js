export type TabId = "home" | "coach" | "ask" | "achievements";

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
];

export const coachTips = [
  "Cut dining out a bit this week and your travel goal stays in reach.",
  "Transit is under budget — nice cushion for the laptop fund.",
  "Try an auto-transfer of $40 into Travel every Friday.",
];
