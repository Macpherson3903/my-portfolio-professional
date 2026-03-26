import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_SECRET || "";
}

export function getAdminSecret() {
  return process.env.ADMIN_SECRET || "";
}

export function verifyAdminSessionCookie(raw: string | undefined): boolean {
  const secret = getSessionSecret();
  if (!secret || !raw) return false;
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot < 0) return false;
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    const expected = sign(payload, secret);
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
    const data = JSON.parse(payload) as { ok?: boolean; exp?: number };
    if (!data.ok || typeof data.exp !== "number") return false;
    if (Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function buildAdminSessionCookieValue(): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = JSON.stringify({ ok: true, exp });
  const sig = sign(payload, secret);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}
