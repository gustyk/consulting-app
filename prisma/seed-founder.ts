import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

const connectionString =
  process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

const EMAIL = "founder@ibeza.app";
const PASSWORD = "Founder@12345";
const FULL_NAME = "Founder Ibeza";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // Check if already exists
  const existing = await prisma.profile.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`✓ Founder already exists: ${EMAIL}`);
    return;
  }

  // 1. Create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: FULL_NAME },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Failed to create founder auth user");

  const userId = data.user.id;

  // 2. Create profile (trigger also runs, but we upsert to be safe)
  await prisma.profile.upsert({
    where: { id: userId },
    update: { email: EMAIL, fullName: FULL_NAME, role: "founder", isActive: true },
    create: {
      id: userId,
      email: EMAIL,
      fullName: FULL_NAME,
      role: "founder",
      isActive: true,
    },
  });

  // 3. Link founder role
  const role = await prisma.role.findUnique({ where: { name: "founder" } });
  if (role) {
    await prisma.userRole.deleteMany({ where: { userId } });
    await prisma.userRole.create({ data: { userId, roleId: role.id } });
  }

  console.log("✓ Founder created:");
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  Role:     founder`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
