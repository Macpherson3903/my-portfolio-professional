import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminSessionCookieSecure } from "@/lib/auth-session";

export async function POST(req: Request) {
  const secure = adminSessionCookieSecure(req);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
