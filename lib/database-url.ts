/** Strip whitespace and matching outer quotes from .env lines. */
function stripEnvValue(raw: string): string {
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

const ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
  "NEON_DATABASE_URL",
] as const;

/**
 * Resolves a Postgres connection string for Prisma.
 * Handles quoted values, Neon/Vercel alternate env names, and `user@host/db` strings missing `postgresql://`.
 */
export function resolveDatabaseUrl(): string | null {
  for (const key of ENV_KEYS) {
    const raw = process.env[key];
    if (!raw) continue;
    let url = stripEnvValue(raw);
    if (!url) continue;

    if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
      return url;
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
        return url;
      }
    }
  }

  return null;
}
