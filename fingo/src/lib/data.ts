export type BillStatus = "paid" | "pending" | "overdue";

export const user = {
  name: "Alex Rivera",
  handle: "@alexr",
  level: 12,
  streak: 18,
  goalPoints: 2480,
  xp: 720,
  xpToNext: 1000,
  avatarInitials: "AR",
};

export const tipOfDay = {
  title: "Tip of the Day",
  body: "Move $40 from Leisure into your Vacation Fund today — you’ll hit the group goal three days earlier.",
  cta: "Apply tip",
};

export const momentum = [
  { month: "Mar", income: 4200, spending: 3100 },
  { month: "Apr", income: 4350, spending: 2980 },
  { month: "May", income: 4100, spending: 3320 },
  { month: "Jun", income: 4500, spending: 2890 },
  { month: "Jul", income: 4600, spending: 2750 },
];

export const categories = [
  { id: "housing", name: "Housing", spent: 1450, budget: 1500, color: "#3aa8d8" },
  { id: "food", name: "Food", spent: 420, budget: 550, color: "#0d8a5b" },
  { id: "transport", name: "Transport", spent: 260, budget: 320, color: "#f5b800" },
  { id: "subscriptions", name: "Subscriptions", spent: 77, budget: 100, color: "#e85d75" },
  { id: "leisure", name: "Leisure", spent: 210, budget: 300, color: "#ff6a3d" },
  { id: "health", name: "Health", spent: 95, budget: 150, color: "#2bb673" },
];

export const bills = [
  {
    id: "1",
    name: "Rent",
    amount: 1450,
    due: "Aug 1",
    status: "pending" as BillStatus,
    category: "Housing",
  },
  {
    id: "2",
    name: "Netflix",
    amount: 15.99,
    due: "Aug 3",
    status: "paid" as BillStatus,
    category: "Subscription",
    toggle: true,
  },
  {
    id: "3",
    name: "Spotify",
    amount: 11.99,
    due: "Aug 5",
    status: "pending" as BillStatus,
    category: "Subscription",
    toggle: true,
  },
  {
    id: "4",
    name: "Electric",
    amount: 86.4,
    due: "Jul 28",
    status: "overdue" as BillStatus,
    category: "Utilities",
  },
  {
    id: "5",
    name: "Gym",
    amount: 49,
    due: "Aug 8",
    status: "pending" as BillStatus,
    category: "Subscription",
    toggle: true,
  },
];

export const calendarDays = [
  { day: 28, label: "Jul", status: "overdue" as BillStatus, title: "Electric" },
  { day: 1, label: "Aug", status: "pending" as BillStatus, title: "Rent" },
  { day: 3, label: "Aug", status: "paid" as BillStatus, title: "Netflix" },
  { day: 5, label: "Aug", status: "pending" as BillStatus, title: "Spotify" },
  { day: 8, label: "Aug", status: "pending" as BillStatus, title: "Gym" },
];

export const goals = [
  {
    id: "vacation",
    title: "Vacation Fund",
    target: 2400,
    raised: 1680,
    members: [
      { name: "Alex", amount: 720, initials: "AR" },
      { name: "Jordan", amount: 540, initials: "JM" },
      { name: "Sam", amount: 420, initials: "SK" },
    ],
    deadline: "Sep 15",
    emojiTone: "sun",
  },
  {
    id: "wedding",
    title: "Friend Wedding Gift",
    target: 600,
    raised: 380,
    members: [
      { name: "Alex", amount: 150, initials: "AR" },
      { name: "Casey", amount: 230, initials: "CL" },
    ],
    deadline: "Aug 20",
    emojiTone: "accent",
  },
];

export const contributions = [
  { id: "c1", user: "Jordan", action: "added $80 to Vacation Fund", time: "2h ago", cheer: 4 },
  { id: "c2", user: "Sam", action: "hit a 7-day save streak", time: "5h ago", cheer: 9 },
  { id: "c3", user: "Casey", action: "added $40 to Wedding Gift", time: "Yesterday", cheer: 3 },
  { id: "c4", user: "Alex", action: "leveled up to Level 12", time: "Yesterday", cheer: 12 },
];

export const insights = [
  {
    id: "i1",
    title: "Coffee cool-down",
    body: "You’re spending 15% less on coffee this week — that’s $18 headed to Vacation Fund.",
  },
  {
    id: "i2",
    title: "Bill automation",
    body: "Automate Electric before the 28th to protect your streak and avoid late fees.",
  },
  {
    id: "i3",
    title: "Leisure buffer",
    body: "Leisure is 30% under budget. Want to lock $40 into a shared goal?",
  },
];

export const coachStarters = [
  "How can I save $200 this month?",
  "Which subscription should I cut?",
  "Help me set a weekly grocery budget",
];

export const coachReplies: Record<string, string> = {
  default:
    "Looking at your last 30 days, you have about $185 of flexible spend left in Leisure and Food. If you park $40/week into Vacation Fund, you’ll clear the goal before Sep 15 and earn ~120 Goal Points.",
  save: "Great target. Trim $25 from dining out and $15 from delivery apps each week — that lands you at $200 by month-end without touching Housing.",
  subscription:
    "Spotify and Gym overlap with free campus perks you’ve used twice. Pausing Spotify for 2 months saves ~$24 and keeps Netflix for shared movie nights.",
  grocery:
    "Set $95/week for groceries. Batch-cook two dinners and you’ll stay under Food’s remaining $130 while keeping your streak alive.",
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
