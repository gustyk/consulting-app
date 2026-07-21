import { prisma } from "@/lib/prisma/client";
import { generateProposalNumber } from "@/lib/utils/number";
import type {
  CreateProposalInput,
  UpdateProposalInput,
  ProposalStatus,
} from "./types";

const APPROVAL_THRESHOLD = 50_000_000_00; // Rp50jt in cents

function calculateTotals(items: { qty: number; unitPrice: number; discountPct: number; taxPct: number }[]) {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  for (const item of items) {
    const lineSubtotal = item.unitPrice * item.qty;
    const lineDiscount = Math.round(lineSubtotal * (item.discountPct / 100));
    const lineTaxable = lineSubtotal - lineDiscount;
    const lineTax = Math.round(lineTaxable * (item.taxPct / 100));

    subtotal += lineSubtotal;
    totalDiscount += lineDiscount;
    totalTax += lineTax;
  }

  return { subtotal, discount: totalDiscount, tax: totalTax, total: subtotal - totalDiscount + totalTax };
}

function needsTotalApproval(subtotal: number, discount: number): boolean {
  if (subtotal > APPROVAL_THRESHOLD) return true;
  if (discount > 0 && discount / subtotal > 0.1) return true;
  return false;
}

export const proposalService = {
  async list(params: { status?: string; clientId?: string; search?: string } = {}) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.clientId) where.clientId = params.clientId;
    if (params.search) {
      where.OR = [
        { number: { contains: params.search, mode: "insensitive" } },
        { client: { name: { contains: params.search, mode: "insensitive" } } },
      ];
    }
    return prisma.proposal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true, code: true } }, approver: { select: { fullName: true } } },
    });
  },

  async getById(id: string) {
    return prisma.proposal.findUnique({
      where: { id },
      include: {
        client: true,
        items: { orderBy: { createdAt: "asc" } },
        approver: { select: { fullName: true } },
        creator: { select: { fullName: true } },
      },
    });
  },

  async create(input: CreateProposalInput, createdById: string) {
    const number = await generateProposalNumber();
    const { subtotal, discount, tax, total } = calculateTotals(input.items);

    const status: ProposalStatus = needsTotalApproval(subtotal, discount) ? "waiting_approval" : "draft";

    return prisma.proposal.create({
      data: {
        number,
        clientId: input.clientId,
        status,
        subtotal,
        discount,
        tax,
        total,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        createdById,
        items: {
          create: input.items.map((it) => ({
            service: it.service,
            description: it.description,
            qty: it.qty,
            unitPrice: it.unitPrice,
            discountPct: it.discountPct,
            taxPct: it.taxPct,
          })),
        },
      },
      include: { client: true, items: true },
    });
  },

  async update(id: string, input: UpdateProposalInput) {
    const existing = await prisma.proposal.findUnique({ where: { id } });
    if (!existing) throw new Error("Proposal not found");

    const items = input.items;
    const { subtotal, discount, tax, total } = items ? calculateTotals(items) : { subtotal: existing.subtotal, discount: existing.discount, tax: existing.tax, total: existing.total };
    const status = items ? (needsTotalApproval(subtotal, discount) ? "waiting_approval" : "draft") : undefined;

    const data: Record<string, unknown> = {
      clientId: input.clientId,
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      subtotal,
      discount,
      tax,
      total,
    };
    if (status) data.status = status;

    const update = prisma.proposal.update({ where: { id }, data } as never);

    const itemOps = items
      ? [
          prisma.proposalItem.deleteMany({ where: { proposalId: id } }),
          prisma.proposalItem.createMany({
            data: items.map((it) => ({
              proposalId: id,
              service: it.service,
              description: it.description,
              qty: it.qty,
              unitPrice: it.unitPrice,
              discountPct: it.discountPct,
              taxPct: it.taxPct,
            })),
          }),
        ]
      : [];

    const [result] = await prisma.$transaction([update, ...itemOps]);
    return result;
  },

  async submitForApproval(id: string) {
    return prisma.proposal.update({ where: { id }, data: { status: "waiting_approval" } });
  },

  async approve(id: string, approvedById: string) {
    return prisma.proposal.update({
      where: { id },
      data: { status: "approved", approvedById, approvedAt: new Date() },
    });
  },

  async send(id: string) {
    return prisma.proposal.update({ where: { id }, data: { status: "sent", sentAt: new Date() } });
  },

  async accept(id: string) {
    return prisma.proposal.update({ where: { id }, data: { status: "accepted", acceptedAt: new Date() } });
  },

  async reject(id: string) {
    return prisma.proposal.update({ where: { id }, data: { status: "rejected", rejectedAt: new Date() } });
  },

  async softDelete(id: string) {
    return prisma.proposal.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async pipelineCounts() {
    const groups = await prisma.proposal.groupBy({
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