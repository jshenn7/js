import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { budgetCategories, spendingTrend } from "../data";

export function BudgetDonut() {
  return (
    <div className="chart-block">
      <h3>Budget Distribution</h3>
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={budgetCategories}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="none"
              animationDuration={900}
            >
              {budgetCategories.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <span>July</span>
          <strong>$2.4k</strong>
        </div>
      </div>
    </div>
  );
}

export function SpendingBars() {
  return (
    <div className="chart-block">
      <h3>Monthly Spending Trend</h3>
      <div className="bars-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={spendingTrend} barSize={14}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#7a949b", fontSize: 11, fontFamily: "Manrope" }}
            />
            <YAxis
              width={28}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#7a949b", fontSize: 10, fontFamily: "Manrope" }}
              ticks={[0, 50, 100, 150]}
              domain={[0, 150]}
              tickFormatter={(v) => `$${v}`}
            />
            <Bar dataKey="amount" radius={[8, 8, 4, 4]} animationDuration={900}>
              {spendingTrend.map((entry, index) => (
                <Cell
                  key={entry.month}
                  fill={index === spendingTrend.length - 1 ? "#1f8a8a" : "#7ed0c5"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
