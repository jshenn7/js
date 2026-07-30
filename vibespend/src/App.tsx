import { useEffect, useState } from "react";
import { BudgetDonut, SpendingBars } from "./components/Charts";
import {
  AiIcon,
  ChartIcon,
  HomeIcon,
  PlusIcon,
  SparkIcon,
  TransferIcon,
  TrophyIcon,
} from "./components/Icons";
import {
  achievements,
  coachTips,
  quickActions,
  savingsGoals,
  type TabId,
} from "./data";
import "./App.css";

const actionIcons = {
  plus: PlusIcon,
  transfer: TransferIcon,
  trophy: TrophyIcon,
  chart: ChartIcon,
  spark: SparkIcon,
} as const;

function StatusBar() {
  return (
    <div className="status-bar" aria-hidden>
      <strong>9:41</strong>
      <div className="status-icons">
        <span className="sig" />
        <span className="wifi" />
        <span className="batt" />
      </div>
    </div>
  );
}

function HomeDashboard({
  onAction,
  goalsReady,
}: {
  onAction: (id: string) => void;
  goalsReady: boolean;
}) {
  return (
    <div className="panel">
      <div className="brand-row">
        <div className="brand">
          Vibe<span>Spend</span>
        </div>
      </div>
      <p className="greeting">
        Hey Alex, you&apos;re on track and have a new achievement! 🙂
      </p>

      <section className="card charts-row" aria-label="Budget overview">
        <BudgetDonut />
        <SpendingBars />
      </section>

      <section className="card" aria-label="Savings goals">
        <h2 className="section-title">Savings Goals</h2>
        <div className="goals">
          {savingsGoals.map((goal) => (
            <div className="goal-row" key={goal.id}>
              <div className="goal-meta">
                <span>{goal.name}</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="track">
                <div
                  className={`fill${goalsReady ? " ready" : ""}`}
                  style={{
                    width: goalsReady ? `${goal.progress}%` : "0%",
                    background: goal.progress === 0 ? "#d7e1e4" : goal.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="actions" aria-label="Quick actions">
        {quickActions.map((action) => {
          const Icon = actionIcons[action.icon];
          return (
            <div className="action" key={action.id}>
              <button
                className="action-btn"
                style={{ background: action.color }}
                aria-label={action.label}
                onClick={() => onAction(action.id)}
              >
                <Icon size={22} />
              </button>
              <span>{action.label}</span>
            </div>
          );
        })}
      </div>

      <section className="card coach-card" aria-label="AI coach and achievements">
        <div className="coach-row">
          <div className="ai-badge">AI</div>
          <p className="coach-copy">
            <strong>Coach:</strong> Consider reducing dining out to hit your travel
            goal!
          </p>
        </div>
        <div className="divider" />
        <div>
          <div className="achievements-head">
            <h3>Achievements Unlocked</h3>
            <div className="trophy-stack" aria-hidden>
              <span className="trophy">🏆</span>
              <span className="trophy small">🏆</span>
            </div>
          </div>
          <ul className="achievement-list">
            {achievements.map((item) => (
              <li key={item.id}>
                {item.emoji} {item.title}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function CoachPanel() {
  return (
    <div className="panel">
      <h1 className="panel-hero">AI Coach</h1>
      <p className="panel-sub">
        Personalized nudges based on your spending patterns and goals.
      </p>
      <div className="tip-list">
        {coachTips.map((tip) => (
          <article className="tip-item" key={tip}>
            {tip}
          </article>
        ))}
      </div>
    </div>
  );
}

function AskPanel({ onSend }: { onSend: (q: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="panel">
      <h1 className="panel-hero">Ask AI</h1>
      <p className="panel-sub">
        Ask about budgets, transfers, or how to reach your next savings milestone.
      </p>
      <div className="chat-list">
        <article className="chat-bubble">
          <span className="label">You</span>
          <p>How can I fund my travel goal faster?</p>
        </article>
        <article className="chat-bubble">
          <span className="label">VibeSpend AI</span>
          <p>
            Trim dining by about $35/week and auto-transfer that to Travel Fund.
            You&apos;d hit the goal roughly 3 weeks sooner.
          </p>
        </article>
      </div>
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          if (!query.trim()) return;
          onSend(query.trim());
          setQuery("");
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a money question…"
          aria-label="Ask AI"
        />
        <button type="submit">Ask</button>
      </form>
    </div>
  );
}

function AchievementsPanel() {
  return (
    <div className="panel">
      <h1 className="panel-hero">Achievements</h1>
      <p className="panel-sub">Milestones that keep your money habits on track.</p>
      <div className="badge-grid">
        {achievements.map((item) => (
          <article className="badge-card" key={item.id}>
            <div className="badge-emoji">{item.emoji}</div>
            <div>
              <h3>{item.title}</h3>
              <p>Unlocked this week</p>
            </div>
          </article>
        ))}
        <article className="badge-card">
          <div className="badge-emoji">🌱</div>
          <div>
            <h3>Travel Streak</h3>
            <p>42% funded — keep going</p>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabId>("home");
  const [toast, setToast] = useState("");
  const [goalsReady, setGoalsReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setGoalsReady(true), 180);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const handleAction = (id: string) => {
    if (id === "ask") {
      setTab("ask");
      return;
    }
    const labels: Record<string, string> = {
      expense: "Expense form ready",
      transfer: "Transfer started",
      goal: "New goal draft open",
      report: "July report ready",
    };
    showToast(labels[id] ?? "Done");
  };

  return (
    <div className="app-shell">
      <div className="phone" role="application" aria-label="VibeSpend finance app">
        <StatusBar />
        <main className="screen">
          {tab === "home" && (
            <HomeDashboard onAction={handleAction} goalsReady={goalsReady} />
          )}
          {tab === "coach" && <CoachPanel />}
          {tab === "ask" && (
            <AskPanel onSend={(q) => showToast(`Asked: ${q.slice(0, 28)}…`)} />
          )}
          {tab === "achievements" && <AchievementsPanel />}
        </main>

        <div className={`toast${toast ? " show" : ""}`} role="status">
          {toast}
        </div>

        <nav className="bottom-nav" aria-label="Primary">
          <button
            className={`nav-item${tab === "home" ? " active" : ""}`}
            onClick={() => setTab("home")}
          >
            <HomeIcon />
            Home
          </button>
          <button
            className={`nav-item${tab === "coach" ? " active" : ""}`}
            onClick={() => setTab("coach")}
          >
            <AiIcon />
            AI Coach
          </button>
          <button
            className={`nav-item${tab === "ask" ? " active" : ""}`}
            onClick={() => setTab("ask")}
          >
            <SparkIcon />
            Ask AI
          </button>
          <button
            className={`nav-item${tab === "achievements" ? " active" : ""}`}
            onClick={() => setTab("achievements")}
          >
            <TrophyIcon />
            Achievements
          </button>
        </nav>
      </div>
    </div>
  );
}
