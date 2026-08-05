import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, encodeSession, GOOGLE_STATE_COOKIE } from "@/lib/auth";
import { saveProfileRow, upsertGoogleUser } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

/**
 * Starts Google sign-in. With GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET set this
 * runs the real OAuth flow; without credentials it creates/signs into a
 * distinct Google demo account (never the password demo account).
 */
export function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const onboardingName = (request.nextUrl.searchParams.get("name") || "")
    .trim()
    .slice(0, 60);
  const username = (request.nextUrl.searchParams.get("username") || "").trim();
  const employment = request.nextUrl.searchParams.get("employment") || "";
  const salary = request.nextUrl.searchParams.get("salary") || "";
  const goal = request.nextUrl.searchParams.get("goal") || "";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // Demo Google path: each distinct display name gets its own account so
    // it never collides with the password-based demo user.
    const slug =
      (username || onboardingName || "guest")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "")
        .slice(0, 32) || "guest";
    const email = `${slug}.google@fingo.app`;
    const user = upsertGoogleUser(email, onboardingName || "Google User", username || null);
    if (employment || salary || goal) {
      try {
        saveProfileRow(user.email, {
          employment: employment || null,
          salary: salary ? Number(salary) : null,
          goal: goal || null,
        });
      } catch {
        // best-effort
      }
    }
    const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));
    response.cookies.set(AUTH_COOKIE, encodeSession(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.VERCEL === "1",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return response;
  }

  const state = Buffer.from(
    JSON.stringify({
      nonce: crypto.randomUUID(),
      next,
      name: onboardingName,
      username,
      employment,
      salary,
      goal,
    }),
    "utf8",
  ).toString("base64url");

  const redirectUri = new URL("/api/auth/google/callback", request.nextUrl.origin);
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri.toString());
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.VERCEL === "1",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
