import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, encodeSession, GOOGLE_STATE_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

/**
 * Starts Google sign-in. With GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET set this
 * runs the real OAuth flow; without credentials it signs in a demo Google
 * account so the button still works out of the box.
 */
export function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const user = { email: "alex.rivera@gmail.com", name: "Alex Rivera" };
    const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));
    response.cookies.set(AUTH_COOKIE, encodeSession(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return response;
  }

  const state = `${crypto.randomUUID()}:${next}`;
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
    secure: false,
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
