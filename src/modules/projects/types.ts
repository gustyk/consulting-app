import { z } from "zod";

export const PROJECT_STATUSES = [
  "preparation",
  "gap_assessment",
  "documentation",
  "implementation",
  "internal_audit",
  "certification_audit",
  "closed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const milestoneSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
});
export type MilestoneInput = z.infer<typeof milestoneSchema>;

export const deliverableSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "submitted", "approved"]).default("pending"),
  milestoneId: z.string().uuid().optional().or(z.literal("")),
});
export type DeliverableInput = z.infer<typeof deliverableSchema>;

export const partnerSchema = z.object({
  partnerId: z.string().uuid(),
  role: z.string().optional(),
  revenuePercentage: z.number().min(0).max(100).optional(),
});
export type PartnerInput = z.infer<typeof partnerSchema>;

export const createProjectSchema = z.object({
  clientId: z.string().uuid("Select a client"),
  proposalId: z.string().uuid().optional().or(z.literal("")),
  value: z.number().int().min(0).default(0),
  operationalCost: z.number().int().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(PROJECT_STATUSES).default("preparation"),
  milestones: z.array(milestoneSchema).optional(),
  deliverables: z.array(deliverableSchema).optional(),
  partners: z.array(partnerSchema).optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const updateProjectStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(PROJECT_STATUSES),
});
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;
