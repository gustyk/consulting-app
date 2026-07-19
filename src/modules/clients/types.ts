import { z } from "zod";

export const CLIENT_STATUSES = ["active", "inactive"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const picSchema = z.object({
  name: z.string().min(1, "PIC name required"),
  role: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});
export type Pic = z.infer<typeof picSchema>;

export const legalDocSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
});
export type LegalDoc = z.infer<typeof legalDocSchema>;

export const createClientSchema = z.object({
  name: z.string().min(1, "Client name required"),
  npwp: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(CLIENT_STATUSES),
  pic: z.array(picSchema).optional(),
  legalDocs: z.array(legalDocSchema).optional(),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = createClientSchema.partial();
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
