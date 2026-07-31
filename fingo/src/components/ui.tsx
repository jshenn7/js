import { ReactNode } from "react";

export function ProgressBar({
  value,
  max,
  color = "var(--primary)",
  className = "",
}: {
  value: number;
  max: number;
  color?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      className={`h-3 overflow-hidden rounded-full bg-line/80 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="animate-bar h-full rounded-full"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function StatusTag({ status }: { status: "paid" | "pending" | "overdue" }) {
  const styles = {
    paid: "bg-primary-soft text-primary-deep",
    pending: "bg-sun-soft text-[#8a6a00]",
    overdue: "bg-danger-soft text-danger",
  } as const;
  const labels = { paid: "Paid", pending: "Pending", overdue: "Overdue" } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.25rem] border border-white/70 bg-surface/90 p-5 shadow-soft backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function Avatar({
  initials,
  size = "md",
  tone = "primary",
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  tone?: "primary" | "accent" | "sky" | "sun";
}) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };
  const tones = {
    primary: "bg-primary text-white",
    accent: "bg-accent text-white",
    sky: "bg-sky text-white",
    sun: "bg-sun text-ink",
  };
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-bold ${sizes[size]} ${tones[tone]}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
