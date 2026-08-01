"use client";

import type { ReactNode } from "react";
import { ShopProvider, useShop } from "@/lib/shop-store";

export function ShopShell({ children }: { children: ReactNode }) {
  return <ShopProvider>{children}</ShopProvider>;
}

export function GoalPointsCard() {
  const { points, ready } = useShop();
  return (
    <div className="mt-4 rounded-[1.25rem] border border-line bg-surface/90 p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Goal Points</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">
        {(ready ? points : points).toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-ink-soft">Spend them in the Avatar Shop</p>
    </div>
  );
}
