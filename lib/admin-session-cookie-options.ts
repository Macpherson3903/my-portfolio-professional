import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

const MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** Use on Vercel (HTTPS) and local production builds; false on http:// localhost. */
export function adminCookieSecure(): boolean {
  if (process.env.VERCEL === "1") return true;
  return process.env.NODE_ENV === "production";
}

type CookieSetArg = Parameters<ResponseCookies["set"]>;

export function getAdminSessionCookieOptions(
  maxAge: number = MAX_AGE_SEC
): Omit<CookieSetArg[2], "name" | "value"> {
  return {
    httpOnly: true,
    secure: adminCookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}
