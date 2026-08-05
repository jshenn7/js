/** Normalize a handle: strip leading @, lowercase, trim. */
export function normalizeUsername(raw: string) {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

export function formatHandle(username: string | null | undefined) {
  if (!username) return null;
  const normalized = normalizeUsername(username);
  return normalized ? `@${normalized}` : null;
}

/**
 * Usernames: 3–20 chars, start with a letter, then letters/numbers/underscores.
 */
export function validateUsername(raw: string): { ok: true; username: string } | { ok: false; error: string } {
  const username = normalizeUsername(raw);
  if (username.length < 3) {
    return { ok: false, error: "Username must be at least 3 characters." };
  }
  if (username.length > 20) {
    return { ok: false, error: "Username must be 20 characters or fewer." };
  }
  if (!/^[a-z][a-z0-9_]*$/.test(username)) {
    return {
      ok: false,
      error: "Usernames start with a letter and can only use letters, numbers, and underscores.",
    };
  }
  return { ok: true, username };
}

/** Suggest a username from a display name, e.g. "Jordan Shen" → "jordanshen". */
export function suggestUsername(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^[^a-z]+/, "")
    .slice(0, 16);
  if (base.length >= 3) return base;
  return "saver";
}
