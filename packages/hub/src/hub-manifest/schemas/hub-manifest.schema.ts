import { z } from "zod";
import { RoleSchema } from "./role.schema.js";

export const HubManifestSchema = z.object({
  $schema: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  roles: z.array(RoleSchema).optional(),
  users: z.array(z.string()).optional(),
});
