import { defineConfig } from "prisma/config";

// Prisma 7: connection config moved out of schema.prisma into prisma.config.ts.
// The runtime adapter (PrismaPg) is wired in src/lib/prisma/client.ts.
// `DATABASE_URL` (pooler) is used for migrations; `DATABASE_DIRECT_URL` is
// used for the direct connection needed by `migrate dev`.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    path: "prisma/migrations",
  },
});
