import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, encodeSession, GOOGLE_STATE_COOKIE } from "@/lib/auth";
import { saveProfileRow, upsertGoogleUser } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loginRedirect(request: NextRequest, error: string) {
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("error", error);
  const response = NextResponse.redirect(url);
  response.cookies.delete(GOOGLE_STATE_COOKIE);
  return response;
}

type OAuthState = {
  nonce?: string;
  next?: string;
  name?: string;
  employment?: string;
  salary?: string;
  goal?: string;
};

function parseState(raw: string): OAuthState | null {
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as OAuthState;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return loginRedirect(request, "Google sign-in is not configured.");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") || "";
  const storedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value || "";

  if (!code || !state || state !== storedState) {
    return loginRedirect(request, "Google sign-in was cancelled or expired. Try again.");
  }

  const parsed = parseState(state) || {};
  const next =
    parsed.next && parsed.next.startsWith("/") && !parsed.next.startsWith("//")
      ? parsed.next
      : "/app";

  try {
    const redirectUri = new URL("/api/auth/google/callback", request.nextUrl.origin);
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri.toString(),
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error(`Token exchange failed (${tokenRes.status})`);
    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) throw new Error("No access token from Google.");

    const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userRes.ok) throw new Error(`Userinfo failed (${userRes.status})`);
    const profile = (await userRes.json()) as { email?: string; name?: string };
    if (!profile.email) throw new Error("Google account has no email.");

    const displayName =
      (parsed.name || "").trim() ||
      profile.name ||
      profile.email.split("@")[0] ||
      "Saver";

    const user = upsertGoogleUser(profile.email, displayName);
    if (parsed.employment || parsed.salary || parsed.goal) {
      saveProfileRow(user.email, {
        employment: parsed.employment || null,
        salary: parsed.salary ? Number(parsed.salary) : null,
        goal: parsed.goal || null,
      });
    }

    const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));
    response.cookies.delete(GOOGLE_STATE_COOKIE);
    response.cookies.set(AUTH_COOKIE, encodeSession(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.VERCEL === "1",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return response;
  } catch {
    return loginRedirect(request, "Google sign-in failed. Please try again.");
  }
}
