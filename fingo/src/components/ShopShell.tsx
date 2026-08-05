"use client";

import type { ReactNode } from "react";
import { CelebrationOverlay } from "@/components/ProgressUI";
import { AccountProvider } from "@/lib/account-store";
import { ProgressProvider } from "@/lib/progress-store";
import { ShopProvider, useShop } from "@/lib/shop-store";
import { SpendingProvider } from "@/lib/spending-store";

export function ShopShell({ children }: { children: ReactNode }) {
  return (
    <AccountProvider>
      <ProgressProvider>
        <ShopProvider>
          <SpendingProvider>
            {children}
            <CelebrationOverlay />
          </SpendingProvider>
        </ShopProvider>
      </ProgressProvider>
    </AccountProvider>
  );
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
