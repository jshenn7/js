import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { demoAccount } from "@/lib/auth";
import { ACTION_XP, dayKey } from "@/lib/leveling";
import { hashPassword, verifyPassword } from "@/lib/password";

declare global {
  // Reuse one connection across dev hot reloads and route modules.
  var __fingoDb: Database.Database | undefined;
}

/**
 * Prefer a durable ./data dir; on hosts with a read-only project filesystem
 * (e.g. Vercel serverless) fall back to /tmp, which is writable but ephemeral.
 */
function isWritableDir(dir: string) {
  try {
    mkdirSync(dir, { recursive: true });
    const probe = join(dir, ".write-probe");
    writeFileSync(probe, "");
    rmSync(probe);
    return true;
  } catch {
    return false;
  }
}

function resolveDbDir() {
  const candidates = [
    process.env.FINGO_DB_DIR,
    // Serverless project dirs are read-only; go straight to /tmp there.
    process.env.VERCEL ? null : join(process.cwd(), "data"),
    join(tmpdir(), "fingo-data"),
  ].filter((dir): dir is string => Boolean(dir));
  for (const dir of candidates) {
    if (isWritableDir(dir)) return dir;
  }
  throw new Error("No writable directory for the FinGo database.");
}

export type DbUser = {
  email: string;
  name: string;
  password_hash: string | null;
  auth_provider: string;
  created_at: string;
};

function createDb() {
  const db = new Database(join(resolveDbDir(), "fingo.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password_hash TEXT,
      auth_provider TEXT NOT NULL DEFAULT 'password',
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

  // Migrate older databases that predate password columns.
  const cols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("password_hash")) {
    db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
  }
  if (!names.has("auth_provider")) {
    db.exec("ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'password'");
  }

  return db;
}

export function getDb() {
  if (!globalThis.__fingoDb) {
    globalThis.__fingoDb = createDb();
    seedDemoUser(globalThis.__fingoDb);
  }
  return globalThis.__fingoDb;
}

export function getUserByEmail(email: string): DbUser | null {
  const row = getDb()
    .prepare(
      "SELECT email, name, password_hash, auth_provider, created_at FROM users WHERE email = ?",
    )
    .get(email.toLowerCase()) as DbUser | undefined;
  return row || null;
}

export function createPasswordUser(input: {
  email: string;
  name: string;
  password: string;
}): { ok: true; user: { email: string; name: string } } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim().slice(0, 60);
  if (!email.includes("@") || email.length < 5) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (!name) {
    return { ok: false, error: "Enter your name." };
  }
  if (getUserByEmail(email)) {
    return { ok: false, error: "An account with that email already exists. Sign in instead." };
  }

  getDb()
    .prepare(
      `INSERT INTO users (email, name, password_hash, auth_provider, created_at)
       VALUES (?, ?, ?, 'password', ?)`,
    )
    .run(email, name, hashPassword(input.password), new Date().toISOString());

  return { ok: true, user: { email, name } };
}

export function authenticatePassword(
  email: string,
  password: string,
): { ok: true; user: { email: string; name: string } } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@") || password.length < 1) {
    return { ok: false, error: "Enter your email and password." };
  }

  const user = getUserByEmail(normalized);
  if (!user) {
    return { ok: false, error: "No account found with that email. Create an account first." };
  }
  if (user.auth_provider === "google" && !user.password_hash) {
    return {
      ok: false,
      error: "This account uses Google sign-in. Continue with Google instead.",
    };
  }
  if (!verifyPassword(password, user.password_hash)) {
    return { ok: false, error: "Incorrect password." };
  }
  return { ok: true, user: { email: user.email, name: user.name } };
}

/** Find-or-create a Google OAuth user. Never overwrites an existing password account. */
export function upsertGoogleUser(email: string, name: string) {
  const normalized = email.trim().toLowerCase();
  const existing = getUserByEmail(normalized);
  if (existing) {
    if (existing.name !== name) {
      getDb().prepare("UPDATE users SET name = ? WHERE email = ?").run(name, normalized);
    }
    return { email: existing.email, name: name || existing.name, isNew: false };
  }
  getDb()
    .prepare(
      `INSERT INTO users (email, name, password_hash, auth_provider, created_at)
       VALUES (?, ?, NULL, 'google', ?)`,
    )
    .run(normalized, name.slice(0, 60) || "Saver", new Date().toISOString());
  return { email: normalized, name: name.slice(0, 60) || "Saver", isNew: true };
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
    email.toLowerCase(),
    profile.employment || null,
    typeof profile.salary === "number" ? Math.round(profile.salary) : null,
    profile.goal || null,
    new Date().toISOString(),
  );
}

export function getProfileRow(email: string) {
  return (
    (getDb()
      .prepare("SELECT employment, salary, goal FROM profiles WHERE email = ?")
      .get(email.toLowerCase()) as
      | { employment: string | null; salary: number | null; goal: string | null }
      | undefined) || null
  );
}

/**
 * Give the demo account a believable history (a streak and some activity)
 * so the app doesn't start empty on first boot. Also ensures its password
 * is always the known demo password.
 */
function seedDemoUser(db: Database.Database) {
  const email = demoAccount.email;
  const existing = db
    .prepare("SELECT email, password_hash FROM users WHERE email = ?")
    .get(email) as { email: string; password_hash: string | null } | undefined;

  if (!existing) {
    db.prepare(
      `INSERT INTO users (email, name, password_hash, auth_provider, created_at)
       VALUES (?, ?, ?, 'password', ?)`,
    ).run(email, demoAccount.name, hashPassword(demoAccount.password), new Date().toISOString());
  } else if (!existing.password_hash || !verifyPassword(demoAccount.password, existing.password_hash)) {
    // Keep the published demo credentials working even if the DB was seeded earlier.
    db.prepare(
      "UPDATE users SET password_hash = ?, auth_provider = 'password', name = ? WHERE email = ?",
    ).run(hashPassword(demoAccount.password), demoAccount.name, email);
  }

  const xpCount = db
    .prepare("SELECT COUNT(*) as n FROM xp_events WHERE email = ?")
    .get(email) as { n: number };
  if (xpCount.n > 0) return;

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
