import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CreateUserInput,
  UpdateUserInput,
  AssignRoleInput,
} from "./types";

export const userService = {
  async list() {
    return prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        userRoles: { include: { role: true } },
      },
    });
  },

  async getById(id: string) {
    return prisma.profile.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });
  },

  async create(input: CreateUserInput) {
    const supabase = createAdminClient();

    // 1. Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName ?? null },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Failed to create auth user");

    const userId = data.user.id;

    // 2. Upsert profile row (DB trigger may have already created it)
    await prisma.profile.upsert({
      where: { id: userId },
      update: {
        email: input.email,
        fullName: input.fullName,
        phone: input.phone,
        role: input.role,
      },
      create: {
        id: userId,
        email: input.email,
        fullName: input.fullName,
        phone: input.phone,
        role: input.role,
      },
    });

    // 3. Link role (idempotent: replace any existing)
    const role = await prisma.role.findUnique({
      where: { name: input.role },
    });
    if (role) {
      await prisma.userRole.deleteMany({ where: { userId } });
      await prisma.userRole.create({
        data: { userId, roleId: role.id },
      });
    }

    return userId;
  },

  async update(id: string, input: UpdateUserInput) {
    const supabase = createAdminClient();

    if (input.fullName !== undefined || input.phone !== undefined) {
      await supabase.auth.admin.updateUserById(id, {
        user_metadata: {
          full_name: input.fullName ?? undefined,
        },
      });
    }

    if (input.isActive === false) {
      await supabase.auth.admin.updateUserById(id, { ban_duration: "none" });
    } else if (input.isActive === true) {
      await supabase.auth.admin.updateUserById(id, { ban_duration: "0" });
    }

    // Role reassignment
    if (input.role) {
      const role = await prisma.role.findUnique({ where: { name: input.role } });
      if (role) {
        await prisma.userRole.deleteMany({ where: { userId: id } });
        await prisma.userRole.create({
          data: { userId: id, roleId: role.id },
        });
      }
    }

    return prisma.profile.update({
      where: { id },
      data: {
        fullName: input.fullName ?? null,
        phone: input.phone ?? null,
        role: input.role,
        isActive: input.isActive,
      },
    });
  },

  async deactivate(id: string) {
    const supabase = createAdminClient();
    await supabase.auth.admin.updateUserById(id, { ban_duration: "none" });
    return prisma.profile.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  },

  async assignRole(input: AssignRoleInput) {
    const role = await prisma.role.findUnique({ where: { name: input.role } });
    if (!role) throw new Error("Role not found");

    await prisma.userRole.deleteMany({ where: { userId: input.userId } });
    await prisma.userRole.create({
      data: { userId: input.userId, roleId: role.id },
    });
    return prisma.profile.update({
      where: { id: input.userId },
      data: { role: input.role },
    });
  },
};
