import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { resolveDatabaseUrl } from "./database-url";

describe("resolveDatabaseUrl", () => {
  const env = process.env;

  beforeEach(() => {
    for (const k of [
      "DATABASE_URL",
      "POSTGRES_PRISMA_URL",
      "POSTGRES_URL",
      "PRISMA_DATABASE_URL",
      "NEON_DATABASE_URL",
    ] as const) {
      delete process.env[k];
    }
  });

  afterEach(() => {
    process.env = env;
  });

  it("accepts postgresql://", () => {
    process.env.DATABASE_URL = "postgresql://u:p@host/db?sslmode=require";
    expect(resolveDatabaseUrl()).toBe("postgresql://u:p@host/db?sslmode=require");
  });

  it("strips outer double quotes", () => {
    process.env.DATABASE_URL = '"postgresql://u:p@host/db?sslmode=require"';
    expect(resolveDatabaseUrl()).toBe("postgresql://u:p@host/db?sslmode=require");
  });

  it("prepends protocol for neon-style host without scheme", () => {
    process.env.DATABASE_URL = "user:pass@ep-foo.us-east-1.aws.neon.tech/neondb?sslmode=require";
    expect(resolveDatabaseUrl()).toBe(
      "postgresql://user:pass@ep-foo.us-east-1.aws.neon.tech/neondb?sslmode=require"
    );
  });

  it("uses POSTGRES_PRISMA_URL when DATABASE_URL is invalid", () => {
    process.env.DATABASE_URL = "not-a-url";
    process.env.POSTGRES_PRISMA_URL = "postgresql://x:y@host/db";
    expect(resolveDatabaseUrl()).toBe("postgresql://x:y@host/db");
  });

  it("returns null when nothing valid", () => {
    process.env.DATABASE_URL = "file:./dev.db";
    expect(resolveDatabaseUrl()).toBeNull();
  });
});
