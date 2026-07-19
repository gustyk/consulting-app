"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireRole } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity/log";
import { userService } from "./service";
import {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
} from "./types";

export async function createUser(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.users.create);
  const data = createUserSchema.parse(input);

  const newId = await userService.create(data);
  await logActivity({
    action: "user.create",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "profiles",
    targetId: newId,
  });

  revalidatePath("/users");
  return newId;
}

export async function updateUser(id: string, input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.users.update);
  const data = updateUserSchema.parse(input);

  await userService.update(id, data);
  await logActivity({
    action: "user.update",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "profiles",
    targetId: id,
    previousValue: data as object,
  });

  revalidatePath("/users");
}

export async function deactivateUser(id: string) {
  const { user } = await requirePermission(PERMISSIONS.users.delete);
  await userService.deactivate(id);
  await logActivity({
    action: "user.delete",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "profiles",
    targetId: id,
  });
  revalidatePath("/users");
}

export async function assignUserRole(input: unknown) {
  const { user } = await requireRole("founder");
  const data = assignRoleSchema.parse(input);

  await userService.assignRole(data);
  await logActivity({
    action: "user.role_assign",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "profiles",
    targetId: data.userId,
    previousValue: data as object,
  });
  revalidatePath("/users");
}
