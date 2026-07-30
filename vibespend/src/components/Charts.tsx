import {
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
import { budgetCategories, revenueVsSpending, spendingTrend } from "../data";

export function BudgetDonut() {
  return (
    <div className="chart-block">
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={budgetCategories}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={2.5}
              stroke="none"
              animationDuration={850}
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
      <ul className="legend">
        {budgetCategories.map((c) => (
          <li key={c.name}>
            <i style={{ background: c.color }} />
            {c.name}
          </li>
        ))}
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
