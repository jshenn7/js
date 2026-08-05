import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, decodeSession } from "@/lib/auth";
import { ensureUser, getDb } from "@/lib/db";
import {
  ACTION_XP,
  dayKey,
  levelFromXp,
  periodFor,
  QUESTS,
  type ActionKind,
  type ProgressSnapshot,
  type QuestStatus,
} from "@/lib/leveling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CompletedQuest = { id: string; label: string; emoji: string; rewardXp: number };

function totalXpFor(email: string): number {
  const row = getDb()
    .prepare("SELECT COALESCE(SUM(xp), 0) AS total FROM xp_events WHERE email = ?")
    .get(email) as { total: number };
  return row.total;
}

function countToday(email: string, kind: ActionKind): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM xp_events WHERE email = ? AND kind = ? AND day = ?")
    .get(email, kind, dayKey()) as { n: number };
  return row.n;
}

function addXp(email: string, kind: string, xp: number, label: string) {
  getDb()
    .prepare(
      "INSERT INTO xp_events (email, kind, xp, label, day, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(email, kind, xp, label, dayKey(), new Date().toISOString());
}

/** Bump quests tied to an action; returns quests completed by this bump. */
function bumpQuests(email: string, action: ActionKind): CompletedQuest[] {
  const db = getDb();
  const completed: CompletedQuest[] = [];
  for (const quest of QUESTS.filter((q) => q.action === action)) {
    const period = periodFor(quest.cadence);
    db.prepare(
      `INSERT INTO quest_progress (email, quest_id, period, progress)
       VALUES (?, ?, ?, 0)
       ON CONFLICT(email, quest_id, period) DO NOTHING`,
    ).run(email, quest.id, period);
    const row = db
      .prepare(
        "SELECT progress, completed_at FROM quest_progress WHERE email = ? AND quest_id = ? AND period = ?",
      )
      .get(email, quest.id, period) as { progress: number; completed_at: string | null };
    if (row.completed_at) continue;

    const progress = row.progress + 1;
    const done = progress >= quest.target;
    db.prepare(
      "UPDATE quest_progress SET progress = ?, completed_at = ? WHERE email = ? AND quest_id = ? AND period = ?",
    ).run(progress, done ? new Date().toISOString() : null, email, quest.id, period);

    if (done) {
      addXp(email, "quest", quest.rewardXp, `Quest complete: ${quest.label}`);
      completed.push({
        id: quest.id,
        label: quest.label,
        emoji: quest.emoji,
        rewardXp: quest.rewardXp,
      });
    }
  }
  return completed;
}

/** Award base XP (respecting daily caps) and bump quests. */
function performAction(email: string, action: ActionKind) {
  const config = ACTION_XP[action];
  let awardedXp = 0;
  if (countToday(email, action) < config.dailyCap) {
    addXp(email, action, config.xp, config.label);
    awardedXp += config.xp;
  }
  const completedQuests = bumpQuests(email, action);
  awardedXp += completedQuests.reduce((sum, q) => sum + q.rewardXp, 0);
  return { awardedXp, completedQuests };
}

function streakFor(email: string): number {
  const rows = getDb()
    .prepare(
      "SELECT DISTINCT day FROM xp_events WHERE email = ? AND kind = 'checkin' ORDER BY day DESC LIMIT 400",
    )
    .all(email) as Array<{ day: string }>;
  const days = new Set(rows.map((r) => r.day));
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to survive if today's check-in hasn't happened yet.
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function questStatuses(email: string): QuestStatus[] {
  const db = getDb();
  return QUESTS.map((quest) => {
    const period = periodFor(quest.cadence);
    const row = db
      .prepare(
        "SELECT progress, completed_at FROM quest_progress WHERE email = ? AND quest_id = ? AND period = ?",
      )
      .get(email, quest.id, period) as
      | { progress: number; completed_at: string | null }
      | undefined;
    return {
      ...quest,
      progress: Math.min(row?.progress ?? 0, quest.target),
      completed: Boolean(row?.completed_at),
    };
  });
}

function snapshotFor(email: string): ProgressSnapshot {
  const totalXp = totalXpFor(email);
  const recent = getDb()
    .prepare(
      "SELECT label, xp, created_at AS createdAt FROM xp_events WHERE email = ? ORDER BY id DESC LIMIT 10",
    )
    .all(email) as ProgressSnapshot["recent"];
  return {
    totalXp,
    ...levelFromXp(totalXp),
    streak: streakFor(email),
    quests: questStatuses(email),
    recent,
  };
}

function sessionFrom(request: NextRequest) {
  return decodeSession(request.cookies.get(AUTH_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  const session = sessionFrom(request);
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  ensureUser(session.email, session.name);

  const levelBefore = levelFromXp(totalXpFor(session.email)).level;
  let completedQuests: CompletedQuest[] = [];
  let awardedXp = 0;

  // First visit of the day counts as a check-in.
  if (countToday(session.email, "checkin") === 0) {
    const result = performAction(session.email, "checkin");
    completedQuests = result.completedQuests;
    awardedXp = result.awardedXp;
  }

  const snapshot = snapshotFor(session.email);
  return NextResponse.json({
    snapshot,
    awardedXp,
    completedQuests,
    levelUp: snapshot.level > levelBefore,
  });
}

const VALID_ACTIONS: ActionKind[] = ["receipt", "coach", "bills", "goal", "shop"];

type PostBody = {
  action?: ActionKind;
  transaction?: {
    id?: string;
    merchant?: string;
    amount?: number;
    categoryId?: string;
    date?: string;
    note?: string;
  };
  itemId?: string;
};

export async function POST(request: NextRequest) {
  const session = sessionFrom(request);
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: PostBody = {};
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = body.action;
  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  ensureUser(session.email, session.name);
  const db = getDb();

  if (action === "receipt" && body.transaction?.merchant && body.transaction.amount) {
    db.prepare(
      `INSERT INTO transactions (id, email, merchant, amount, category_id, date, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO NOTHING`,
    ).run(
      body.transaction.id || `rx-${Date.now()}`,
      session.email,
      String(body.transaction.merchant).slice(0, 80),
      body.transaction.amount,
      String(body.transaction.categoryId || "food"),
      String(body.transaction.date || dayKey()),
      body.transaction.note ? String(body.transaction.note).slice(0, 200) : null,
      new Date().toISOString(),
    );
  }

  if (action === "shop" && body.itemId) {
    db.prepare(
      `INSERT INTO shop_purchases (email, item_id, purchased_at) VALUES (?, ?, ?)
       ON CONFLICT(email, item_id) DO NOTHING`,
    ).run(session.email, String(body.itemId), new Date().toISOString());
  }

  const levelBefore = levelFromXp(totalXpFor(session.email)).level;
  const { awardedXp, completedQuests } = performAction(session.email, action);
  const snapshot = snapshotFor(session.email);

  return NextResponse.json({
    snapshot,
    awardedXp,
    completedQuests,
    levelUp: snapshot.level > levelBefore,
  });
}
