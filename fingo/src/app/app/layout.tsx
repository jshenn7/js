import type { ReactNode } from "react";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { user } from "@/lib/data";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-primary-deep">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-sm text-white">
              F
            </span>
            FinGo
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-sun-soft px-3 py-1 font-bold text-[#8a6a00]">
              🔥 {user.streak} day streak
            </span>
            <span className="hidden rounded-full bg-primary-soft px-3 py-1 font-bold text-primary-deep sm:inline">
              Lv {user.level}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 pb-28 md:grid-cols-[220px_1fr] md:px-6 md:pb-8">
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <AppNav />
            <div className="mt-4 rounded-[1.25rem] border border-line bg-surface/90 p-4 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Goal Points</p>
              <p className="mt-1 text-2xl font-extrabold text-ink">{user.goalPoints.toLocaleString()}</p>
              <p className="mt-1 text-sm text-ink-soft">Spend them in the Avatar Shop</p>
            </div>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>

      <div className="md:hidden">
        <AppNav />
      </div>
    </div>
  );
}
