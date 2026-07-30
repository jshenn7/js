import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { budgetCategories, recentInsights, revenueVsSpending, spendingTrend } from "../data";

const budgetTotal = budgetCategories.reduce((sum, c) => sum + c.value, 0);
const MONTHLY_SPEND = 2400;

function budgetPercent(value: number) {
  return Math.round((value / budgetTotal) * 100);
}

function renderBudgetLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number;
}) {
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    innerRadius == null ||
    outerRadius == null ||
    value == null
  ) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const pct = budgetPercent(value);

  if (pct < 8) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={800}
      fontFamily="Manrope, sans-serif"
    >
      {pct}%
    </text>
  );
}

export function BudgetDonut() {
  return (
    <div className="chart-block">
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name) => {
                const amount = Math.round((Number(value) / budgetTotal) * MONTHLY_SPEND);
                return [
                  `${budgetPercent(Number(value))}% · $${amount.toLocaleString("en-US")}`,
                  String(name),
                ];
              }}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 8px 20px rgba(22, 68, 78, 0.12)",
                fontFamily: "Manrope, sans-serif",
                fontSize: 12,
                fontWeight: 700,
              }}
            />
            <Pie
              data={budgetCategories}
              dataKey="value"
              nameKey="name"
              innerRadius="54%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
              animationDuration={850}
              label={renderBudgetLabel}
              labelLine={false}
            >
              {budgetCategories.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <span>Spent</span>
          <strong>$2.4k</strong>
        </div>
      </div>
      <ul className="legend detailed">
        {budgetCategories.map((c) => {
          const pct = budgetPercent(c.value);
          const amount = Math.round((c.value / budgetTotal) * MONTHLY_SPEND);
          return (
            <li key={c.name}>
              <i style={{ background: c.color }} />
              <span className="legend-name">{c.name}</span>
              <span className="legend-pct">{pct}%</span>
              <span className="legend-amt">${amount.toLocaleString("en-US")}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SpendingBars() {
  return (
    <div className="chart-block bars-block">
      <div className="bars-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={spendingTrend} barSize={16}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6d858c", fontSize: 11, fontFamily: "Manrope" }}
            />
            <Bar dataKey="amount" radius={[7, 7, 3, 3]} animationDuration={850}>
              {spendingTrend.map((entry, index) => (
                <Cell
                  key={entry.month}
                  fill={index === spendingTrend.length - 1 ? "#1d6f78" : "#8fd0c4"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function moneyTick(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `$${value}`;
}

export function RecentInsightsChart({ compact = false }: { compact?: boolean }) {
  const weekSaved = recentInsights.reduce((sum, d) => sum + d.saved, 0);

  return (
    <div className={`recent-insights${compact ? " compact" : ""}`}>
      <div className="recent-insights-meta">
        <div>
          <span>Saved this week</span>
          <strong>${weekSaved}</strong>
        </div>
        <div className="recent-pill">↑ 12% vs last week</div>
      </div>
      <div className={`recent-wrap${compact ? " short" : ""}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={recentInsights}
            margin={{ top: 6, right: 4, left: compact ? 0 : -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="savedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2a9d8f" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#2a9d8f" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6d858c", fontSize: 10, fontFamily: "Manrope" }}
            />
            {!compact && (
              <YAxis
                axisLine={false}
                tickLine={false}
                width={32}
                tick={{ fill: "#6d858c", fontSize: 10, fontFamily: "Manrope" }}
                tickFormatter={(v) => `$${v}`}
              />
            )}
            <Tooltip
              cursor={{ stroke: "rgba(22,52,60,0.15)", strokeWidth: 1 }}
              formatter={(value, name) => [
                `$${Number(value)}`,
                name === "saved" ? "Saved" : "Spent",
              ]}
              labelStyle={{ fontWeight: 700, color: "#16343c" }}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 8px 20px rgba(22, 68, 78, 0.12)",
                fontFamily: "Manrope, sans-serif",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="saved"
              stroke="#1f6f78"
              strokeWidth={2.4}
              fill="url(#savedFill)"
              animationDuration={850}
            />
            <Area
              type="monotone"
              dataKey="spent"
              stroke="#e07a5f"
              strokeWidth={1.8}
              fill="transparent"
              strokeDasharray="4 3"
              animationDuration={850}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ul className="recent-legend" aria-hidden>
        <li>
          <i className="saved" /> Saved
        </li>
        <li>
          <i className="spent" /> Spent
        </li>
      </ul>
    </div>
  );
}

export function RevenueSpendingBars() {
  const latest = revenueVsSpending[revenueVsSpending.length - 1];
  const net = latest.revenue - latest.spending;

  return (
    <div className="chart-block cashflow-block">
      <div className="cashflow-summary">
        <div>
          <span>Revenue</span>
          <strong>{moneyTick(latest.revenue)}</strong>
        </div>
        <div>
          <span>Spending</span>
          <strong>{moneyTick(latest.spending)}</strong>
        </div>
        <div>
          <span>Net</span>
          <strong className="net">+{moneyTick(net)}</strong>
        </div>
      </div>
      <div className="cashflow-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={revenueVsSpending}
            barGap={4}
            barCategoryGap="28%"
            margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="rgba(22, 52, 60, 0.08)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6d858c", fontSize: 11, fontFamily: "Manrope" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={moneyTick}
              tick={{ fill: "#6d858c", fontSize: 10, fontFamily: "Manrope" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.35)" }}
              formatter={(value, name) => [
                `$${Number(value).toLocaleString("en-US")}`,
                String(name),
              ]}
              labelStyle={{ fontWeight: 700, color: "#16343c" }}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 8px 20px rgba(22, 68, 78, 0.12)",
                fontFamily: "Manrope, sans-serif",
                fontSize: 12,
              }}
            />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="circle"
              wrapperStyle={{ fontSize: 12, fontFamily: "Manrope, sans-serif", fontWeight: 700 }}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#2a9d8f"
              radius={[6, 6, 2, 2]}
              animationDuration={900}
            />
            <Bar
              dataKey="spending"
              name="Spending"
              fill="#e07a5f"
              radius={[6, 6, 2, 2]}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
