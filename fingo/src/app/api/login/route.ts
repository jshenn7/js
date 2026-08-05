import { NextResponse } from "next/server";
import { AUTH_COOKIE, demoAccount, encodeSession } from "@/lib/auth";

type LoginBody = {
  email?: string;
  password?: string;
  demo?: boolean;
  name?: string;
};

export async function POST(request: Request) {
  let body: LoginBody = {};
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    body = {};
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  const isDemo = Boolean(body.demo);
  const validDemo =
    email === demoAccount.email.toLowerCase() && password === demoAccount.password;
  const validAny = email.includes("@") && password.length >= 6;

  if (!isDemo && !validDemo && !validAny) {
    return NextResponse.json(
      {
        error: "Enter a valid email and a password with at least 6 characters.",
      },
      { status: 400 },
    );
  }

  const onboardingName = (body.name || "").trim().slice(0, 60);
  const user = isDemo || validDemo
    ? { email: demoAccount.email, name: onboardingName || demoAccount.name }
    : {
        email,
        name: onboardingName || email.split("@")[0]?.replace(/[._]/g, " ") || "Saver",
      };

  const response = NextResponse.json({ ok: true, user });
  response.cookies.set(AUTH_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
