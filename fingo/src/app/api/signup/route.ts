import { NextResponse } from "next/server";
import { AUTH_COOKIE, encodeSession } from "@/lib/auth";
import { createPasswordUser, saveProfileRow } from "@/lib/db";

type SignupBody = {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
  profile?: { employment?: string; salary?: number | null; goal?: string | null };
};

export async function POST(request: Request) {
  let body: SignupBody = {};
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    body = {};
  }

  const result = createPasswordUser({
    email: body.email || "",
    name: body.name || "",
    password: body.password || "",
    username: body.username || "",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (body.profile) {
    try {
      saveProfileRow(result.user.email, body.profile);
    } catch {
      // Profile write is best-effort; the account itself was created.
    }
  }

  const response = NextResponse.json({ ok: true, user: result.user });
  response.cookies.set(AUTH_COOKIE, encodeSession(result.user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.VERCEL === "1",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
