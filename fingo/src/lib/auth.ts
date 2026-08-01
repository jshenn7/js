export const AUTH_COOKIE = "fingo_session";

export const demoAccount = {
  email: "alex@fingo.app",
  password: "streak123",
  name: "Alex Rivera",
};

export type SessionUser = {
  email: string;
  name: string;
};

export function encodeSession(user: SessionUser) {
  return btoa(JSON.stringify(user));
}

export function decodeSession(value: string | undefined | null): SessionUser | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(atob(value)) as SessionUser;
    if (!parsed?.email || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}
