import { NextResponse } from "next/server";
import { AUTH_COOKIE, demoAccount, encodeSession } from "@/lib/auth";
import { authenticatePassword, getUserByEmail } from "@/lib/db";

type LoginBody = {
  email?: string;
  password?: string;
  demo?: boolean;
};

function sessionCookie(response: NextResponse, user: { email: string; name: string }) {
  response.cookies.set(AUTH_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.VERCEL === "1",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function POST(request: Request) {
  let body: LoginBody = {};
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    body = {};
  }

  if (body.demo) {
    // Demo always signs into the seeded Alex account — never creates a new one.
    const demo = getUserByEmail(demoAccount.email);
    const user = {
      email: demoAccount.email,
      name: demo?.name || demoAccount.name,
    };
    const response = NextResponse.json({ ok: true, user });
    sessionCookie(response, user);
    return response;
  }

  const result = authenticatePassword(body.email || "", body.password || "");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: result.user });
  sessionCookie(response, result.user);
  return response;
}
