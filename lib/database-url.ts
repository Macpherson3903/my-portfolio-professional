/** Strip whitespace and matching outer quotes from .env lines. */
function stripEnvValue(raw: string): string {
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function isNeonHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h.endsWith(".neon.tech") || h.includes(".aws.neon.tech");
}

function isNeonPoolerHost(hostname: string): boolean {
  return isNeonHost(hostname) && hostname.toLowerCase().includes("-pooler");
}

/**
 * Neon + Prisma pooler: need `pgbouncer=true`.
 * `channel_binding=require` (common in Neon dashboard copy) breaks many Node/pg stacks — strip `require` only.
 * Extra timeout helps when the Neon compute is waking from suspend.
 */
export function normalizePostgresUrlForPrisma(url: string): string {
  if (!/^postgres(ql)?:\/\//i.test(url)) return url;
  try {
    const u = new URL(url);
    if (!isNeonHost(u.hostname)) return url;

    const params = u.searchParams;
    if (!params.has("sslmode")) {
      params.set("sslmode", "require");
    }
    if (params.get("channel_binding") === "require") {
      params.delete("channel_binding");
    }
    if (!params.has("connect_timeout")) {
      params.set("connect_timeout", "30");
    }
    if (isNeonPoolerHost(u.hostname) && !params.has("pgbouncer")) {
      params.set("pgbouncer", "true");
    }

    u.search = params.toString();
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Only Neon/Vercel-managed names (same keys as the “Neon” integration on Vercel).
 * Order: pooled app URL first, then fallbacks. Other `DATABASE_*` keys (password, PGHOST, etc.)
 * are not Postgres connection URLs — use the URL fields below.
 */
export const DATABASE_URL_ENV_KEYS = [
  "DATABASE_POSTGRES_PRISMA_URL",
  "DATABASE_URL",
  "DATABASE_POSTGRES_URL",
  "DATABASE_POSTGRES_URL_NON_POOLING",
  "DATABASE_POSTGRES_URL_NO_SSL",
] as const;

/**
 * Resolves a Postgres connection string for Prisma.
 * Handles quoted values, Neon/Vercel alternate env names, and `user@host/db` strings missing `postgresql://`.
 */
export function resolveDatabaseUrl(): string | null {
  for (const key of DATABASE_URL_ENV_KEYS) {
    const raw = process.env[key];
    if (!raw) continue;
    let url = stripEnvValue(raw);
    if (!url) continue;

    if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
      return normalizePostgresUrlForPrisma(url);
    }

    if (url.startsWith("file:")) {
      console.error(
        `[database] ${key} points to SQLite (file:). Prisma schema expects PostgreSQL. Set a Neon postgresql:// URL.`
      );
      continue;
    }

    if (
      url.includes("@") &&
      (url.includes(".neon.tech") ||
        url.includes(".aws.neon.tech") ||
        url.includes("amazonaws.com") ||
        /:[0-9]+\//.test(url) ||
        /^[^/\s]+:[^@\s]+@/.test(url))
    ) {
      if (!url.includes("://")) {
        url = `postgresql://${url}`;
      }
      if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
        return normalizePostgresUrlForPrisma(url);
      }
    }
  }

  return null;
}
