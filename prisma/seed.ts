import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../src/lib/auth/permissions";

const connectionString =
  process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

async function main() {
  // Upsert roles
  const roles = ["founder", "officer", "partner", "finance"];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
  }

  // Flatten all permissions and upsert
  const allPerms = new Set<string>();
  Object.values(PERMISSIONS).forEach((g) =>
    Object.values(g).forEach((p) => allPerms.add(p)),
  );

  for (const key of allPerms) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: key },
    });
  }

  // Link role → permissions
  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;
    for (const permKey of perms) {
      const perm = await prisma.permission.findUnique({
        where: { key: permKey },
      });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: perm.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  console.log("✓ Seed complete: roles, permissions, role_permissions");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
