import { z } from "zod";
import type { PrincipalDTO } from "../../hub/dtos/principal.dto.js";
import { DescribePrincipalWithRoleSchema } from "./describe-principal-with-role.schema.js";

export const PrincipalSchema: z.ZodType<PrincipalDTO> = z.object({
  id: z.string(),
  roles: z.array(DescribePrincipalWithRoleSchema),
});
