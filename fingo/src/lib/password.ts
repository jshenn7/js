import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;

/** Hash a password with a random salt. Stored as `salt:hash` (hex). */
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

/** Constant-time password check against a stored `salt:hash` value. */
export function verifyPassword(password: string, stored: string | null | undefined) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  try {
    const actual = scryptSync(password, salt, KEYLEN);
    const expectedBuf = Buffer.from(expected, "hex");
    if (actual.length !== expectedBuf.length) return false;
    return timingSafeEqual(actual, expectedBuf);
  } catch {
    return false;
  }
}
