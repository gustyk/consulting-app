import { z } from "zod";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "meeting_scheduled",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  "referral",
  "website",
  "linkedin",
  "cold_call",
  "event",
  "other",
] as const;

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  serviceInterest: z.string().optional(),
  status: z.enum(LEAD_STATUSES),
  assignedTo: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().optional(),
  estimatedValue: z.number().int().min(0).optional(),
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema.partial();
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const updateLeadStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(LEAD_STATUSES),
});
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
