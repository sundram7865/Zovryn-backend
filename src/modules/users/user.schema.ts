import { z } from "zod";

export const updateRoleSchema = z.object({
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const userListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
  isActive: z
    .string()
    .transform((v) => v === "true")
    .optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;