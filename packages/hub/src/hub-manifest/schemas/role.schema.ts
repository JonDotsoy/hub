import { z } from "zod";
import type { RoleDTO } from "../../hub/dtos/role.dto";

export const RoleSchema: z.ZodType<RoleDTO> = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});
