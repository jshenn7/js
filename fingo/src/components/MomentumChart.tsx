"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { momentum } from "@/lib/data";

export function MomentumChart() {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={momentum} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d8a5b" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0d8a5b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6a3d" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ff6a3d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#d4e8dc" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6b8578", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6b8578", fontSize: 12 }}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #d4e8dc",
              boxShadow: "0 10px 30px rgba(19,38,31,0.08)",
            }}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#0d8a5b"
            strokeWidth={2.5}
            fill="url(#incomeFill)"
          />
          <Area
            type="monotone"
            dataKey="spending"
            name="Spending"
            stroke="#ff6a3d"
            strokeWidth={2.5}
            fill="url(#spendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
