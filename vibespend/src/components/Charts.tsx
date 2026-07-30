import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { budgetCategories, spendingTrend } from "../data";

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
