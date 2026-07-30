export type TabId = "home" | "coach" | "ask" | "achievements";

export const budgetCategories = [
  { name: "Housing", value: 32, color: "#e86a5c" },
  { name: "Food", value: 22, color: "#e8b84a" },
  { name: "Transport", value: 14, color: "#8b6bb8" },
  { name: "Fun", value: 18, color: "#3aa0d8" },
  { name: "Savings", value: 14, color: "#3cb89a" },
];

export const spendingTrend = [
  { month: "Jun", amount: 118 },
  { month: "Jul", amount: 96 },
  { month: "Aug", amount: 142 },
  { month: "Sep", amount: 108 },
  { month: "Oct", amount: 88 },
];

export const savingsGoals = [
  { id: "emergency", name: "Emergency Fund", progress: 100, color: "#3cb89a" },
  { id: "travel", name: "Travel Fund", progress: 42, color: "#3cb89a" },
  { id: "laptop", name: "New Laptop", progress: 0, color: "#3cb89a" },
];

export const quickActions = [
  { id: "expense", label: "Add Expense", color: "#3aa0d8", icon: "plus" as const },
  { id: "transfer", label: "Transfer", color: "#3cb89a", icon: "transfer" as const },
  { id: "goal", label: "New Goal", color: "#8b6bb8", icon: "trophy" as const },
  { id: "report", label: "Report", color: "#c45c6a", icon: "chart" as const },
  { id: "ask", label: "Ask AI", color: "#176b72", icon: "spark" as const },
];

export const achievements = [
  { id: "budget-master", title: "Budget Master (5 weeks on track)", emoji: "🔥" },
  { id: "emergency-starter", title: "Emergency Fund Starter", emoji: "🏅" },
];

export const coachTips = [
  "Consider reducing dining out to hit your travel goal!",
  "You're under budget on transport this month — nice work.",
  "Move $40 from Fun into Travel Fund to stay on pace.",
];
