export const AUTH_COOKIE = "fingo_session";
export const GOOGLE_STATE_COOKIE = "fingo_google_state";

export const demoAccount = {
  email: "alex@fingo.app",
  password: "streak123",
  name: "Alex Rivera",
};

export type SessionUser = {
  email: string;
  name: string;
};

function toBase64Url(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }
  // Browser fallback (not used for cookies, but keeps the module client-safe).
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.from(value, "base64url").toString("utf8");
    } catch {
      return Buffer.from(value, "base64").toString("utf8");
    }
  }
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeSession(user: SessionUser) {
  return toBase64Url(JSON.stringify(user));
}

export function decodeSession(value: string | undefined | null): SessionUser | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(value)) as SessionUser;
    if (!parsed?.email || !parsed?.name) return null;
    return { email: parsed.email.toLowerCase(), name: parsed.name };
  } catch {
    return null;
  }
}

/** Per-account localStorage key so two users on one browser never share data. */
export function accountStorageKey(base: string, email: string | null | undefined) {
  const id = (email || "guest").trim().toLowerCase() || "guest";
  return `${base}::${id}`;
}
