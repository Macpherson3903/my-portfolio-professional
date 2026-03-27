import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { DATABASE_URL_ENV_KEYS, normalizePostgresUrlForPrisma, resolveDatabaseUrl } from "./database-url";

describe("normalizePostgresUrlForPrisma", () => {
  it("leaves non-Neon URLs unchanged", () => {
    const u = "postgresql://u:p@localhost:5432/mydb";
    expect(normalizePostgresUrlForPrisma(u)).toBe(u);
  });

  it("adds sslmode, connect_timeout, pgbouncer for Neon pooler host", () => {
    const raw =
      "postgresql://u:p@ep-shy-union-anjhxbo2-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";
    const out = normalizePostgresUrlForPrisma(raw);
    const parsed = new URL(out);
    expect(parsed.searchParams.get("sslmode")).toBe("require");
    expect(parsed.searchParams.get("connect_timeout")).toBe("30");
    expect(parsed.searchParams.get("pgbouncer")).toBe("true");
  });

  it("removes channel_binding=require for Neon", () => {
    const raw =
      "postgresql://u:p@ep-foo-pooler.us-east-1.aws.neon.tech/db?sslmode=require&channel_binding=require";
    const out = normalizePostgresUrlForPrisma(raw);
    const parsed = new URL(out);
    expect(parsed.searchParams.has("channel_binding")).toBe(false);
    expect(parsed.searchParams.get("pgbouncer")).toBe("true");
  });

  it("does not set pgbouncer for Neon non-pooler host", () => {
    const raw = "postgresql://u:p@ep-foo.us-east-1.aws.neon.tech/neondb?sslmode=require";
    const out = normalizePostgresUrlForPrisma(raw);
    const parsed = new URL(out);
    expect(parsed.searchParams.has("pgbouncer")).toBe(false);
    expect(parsed.searchParams.get("connect_timeout")).toBe("30");
  });
});

describe("resolveDatabaseUrl", () => {
  const env = process.env;

  beforeEach(() => {
    for (const k of DATABASE_URL_ENV_KEYS) {
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
    const out = resolveDatabaseUrl();
    expect(out).not.toBeNull();
    const parsed = new URL(out!);
    expect(parsed.protocol).toBe("postgresql:");
    expect(parsed.searchParams.get("sslmode")).toBe("require");
    expect(parsed.searchParams.get("connect_timeout")).toBe("30");
  });

  it("uses DATABASE_POSTGRES_PRISMA_URL before DATABASE_URL when both are set", () => {
    process.env.DATABASE_URL = "postgresql://from-database-url/db";
    process.env.DATABASE_POSTGRES_PRISMA_URL = "postgresql://from-prisma-pooler/db";
    expect(resolveDatabaseUrl()).toBe("postgresql://from-prisma-pooler/db");
  });

  it("uses DATABASE_POSTGRES_URL when earlier keys are invalid", () => {
    process.env.DATABASE_POSTGRES_PRISMA_URL = "not-a-url";
    process.env.DATABASE_URL = "also-bad";
    process.env.DATABASE_POSTGRES_URL = "postgresql://x:y@host/db";
    expect(resolveDatabaseUrl()).toBe("postgresql://x:y@host/db");
  });

  it("uses DATABASE_POSTGRES_URL when earlier keys are missing", () => {
    process.env.DATABASE_POSTGRES_URL = "postgresql://pool@host/db";
    expect(resolveDatabaseUrl()).toBe("postgresql://pool@host/db");
  });

  it("returns null when nothing valid", () => {
    process.env.DATABASE_URL = "file:./dev.db";
    expect(resolveDatabaseUrl()).toBeNull();
  });
});
