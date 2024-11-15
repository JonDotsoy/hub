import { z } from "zod";

export const RoleSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});
