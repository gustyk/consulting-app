"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity/log";
import { projectService } from "./service";
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema,
} from "./types";

export async function createProject(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.projects.create);
  const data = createProjectSchema.parse(input);

  const project = await projectService.create(data, user.id);
  await logActivity({
    action: "project.create",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "projects",
    targetId: project.id,
  });

  revalidatePath("/projects");
  return project.id;
}

export async function updateProject(id: string, input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.projects.update);
  const data = updateProjectSchema.parse(input);

  await projectService.update(id, data);
  await logActivity({
    action: "project.update",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "projects",
    targetId: id,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
}

export async function updateProjectStatus(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.projects.update);
  const data = updateProjectStatusSchema.parse(input);

  await projectService.updateStatus(data.id, data.status);
  await logActivity({
    action: "project.status_change",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "projects",
    targetId: data.id,
    metadata: { newStatus: data.status },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${data.id}`);
}

export async function deleteProject(id: string) {
  const { user } = await requirePermission(PERMISSIONS.projects.delete);
  await projectService.softDelete(id);
  await logActivity({
    action: "project.delete",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "projects",
    targetId: id,
  });
  revalidatePath("/projects");
}
