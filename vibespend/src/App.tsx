import { useEffect, useState } from "react";
import { BudgetDonut, SpendingBars } from "./components/Charts";
import {
  AiIcon,
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
  spark: SparkIcon,
} as const;

function HomeDashboard({
  onAction,
  goalsReady,
}: {
  onAction: (id: string) => void;
  goalsReady: boolean;
}) {
  return (
    <div className="panel home">
      <header className="hero">
        <p className="brand">
          Mint<span>ly</span>
        </p>
        <h1>
          On track, Alex.
          <br />
          <em>Keep the streak going.</em>
        </h1>
        <p className="lede">A quick pulse on budget, goals, and what to do next.</p>
      </header>

      <div className="actions" aria-label="Quick actions">
        {quickActions.map((action) => {
          const Icon = actionIcons[action.icon];
          return (
            <button
              key={action.id}
              className="action-btn"
              style={{ background: action.color }}
              onClick={() => onAction(action.id)}
            >
              <Icon size={20} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      <section className="section" aria-label="Spending overview">
        <div className="section-head">
          <h2>This month</h2>
          <span>vs last month ↓ 8%</span>
        </div>
        <div className="overview">
          <BudgetDonut />
          <div className="trend">
            <p className="trend-label">Spending trend</p>
            <SpendingBars />
          </div>
        </div>
      </section>

      <section className="section" aria-label="Savings goals">
        <div className="section-head">
          <h2>Goals</h2>
          <span>3 active</span>
        </div>
        <div className="goals">
          {savingsGoals.map((goal) => (
            <div className="goal-row" key={goal.id}>
              <div className="goal-meta">
                <span>{goal.name}</span>
                <span>
                  {goal.progress}% · {goal.target}
                </span>
              </div>
              <div className="track">
                <div
                  className="fill"
                  style={{
                    width: goalsReady ? `${goal.progress}%` : "0%",
                    background:
                      goal.progress >= 100
                        ? "linear-gradient(90deg, #2a9d8f, #57c4a8)"
                        : "linear-gradient(90deg, #3d8ea5, #2a9d8f)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="coach" aria-label="AI coach tip">
        <div className="ai-badge">AI</div>
        <div>
          <p className="coach-kicker">Coach tip</p>
          <p className="coach-copy">
            Ease up on dining out and your travel fund stays on schedule.
          </p>
        </div>
      </section>

      <section className="section wins" aria-label="Recent wins">
        <div className="section-head">
          <h2>Recent wins</h2>
        </div>
        <ul className="win-list">
          {achievements.slice(0, 2).map((item) => (
            <li key={item.id}>
              <span aria-hidden>{item.emoji}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function CoachPanel() {
  return (
    <div className="panel">
      <h1 className="panel-hero">AI Coach</h1>
      <p className="panel-sub">Small nudges from your spending patterns.</p>
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
      <p className="panel-sub">Budgets, transfers, or how to hit the next goal.</p>
      <div className="chat-list">
        <article className="chat-bubble you">
          <span className="label">You</span>
          <p>How do I fund travel faster?</p>
        </article>
        <article className="chat-bubble">
          <span className="label">Coach</span>
          <p>
            Trim dining ~$35/week and auto-send it to Travel. That lands you about
            three weeks sooner.
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
          placeholder="Ask anything about your money…"
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
      <p className="panel-sub">Milestones from your money habits.</p>
      <div className="badge-grid">
        {achievements.map((item) => (
          <article className="badge-row" key={item.id}>
            <div className="badge-emoji" aria-hidden>
              {item.emoji}
            </div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabId>("home");
  const [toast, setToast] = useState("");
  const [goalsReady, setGoalsReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setGoalsReady(true), 160);
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
      expense: "Ready to log an expense",
      transfer: "Transfer started",
      goal: "New goal draft ready",
    };
    showToast(labels[id] ?? "Done");
  };

  return (
    <div className="app-shell">
      <div className="phone" role="application" aria-label="Mintly finance app">
        <div className="glow" aria-hidden />
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
            Coach
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
            Wins
          </button>
        </nav>
      </div>
    </div>
  );
}
