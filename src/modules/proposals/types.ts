import { z } from "zod";

export const PROPOSAL_STATUSES = [
  "draft",
  "waiting_approval",
  "approved",
  "sent",
  "accepted",
  "rejected",
  "expired",
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const proposalItemSchema = z.object({
  service: z.string().min(1, "Service required"),
  description: z.string().optional(),
  qty: z.number().int().min(1),
  unitPrice: z.number().int().min(0), // in IDR cents
  discountPct: z.number().min(0).max(100),
  taxPct: z.number().min(0).max(100),
});
export type ProposalItem = z.infer<typeof proposalItemSchema>;
export type ProposalItemInput = ProposalItem;

export const createProposalSchema = z.object({
  clientId: z.string().uuid("Select a client"),
  validUntil: z.string().optional(),
  items: z.array(proposalItemSchema).min(1, "At least one item required"),
});
export type CreateProposalInput = z.infer<typeof createProposalSchema>;

export const updateProposalSchema = createProposalSchema.partial();
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;

export const approveProposalSchema = z.object({
  id: z.string().uuid(),
});
export type ApproveProposalInput = z.infer<typeof approveProposalSchema>;

export const sendProposalSchema = z.object({
  id: z.string().uuid(),
});
export type SendProposalInput = z.infer<typeof sendProposalSchema>;

export const acceptProposalSchema = z.object({
  id: z.string().uuid(),
});
export type AcceptProposalInput = z.infer<typeof acceptProposalSchema>;

export const rejectProposalSchema = z.object({
  id: z.string().uuid(),
});
export type RejectProposalInput = z.infer<typeof rejectProposalSchema>;