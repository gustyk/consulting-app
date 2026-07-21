"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireRole } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity/log";
import { proposalService } from "./service";
import {
  createProposalSchema,
  updateProposalSchema,
  approveProposalSchema,
  sendProposalSchema,
  acceptProposalSchema,
  rejectProposalSchema,
} from "./types";

export async function createProposal(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.proposals.create);
  const data = createProposalSchema.parse(input);

  const proposal = await proposalService.create(data, user.id);
  await logActivity({
    action: "proposal.create",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "proposals",
    targetId: proposal.id,
  });

  revalidatePath("/proposals");
  return proposal.id;
}

export async function updateProposal(id: string, input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.proposals.update);
  const data = updateProposalSchema.parse(input);

  const before = await proposalService.getById(id);
  await proposalService.update(id, data);
  await logActivity({
    action: "proposal.update",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "proposals",
    targetId: id,
    previousValue: before,
  });

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${id}`);
}

export async function submitProposalForApproval(id: string) {
  const { user } = await requirePermission(PERMISSIONS.proposals.update);
  const proposal = await proposalService.submitForApproval(id);
  await logActivity({
    action: "proposal.submit_approval",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "proposals",
    targetId: id,
    metadata: { newStatus: proposal.status },
  });
  revalidatePath("/proposals");
  revalidatePath(`/proposals/${id}`);
  return proposal.status;
}

export async function approveProposal(input: unknown) {
  const { user } = await requireRole("founder");
  const data = approveProposalSchema.parse(input);

  await proposalService.approve(data.id, user.id);
  await logActivity({
    action: "proposal.approve",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "proposals",
    targetId: data.id,
  });
  revalidatePath("/proposals");
  revalidatePath(`/proposals/${data.id}`);
}

export async function sendProposal(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.proposals.update);
  const data = sendProposalSchema.parse(input);

  await proposalService.send(data.id);
  await logActivity({
    action: "proposal.send",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "proposals",
    targetId: data.id,
  });
  revalidatePath("/proposals");
  revalidatePath(`/proposals/${data.id}`);
}

export async function acceptProposal(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.proposals.update);
  const data = acceptProposalSchema.parse(input);

  await proposalService.accept(data.id);
  await logActivity({
    action: "proposal.accept",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "proposals",
    targetId: data.id,
  });
  revalidatePath("/proposals");
  revalidatePath(`/proposals/${data.id}`);
}

export async function rejectProposal(input: unknown) {
  const { user } = await requirePermission(PERMISSIONS.proposals.update);
  const data = rejectProposalSchema.parse(input);

  await proposalService.reject(data.id);
  await logActivity({
    action: "proposal.reject",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "proposals",
    targetId: data.id,
  });
  revalidatePath("/proposals");
  revalidatePath(`/proposals/${data.id}`);
}

export async function deleteProposal(id: string) {
  const { user } = await requirePermission(PERMISSIONS.proposals.delete);
  await proposalService.softDelete(id);
  await logActivity({
    action: "proposal.delete",
    actorId: user.id,
    actorName: user.fullName,
    targetType: "proposals",
    targetId: id,
  });
  revalidatePath("/proposals");
}