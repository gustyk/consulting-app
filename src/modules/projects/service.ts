import { prisma } from "@/lib/prisma/client";
import { generateProjectCode } from "@/lib/utils/number";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  MilestoneInput,
  DeliverableInput,
  PartnerInput,
} from "./types";

export const projectService = {
  async list(params: { status?: string; clientId?: string; search?: string } = {}) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.clientId) where.clientId = params.clientId;
    if (params.search) {
      where.OR = [
        { code: { contains: params.search, mode: "insensitive" } },
        { client: { name: { contains: params.search, mode: "insensitive" } } },
      ];
    }
    return prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, code: true } },
        _count: { select: { milestones: true, deliverables: true, partners: true } },
      },
    });
  },

  async getById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        proposal: { select: { number: true, total: true } },
        milestones: { orderBy: { dueDate: "asc" } },
        deliverables: { orderBy: { dueDate: "asc" }, include: { milestone: { select: { name: true } } } },
        partners: { include: { partner: { select: { fullName: true } } } },
      },
    });
  },

  async create(input: CreateProjectInput, createdById: string) {
    const code = await generateProjectCode();
    return prisma.project.create({
      data: {
        code,
        clientId: input.clientId,
        proposalId: input.proposalId || null,
        value: input.value,
        operationalCost: input.operationalCost ?? null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: input.status,
        createdById,
        milestones: input.milestones?.length
          ? { create: input.milestones.map((m) => ({
              name: m.name,
              description: m.description,
              dueDate: m.dueDate ? new Date(m.dueDate) : null,
              status: m.status,
            })) }
          : undefined,
        deliverables: input.deliverables?.length
          ? { create: input.deliverables.map((d) => ({
              name: d.name,
              description: d.description,
              fileUrl: d.fileUrl,
              dueDate: d.dueDate ? new Date(d.dueDate) : null,
              status: d.status,
              milestoneId: d.milestoneId || null,
            })) }
          : undefined,
        partners: input.partners?.length
          ? { create: input.partners.map((p) => ({
              partnerId: p.partnerId,
              role: p.role,
              revenuePercentage: p.revenuePercentage,
            })) }
          : undefined,
      },
      include: { client: true, milestones: true },
    });
  },

  async update(id: string, input: UpdateProjectInput) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw new Error("Project not found");

    const data: Record<string, unknown> = {
      clientId: input.clientId,
      proposalId: input.proposalId || null,
      value: input.value,
      operationalCost: input.operationalCost,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      status: input.status,
    };

    // Clean undefined values
    Object.keys(data).forEach((k) => { if (data[k] === undefined) delete data[k]; });

    return prisma.project.update({ where: { id }, data });
  },

  async updateStatus(id: string, status: string) {
    return prisma.project.update({ where: { id }, data: { status } });
  },

  async softDelete(id: string) {
    return prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async pipelineCounts() {
    const groups = await prisma.project.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    return groups.reduce<Record<string, number>>((acc, g) => {
      acc[g.status] = g._count._all;
      return acc;
    }, {});
  },

  async addMilestone(projectId: string, input: MilestoneInput) {
    return prisma.projectMilestone.create({
      data: {
        projectId,
        name: input.name,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: input.status,
      },
    });
  },

  async updateMilestone(id: string, input: MilestoneInput) {
    return prisma.projectMilestone.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: input.status,
      },
    });
  },

  async deleteMilestone(id: string) {
    return prisma.projectMilestone.delete({ where: { id } });
  },
};
