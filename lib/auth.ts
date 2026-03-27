import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionCookieValue,
  getAdminSecret,
  getSessionSecret,
  verifyAdminSessionCookie,
} from "@/lib/auth-session";

const MAX_AGE = 60 * 60 * 24 * 7;

export function adminSessionCookieOptions(maxAge: number = MAX_AGE, secure = false) {
  return {
    httpOnly: true as const,
    secure,
    sameSite: "lax" as const,
    path: "/" as const,
    maxAge,
  };
}

export { getAdminSecret, getSessionSecret, verifyAdminSessionCookie };

/** Prefer setting the cookie on a `NextResponse` in a Route Handler (see `/api/auth/login`). */
export async function createAdminSession() {
  const value = buildAdminSessionCookieValue();
  if (!value) return;
  const jar = await cookies();
  const secure = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  jar.set(ADMIN_SESSION_COOKIE, value, adminSessionCookieOptions(MAX_AGE, secure));
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
