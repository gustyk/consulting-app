import { prisma } from "@/lib/prisma/client";
import { generateLeadCode } from "@/lib/utils/number";
import type {
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
  LeadStatus,
} from "./types";

export const leadService = {
  async list(params: { status?: string; search?: string } = {}) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { company: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }
    return prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { assigned: { select: { fullName: true } } },
    });
  },

  async getById(id: string) {
    return prisma.lead.findUnique({ where: { id } });
  },

  async create(input: CreateLeadInput, createdById: string) {
    const code = await generateLeadCode();
    return prisma.lead.create({
      data: {
        code,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        company: input.company || null,
        source: input.source || null,
        serviceInterest: input.serviceInterest || null,
        status: input.status,
        assignedTo: input.assignedTo || null,
        notes: input.notes || null,
        estimatedValue: input.estimatedValue ?? null,
        createdById,
      },
    });
  },

  async update(id: string, input: UpdateLeadInput) {
    return prisma.lead.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        company: input.company || null,
        source: input.source || null,
        serviceInterest: input.serviceInterest || null,
        status: input.status,
        assignedTo: input.assignedTo || null,
        notes: input.notes || null,
        estimatedValue: input.estimatedValue ?? null,
      },
    });
  },

  async updateStatus(input: UpdateLeadStatusInput) {
    return prisma.lead.update({
      where: { id: input.id },
      data: { status: input.status as LeadStatus },
    });
  },

  async softDelete(id: string) {
    return prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async pipelineCounts() {
    const groups = await prisma.lead.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    return groups.reduce<Record<string, number>>((acc, g) => {
      acc[g.status] = g._count._all;
      return acc;
    }, {});
  },
};
