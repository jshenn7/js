import {
  bills,
  categories,
  formatMoney,
  goals,
  momentum,
  tipOfDay,
  user,
} from "@/lib/data";

export function buildCoachSystemPrompt() {
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
  const flexibleLeft = categories
    .filter((c) => ["food", "leisure", "transport", "subscriptions", "health"].includes(c.id))
    .reduce((sum, c) => sum + Math.max(0, c.budget - c.spent), 0);

  const categoryLines = categories
    .map(
      (c) =>
        `- ${c.name}: spent ${formatMoney(c.spent)} of ${formatMoney(c.budget)} (${formatMoney(c.budget - c.spent)} left)`,
    )
    .join("\n");

  const billLines = bills
    .map((b) => `- ${b.name}: ${formatMoney(b.amount)}, due ${b.due}, status ${b.status}`)
    .join("\n");

  const goalLines = goals
    .map((g) => {
      const pct = Math.round((g.raised / g.target) * 100);
      return `- ${g.title}: ${formatMoney(g.raised)} / ${formatMoney(g.target)} (${pct}%), deadline ${g.deadline}`;
    })
    .join("\n");

  const latest = momentum[momentum.length - 1];

  return `You are FinGo Coach, a friendly, practical personal-finance advisor inside the FinGo app.
Speak like a supportive coach for Gen Z / millennials — clear, warm, and specific.
Always ground advice in the user's real FinGo numbers below. Use dollar amounts.
Keep replies concise: usually 2–5 short paragraphs or tight bullet points.
Do not invent transactions that aren't in the snapshot. If something is unknown, say so and suggest the next best step.
Never give legal/tax advice; stay focused on budgeting, bills, subscriptions, and savings goals.

USER PROFILE
- Name: ${user.name}
- Level: ${user.level}
- Streak: ${user.streak} days
- Goal Points: ${user.goalPoints}

TIP OF THE DAY
${tipOfDay.body}

THIS MONTH SPENDING
- Total spent: ${formatMoney(totalSpent)} of ${formatMoney(totalBudget)} budgeted
- Flexible room left (non-housing): about ${formatMoney(flexibleLeft)}
Categories:
${categoryLines}

BILLS & SUBSCRIPTIONS
${billLines}

COLLABORATIVE GOALS
${goalLines}

RECENT MOMENTUM
- Latest month (${latest.month}): income ${formatMoney(latest.income)}, spending ${formatMoney(latest.spending)}
`;
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
