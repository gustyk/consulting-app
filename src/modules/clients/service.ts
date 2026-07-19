import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";
import { generateClientCode } from "@/lib/utils/number";
import type {
  CreateClientInput,
  UpdateClientInput,
  ClientStatus,
} from "./types";

export const clientService = {
  async list(params: { search?: string; status?: string } = {}) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { npwp: { contains: params.search, mode: "insensitive" } },
      ];
    }
    return prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.client.findUnique({ where: { id } });
  },

  async create(input: CreateClientInput, createdById: string) {
    const code = await generateClientCode();
    return prisma.client.create({
      data: {
        code,
        name: input.name,
        npwp: input.npwp || null,
        address: input.address || null,
        status: input.status,
        pic: (input.pic ?? []) as unknown as Prisma.InputJsonValue,
        legalDocs: (input.legalDocs ?? []) as unknown as Prisma.InputJsonValue,
        createdById,
      },
    });
  },

  async update(id: string, input: UpdateClientInput) {
    return prisma.client.update({
      where: { id },
      data: {
        name: input.name,
        npwp: input.npwp || null,
        address: input.address || null,
        status: input.status as ClientStatus,
        pic: input.pic ? ((input.pic ?? []) as unknown as Prisma.InputJsonValue) : undefined,
        legalDocs: input.legalDocs
          ? ((input.legalDocs ?? []) as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });
  },

  async softDelete(id: string) {
    return prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
