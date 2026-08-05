import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { demoAccount } from "@/lib/auth";
import { ACTION_XP, dayKey } from "@/lib/leveling";

const DB_DIR = process.env.FINGO_DB_DIR || join(process.cwd(), "data");
const DB_PATH = join(DB_DIR, "fingo.db");

declare global {
  // Reuse one connection across dev hot reloads and route modules.
  var __fingoDb: Database.Database | undefined;
}

function createDb() {
  mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      employment TEXT,
      salary INTEGER,
      goal TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      merchant TEXT NOT NULL,
      amount REAL NOT NULL,
      category_id TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_email ON transactions(email, created_at DESC);

    CREATE TABLE IF NOT EXISTS xp_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      kind TEXT NOT NULL,
      xp INTEGER NOT NULL,
      label TEXT NOT NULL,
      day TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_xp_email_day ON xp_events(email, day);

    CREATE TABLE IF NOT EXISTS quest_progress (
      email TEXT NOT NULL,
      quest_id TEXT NOT NULL,
      period TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      PRIMARY KEY (email, quest_id, period)
    );

    CREATE TABLE IF NOT EXISTS shop_purchases (
      email TEXT NOT NULL,
      item_id TEXT NOT NULL,
      purchased_at TEXT NOT NULL,
      PRIMARY KEY (email, item_id)
    );
  `);
  return db;
}

export function getDb() {
  if (!globalThis.__fingoDb) {
    globalThis.__fingoDb = createDb();
    seedDemoUser(globalThis.__fingoDb);
  }
  return globalThis.__fingoDb;
}

export function ensureUser(email: string, name: string) {
  const db = getDb();
  db.prepare(
    `INSERT INTO users (email, name, created_at) VALUES (?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET name = excluded.name`,
  ).run(email, name, new Date().toISOString());
}

export function saveProfileRow(
  email: string,
  profile: { employment?: string | null; salary?: number | null; goal?: string | null },
) {
  const db = getDb();
  db.prepare(
    `INSERT INTO profiles (email, employment, salary, goal, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       employment = excluded.employment,
       salary = excluded.salary,
       goal = excluded.goal,
       updated_at = excluded.updated_at`,
  ).run(
    email,
    profile.employment || null,
    typeof profile.salary === "number" ? Math.round(profile.salary) : null,
    profile.goal || null,
    new Date().toISOString(),
  );
}

/**
 * Give the demo account a believable history (a streak and some activity)
 * so the app doesn't start empty on first boot.
 */
function seedDemoUser(db: Database.Database) {
  const email = demoAccount.email;
  const existing = db
    .prepare("SELECT COUNT(*) as n FROM xp_events WHERE email = ?")
    .get(email) as { n: number };
  if (existing.n > 0) return;

  db.prepare(
    `INSERT INTO users (email, name, created_at) VALUES (?, ?, ?)
     ON CONFLICT(email) DO NOTHING`,
  ).run(email, demoAccount.name, new Date().toISOString());

  const insert = db.prepare(
    "INSERT INTO xp_events (email, kind, xp, label, day, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const seed = db.transaction(() => {
    // 12-day check-in streak ending yesterday (today's check-in should be earned live).
    for (let i = 12; i >= 1; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const day = dayKey(date);
      const iso = date.toISOString();
      insert.run(email, "checkin", ACTION_XP.checkin.xp, ACTION_XP.checkin.label, day, iso);
      if (i % 2 === 0) {
        insert.run(email, "receipt", ACTION_XP.receipt.xp, ACTION_XP.receipt.label, day, iso);
      }
      if (i % 3 === 0) {
        insert.run(email, "coach", ACTION_XP.coach.xp, ACTION_XP.coach.label, day, iso);
        insert.run(email, "quest", 40, "Quest complete: Scan a receipt", day, iso);
      }
      if (i % 4 === 0) {
        insert.run(email, "goal", ACTION_XP.goal.xp, ACTION_XP.goal.label, day, iso);
        insert.run(email, "quest", 100, "Quest complete: Scan 3 receipts this week", day, iso);
      }
    }
  });
  seed();
}
