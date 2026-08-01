"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={loading}
      className="tactile inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-ink-soft ring-1 ring-line disabled:opacity-70"
      aria-label="Log out"
    >
      <LogOut className="h-3.5 w-3.5" />
      {loading ? "…" : "Log out"}
    </button>
  );
}
