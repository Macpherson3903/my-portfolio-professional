import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { verifyAdminSessionCookie, buildAdminSessionCookieValue } from "./auth-session";

describe("auth-session", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "test-admin";
    process.env.SESSION_SECRET = "test-session";
  });
  afterEach(() => {
    delete process.env.ADMIN_SECRET;
    delete process.env.SESSION_SECRET;
  });

  it("rejects invalid cookie", () => {
    expect(verifyAdminSessionCookie(undefined)).toBe(false);
    expect(verifyAdminSessionCookie("garbage")).toBe(false);
  });

  it("accepts valid signed cookie", () => {
    const v = buildAdminSessionCookieValue();
    expect(v).toBeTruthy();
    expect(verifyAdminSessionCookie(v!)).toBe(true);
  });
});
