"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categories, formatMoney } from "@/lib/data";

type Slice = {
  id: string;
  name: string;
  value: number;
  color: string;
  percent: number;
};

export function SpendingPieChart() {
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const data = useMemo(() => {
    const total = categories.reduce((sum, cat) => sum + cat.spent, 0) || 1;
    return categories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        value: cat.spent,
        color: cat.color,
        percent: Math.round((cat.spent / total) * 100),
      }))
      .sort((a, b) => b.value - a.value) as Slice[];
  }, []);

  const totalSpent = data.reduce((sum, slice) => sum + slice.value, 0);
  const top = data[0];
  const active = data.find((slice) => slice.id === activeId) ?? top;

  if (!ready) {
    return (
      <div
        className="flex h-64 w-full items-center justify-center rounded-2xl bg-bg/60 text-sm text-muted"
        aria-hidden
      >
        Loading chart…
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <div className="relative h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={3}
              stroke="none"
              onMouseEnter={(_, index) => setActiveId(data[index]?.id ?? null)}
              onMouseLeave={() => setActiveId(null)}
            >
              {data.map((slice) => (
                <Cell
                  key={slice.id}
                  fill={slice.color}
                  opacity={!activeId || activeId === slice.id ? 1 : 0.45}
                  style={{ cursor: "pointer", outline: "none" }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatMoney(Number(value ?? 0))}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #d4e8dc",
                boxShadow: "0 10px 30px rgba(19,38,31,0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Spent</p>
            <p className="text-xl font-extrabold text-ink">{formatMoney(totalSpent)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-bg/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Biggest category</p>
          <p className="mt-1 text-lg font-extrabold text-ink">
            {active?.name} · {active?.percent}%
          </p>
          <p className="text-sm font-semibold text-ink-soft">{formatMoney(active?.value ?? 0)}</p>
        </div>
        <ul className="space-y-2">
          {data.map((slice) => (
            <li key={slice.id}>
              <button
                type="button"
                onMouseEnter={() => setActiveId(slice.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(slice.id)}
                onBlur={() => setActiveId(null)}
                className={`tactile flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                  activeId === slice.id ? "bg-primary-soft/70" : "bg-transparent hover:bg-bg/80"
                }`}
              >
                <span className="inline-flex items-center gap-2 font-semibold text-ink">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: slice.color }}
                    aria-hidden
                  />
                  {slice.name}
                </span>
                <span className="font-bold text-ink-soft">
                  {slice.percent}% · {formatMoney(slice.value)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
