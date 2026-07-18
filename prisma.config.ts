import { defineConfig } from "prisma/config";

// Prisma 7: connection config moved out of schema.prisma into prisma.config.ts.
// The runtime adapter (PrismaPg) is wired in src/lib/prisma/client.ts.
// `DATABASE_URL` (pooler) is used for migrations; `DATABASE_DIRECT_URL` is
// auto-read by the migrate engine for direct connections.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
