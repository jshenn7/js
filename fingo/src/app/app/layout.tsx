import type { ReactNode } from "react";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { CoachWidget } from "@/components/CoachWidget";
import { LogoutButton } from "@/components/LogoutButton";
import { HeaderStats } from "@/components/ProgressUI";
import { GoalPointsCard, ShopShell } from "@/components/ShopShell";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ShopShell>
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-primary-deep">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-sm text-white">
                F
              </span>
              FinGo
            </Link>
            <div className="flex items-center gap-2 text-sm sm:gap-3">
              <HeaderStats />
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 pb-28 md:grid-cols-[220px_1fr] md:px-6 md:pb-8">
          <aside className="hidden md:block">
            <div className="sticky top-20">
              <AppNav />
              <GoalPointsCard />
            </div>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>

        <div className="md:hidden">
          <AppNav />
        </div>

        <CoachWidget />
      </div>
    </ShopShell>
  );
}
