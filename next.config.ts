import type { NextConfig } from "next";

const prismaEngineFiles = "./node_modules/.prisma/client/**/*";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  // Ensure the query engine ships with every serverless bundle that imports Prisma (Vercel).
  outputFileTracingIncludes: {
    "/": [prismaEngineFiles],
    "/admin/**": [prismaEngineFiles],
    "/blog/**": [prismaEngineFiles],
    "/projects/**": [prismaEngineFiles],
    "/api/**": [prismaEngineFiles],
  },
};

export default nextConfig;
