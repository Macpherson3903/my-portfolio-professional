import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionCookieValue,
  getAdminSecret,
  getSessionSecret,
  verifyAdminSessionCookie,
} from "@/lib/auth-session";

const MAX_AGE = 60 * 60 * 24 * 7;

export { getAdminSecret, getSessionSecret, verifyAdminSessionCookie };

export async function createAdminSession() {
  const value = buildAdminSessionCookieValue();
  if (!value) return;
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionCookie(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) throw new Error("Unauthorized");
}
