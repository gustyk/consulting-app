"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity/log";
import { leadService } from "./service";
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
} from "./types";

export async function createLead(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.leads.create);
  const data = createLeadSchema.parse(input);

  const lead = await leadService.create(data, user.id);
  await logActivity({
    action: "lead.create",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "leads",
    targetId: lead.id,
  });

  revalidatePath("/crm");
  return lead.id;
}

export async function updateLead(id: string, input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.leads.update);
  const data = updateLeadSchema.parse(input);

  await leadService.update(id, data);
  await logActivity({
    action: "lead.update",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "leads",
    targetId: id,
    previousValue: data,
  });

  revalidatePath("/crm");
}

export async function updateLeadStatus(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.leads.update);
  const data = updateLeadStatusSchema.parse(input);

  const before = await leadService.getById(data.id);
  await leadService.updateStatus(data);
  await logActivity({
    action: "lead.status_change",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "leads",
    targetId: data.id,
    previousValue: { status: before?.status },
    metadata: { newStatus: data.status },
  });

  revalidatePath("/crm");
}

export async function deleteLead(id: string) {
  const { user } = await requirePermission(PERMISSIONS.leads.delete);
  await leadService.softDelete(id);
  await logActivity({
    action: "lead.delete",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "leads",
    targetId: id,
  });
  revalidatePath("/crm");
}
