"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarClock, Camera, Users, UserRound, Sparkles } from "lucide-react";

const links = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/scan", label: "Add", icon: Camera },
  { href: "/app/bills", label: "Bills", icon: CalendarClock },
  { href: "/app/goals", label: "Goals", icon: Users },
  { href: "/app/coach", label: "Coach", icon: Sparkles },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-surface/95 px-1.5 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 shadow-lift backdrop-blur-md md:static md:rounded-[1.25rem] md:border md:border-line md:px-2 md:shadow-soft"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 md:max-w-none md:flex-col md:gap-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/app" ? pathname === "/app" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                className={`tactile flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold md:flex-row md:justify-start md:gap-3 md:px-4 md:py-3 md:text-sm ${
                  active
                    ? "bg-primary text-white shadow-soft"
                    : "text-ink-soft hover:bg-primary-soft/70"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
