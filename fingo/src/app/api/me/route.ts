import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, decodeSession } from "@/lib/auth";
import { getProfileRow, getUserByEmail } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = decodeSession(request.cookies.get(AUTH_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const dbUser = getUserByEmail(session.email);
  const profile = getProfileRow(session.email);
  return NextResponse.json({
    user: {
      email: session.email,
      name: dbUser?.name || session.name,
      authProvider: dbUser?.auth_provider || "password",
    },
    profile,
  });
}
