import { Sparkles } from "lucide-react";
import { MomentumChart } from "@/components/MomentumChart";
import { SpendingPieChart } from "@/components/SpendingPieChart";
import { Panel, ProgressBar, SectionHeader } from "@/components/ui";
import { categories, formatMoney, tipOfDay, user } from "@/lib/data";

export default function HomeDashboard() {
  const topSpend = [...categories].sort((a, b) => b.spent - a.spent)[0];

  return (
    <div className="space-y-5">
      <div className="animate-rise">
        <p className="text-sm font-semibold text-muted">Good afternoon, {user.name.split(" ")[0]}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          Your Hub
        </h1>
      </div>

      <Panel className="animate-rise-delay-1 relative overflow-hidden border-none bg-gradient-to-br from-primary to-sky text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              {tipOfDay.title}
            </div>
            <p className="text-lg font-semibold leading-snug md:text-xl">{tipOfDay.body}</p>
          </div>
          <button className="tactile shrink-0 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-primary-deep shadow-soft">
            {tipOfDay.cta}
          </button>
        </div>
      </Panel>

      <Panel className="animate-rise-delay-2">
        <SectionHeader
          title="Where your money went"
          subtitle={`This month’s top spend is ${topSpend.name} at ${formatMoney(topSpend.spent)}`}
        />
        <SpendingPieChart />
      </Panel>

      <Panel className="animate-rise-delay-3">
        <SectionHeader
          title="Momentum Tracker"
          subtitle="Income vs spending over the last five months"
          action={
            <div className="flex gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-primary">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Income
              </span>
              <span className="inline-flex items-center gap-1.5 text-accent">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Spending
              </span>
            </div>
          }
        />
        <MomentumChart />
      </Panel>

      <Panel className="animate-rise-delay-3">
        <SectionHeader
          title="Category budgets"
          subtitle="Track progress against this month’s limits"
        />
        <div className="space-y-5">
          {categories.map((cat) => {
            const remaining = cat.budget - cat.spent;
            return (
              <div key={cat.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{cat.name}</p>
                    <p className="text-sm text-muted">
                      {formatMoney(cat.spent)} of {formatMoney(cat.budget)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold ${remaining < 80 ? "text-accent" : "text-primary-deep"}`}
                  >
                    {formatMoney(remaining)} left
                  </p>
                </div>
                <ProgressBar value={cat.spent} max={cat.budget} color={cat.color} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
