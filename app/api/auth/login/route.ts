import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieSecure,
  buildAdminSessionCookieValue,
  getAdminSecret,
} from "@/lib/auth-session";

export async function POST(req: Request) {
  const secure = adminSessionCookieSecure(req);
  const body = (await req.json()) as { secret?: string };
  const secret = String(body.secret ?? "").replace(/\r\n/g, "\n").trim();
  const expected = getAdminSecret();
  if (!expected) {
    return NextResponse.json({ error: "Server not configured ADMIN_SECRET" }, { status: 500 });
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  const value = buildAdminSessionCookieValue();
  if (!value) {
    return NextResponse.json(
      { error: "SESSION_SECRET or ADMIN_SECRET required to create a session" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, value, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
