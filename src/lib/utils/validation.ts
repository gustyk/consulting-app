import { z } from "zod";

// Shared base schemas used across modules
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const idParamSchema = z.object({ id: uuidSchema });

// Soft-delete aware base filter
export const baseFilterSchema = z.object({
  status: z.string().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
});
