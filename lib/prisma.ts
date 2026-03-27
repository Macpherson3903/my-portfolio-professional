import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Valid-format placeholder so Prisma doesn’t throw on init; queries fail until a real URL is set. */
const PLACEHOLDER_URL = "postgresql://127.0.0.1:5432/placeholder?connect_timeout=1";

function createPrisma() {
  const resolved = resolveDatabaseUrl();
  if (!resolved) {
    console.error(
      "[prisma] Missing or invalid DATABASE_URL. Use postgresql:// or postgres:// from Neon (Connection details). " +
        "Tried env keys: DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL. Remove quotes around the URL if copy-pasted."
    );
  }
  const url = resolved ?? PLACEHOLDER_URL;
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url } },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
