"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity/log";
import { clientService } from "./service";
import { createClientSchema, updateClientSchema } from "./types";

export async function createClient(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.clients.create);
  const data = createClientSchema.parse(input);

  const client = await clientService.create(data, user.id);
  await logActivity({
    action: "client.create",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "clients",
    targetId: client.id,
  });

  revalidatePath("/clients");
  return client.id;
}

export async function updateClient(id: string, input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.clients.update);
  const data = updateClientSchema.parse(input);

  await clientService.update(id, data);
  await logActivity({
    action: "client.update",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "clients",
    targetId: id,
    previousValue: data,
  });

  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  const { user } = await requirePermission(PERMISSIONS.clients.delete);
  await clientService.softDelete(id);
  await logActivity({
    action: "client.delete",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "clients",
    targetId: id,
  });
  revalidatePath("/clients");
}
