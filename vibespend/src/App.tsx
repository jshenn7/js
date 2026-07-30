import { useEffect, useState } from "react";
import { BudgetDonut, SpendingBars } from "./components/Charts";
import {
  ChartIcon,
  FlameIcon,
  HomeIcon,
  PlusIcon,
  ProfileIcon,
  SparkIcon,
  TargetIcon,
  TransferIcon,
  TrophyIcon,
} from "./components/Icons";
import {
  achievements,
  coachTips,
  communityFeed,
  leaderboard,
  profile,
  quickActions,
  savingsGoals,
  streak,
  type TabId,
} from "./data";
import "./App.css";

const actionIcons = {
  plus: PlusIcon,
  transfer: TransferIcon,
  trophy: TrophyIcon,
  spark: SparkIcon,
} as const;

function StreakStrip({
  onCheckIn,
  checkedIn,
}: {
  onCheckIn: () => void;
  checkedIn: boolean;
}) {
  return (
    <section className="streak-strip" aria-label="Savings streak">
      <div className="streak-main">
        <div className={`streak-flame${checkedIn ? " lit" : ""}`} aria-hidden>
          <FlameIcon size={24} />
        </div>
        <div>
          <p className="streak-count">
            <strong>{streak.current}</strong> day streak
          </p>
          <p className="streak-sub">Best: {streak.best} days · check in daily</p>
        </div>
        <button className="checkin-btn" onClick={onCheckIn} disabled={checkedIn}>
          {checkedIn ? "Done" : "Check in"}
        </button>
      </div>
      <ul className="streak-week">
        {streak.week.map((d, i) => (
          <li key={`${d.day}-${i}`} className={d.done || (i === 6 && checkedIn) ? "done" : ""}>
            <span>{d.day}</span>
            <i />
          </li>
        ))}
      </ul>
    </section>
  );
}

function HomeDashboard({
  onAction,
  checkedIn,
  onCheckIn,
  onOpenGoals,
}: {
  onAction: (id: string) => void;
  checkedIn: boolean;
  onCheckIn: () => void;
  onOpenGoals: () => void;
}) {
  return (
    <div className="panel home">
      <header className="hero">
        <div className="hero-top">
          <p className="brand">
            Mint<span>ly</span>
          </p>
          <div className="streak-chip" aria-label={`${streak.current} day streak`}>
            <FlameIcon size={16} />
            {streak.current}
          </div>
        </div>
        <h1>
          On track, Alex.
          <br />
          <em>Keep the streak going.</em>
        </h1>
        <p className="lede">A quick pulse on budget, goals, and what to do next.</p>
      </header>

      <StreakStrip checkedIn={checkedIn} onCheckIn={onCheckIn} />

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

      <section className="coach" aria-label="AI coach tip">
        <div className="ai-badge">AI</div>
        <div>
          <p className="coach-kicker">Coach tip</p>
          <p className="coach-copy">
            Ease up on dining out and your travel fund stays on schedule.
          </p>
        </div>
      </section>

      <section className="section" aria-label="Goal preview">
        <div className="section-head">
          <h2>Goals snapshot</h2>
          <button className="text-link" onClick={onOpenGoals}>
            See all
          </button>
        </div>
        <div className="goals">
          {savingsGoals.slice(0, 2).map((goal) => (
            <div className="goal-row" key={goal.id}>
              <div className="goal-meta">
                <span>{goal.name}</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="track">
                <div
                  className="fill"
                  style={{
                    width: `${goal.progress}%`,
                    background: "linear-gradient(90deg, #3d8ea5, #2a9d8f)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GoalsPanel({
  goalsReady,
  onAddGoal,
}: {
  goalsReady: boolean;
  onAddGoal: () => void;
}) {
  return (
    <div className="panel">
      <div className="panel-top">
        <div>
          <h1 className="panel-hero">Goals</h1>
          <p className="panel-sub">Track what you&apos;re saving toward.</p>
        </div>
        <button className="checkin-btn" onClick={onAddGoal}>
          New
        </button>
      </div>

      <div className="goals goals-full">
        {savingsGoals.map((goal) => (
          <article className="goal-block" key={goal.id}>
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
            <p className="goal-note">
              {goal.progress >= 100
                ? "Complete — nice work."
                : `Keep going to reach ${goal.target}.`}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function InsightsPanel({ onSend }: { onSend: (q: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="panel">
      <h1 className="panel-hero">Insights</h1>
      <p className="panel-sub">Spending patterns and coach guidance.</p>

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

      <section className="section" aria-label="Coach tips">
        <div className="section-head">
          <h2>Coach notes</h2>
        </div>
        <div className="tip-list">
          {coachTips.map((tip) => (
            <article className="tip-item" key={tip}>
              {tip}
            </article>
          ))}
        </div>
      </section>

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
          placeholder="Ask about your spending…"
          aria-label="Ask about insights"
        />
        <button type="submit">Ask</button>
      </form>
    </div>
  );
}

function ProfilePanel({
  cheers,
  onCheer,
}: {
  cheers: Record<string, number>;
  onCheer: (id: string) => void;
}) {
  const xpPct = Math.round((profile.xp / profile.xpToNext) * 100);

  return (
    <div className="panel">
      <header className="profile-head">
        <div className="profile-avatar" aria-hidden>
          AR
        </div>
        <div>
          <h1 className="panel-hero" style={{ marginBottom: 2 }}>
            {profile.name}
          </h1>
          <p className="handle">
            {profile.handle} · {profile.city}
          </p>
        </div>
      </header>

      <section className="profile-stats" aria-label="Profile stats">
        <div>
          <strong>{streak.current}</strong>
          <span>Streak</span>
        </div>
        <div>
          <strong>{profile.totalSaved}</strong>
          <span>Saved</span>
        </div>
        <div>
          <strong>{profile.budgetsHit}</strong>
          <span>Budgets hit</span>
        </div>
      </section>

      <section className="section" aria-label="Level progress">
        <div className="section-head">
          <h2>Level {profile.level}</h2>
          <span>
            {profile.xp}/{profile.xpToNext} XP
          </span>
        </div>
        <div className="track">
          <div
            className="fill"
            style={{
              width: `${xpPct}%`,
              background: "linear-gradient(90deg, #e07a5f, #f2cc8f)",
            }}
          />
        </div>
      </section>

      <section className="section" aria-label="Badges">
        <div className="section-head">
          <h2>Badges</h2>
          <span>{achievements.length} earned</span>
        </div>
        <div className="badge-grid">
          {achievements.slice(0, 3).map((item) => (
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
      </section>

      <section className="section" aria-label="Friends">
        <div className="section-head">
          <h2>Friends</h2>
          <span>this week</span>
        </div>
        <ol className="leaders">
          {leaderboard.map((row, i) => (
            <li key={row.name} className={row.name === "You" ? "you" : ""}>
              <span className="rank">{i + 1}</span>
              <div>
                <strong>{row.name}</strong>
                <p>
                  {row.streak}-day streak · {row.saved} saved
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" aria-label="Friend activity">
        <div className="section-head">
          <h2>Friend wins</h2>
        </div>
        <div className="feed">
          {communityFeed.map((item) => (
            <article className="feed-item" key={item.id}>
              <div className="avatar" style={{ background: item.color }} aria-hidden>
                {item.initials}
              </div>
              <div className="feed-body">
                <p>
                  <strong>{item.name}</strong> {item.action}
                </p>
                <div className="feed-meta">
                  <span>{item.time}</span>
                  <button className="cheer-btn" onClick={() => onCheer(item.id)}>
                    Cheer · {cheers[item.id] ?? item.cheers}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="joined">Joined {profile.joined}</p>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabId>("home");
  const [toast, setToast] = useState("");
  const [goalsReady, setGoalsReady] = useState(false);
  const [checkedIn, setCheckedIn] = useState(streak.checkedInToday);
  const [cheers, setCheers] = useState<Record<string, number>>(() =>
    Object.fromEntries(communityFeed.map((f) => [f.id, f.cheers])),
  );

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
      setTab("insights");
      return;
    }
    if (id === "goal") {
      setTab("goals");
      showToast("New goal draft ready");
      return;
    }
    const labels: Record<string, string> = {
      expense: "Ready to log an expense",
      transfer: "Transfer started",
    };
    showToast(labels[id] ?? "Done");
  };

  const handleCheckIn = () => {
    if (checkedIn) return;
    setCheckedIn(true);
    showToast("Streak saved — nice work!");
  };

  const handleCheer = (id: string) => {
    setCheers((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    showToast("Cheered your friend!");
  };

  return (
    <div className="app-shell">
      <div className="phone" role="application" aria-label="Mintly finance app">
        <div className="glow" aria-hidden />
        <main className="screen">
          {tab === "home" && (
            <HomeDashboard
              onAction={handleAction}
              checkedIn={checkedIn}
              onCheckIn={handleCheckIn}
              onOpenGoals={() => setTab("goals")}
            />
          )}
          {tab === "goals" && (
            <GoalsPanel
              goalsReady={goalsReady}
              onAddGoal={() => showToast("New goal draft ready")}
            />
          )}
          {tab === "insights" && (
            <InsightsPanel onSend={(q) => showToast(`Asked: ${q.slice(0, 28)}…`)} />
          )}
          {tab === "profile" && (
            <ProfilePanel cheers={cheers} onCheer={handleCheer} />
          )}
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
            className={`nav-item${tab === "goals" ? " active" : ""}`}
            onClick={() => setTab("goals")}
          >
            <TargetIcon />
            Goals
          </button>
          <button
            className={`nav-item${tab === "insights" ? " active" : ""}`}
            onClick={() => setTab("insights")}
          >
            <ChartIcon />
            Insights
          </button>
          <button
            className={`nav-item${tab === "profile" ? " active" : ""}`}
            onClick={() => setTab("profile")}
          >
            <ProfileIcon />
            Profile
          </button>
        </nav>
      </div>
    </div>
  );
}
