import { z } from "zod";

export const ROLES = ["founder", "officer", "partner", "finance"] as const;
export type RoleName = (typeof ROLES)[number];

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password min 8 chars"),
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(ROLES),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ROLES),
});
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
