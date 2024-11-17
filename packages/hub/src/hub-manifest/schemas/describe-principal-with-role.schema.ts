import { z } from "zod";
import type { DescribePrincipalWithRoleDTO } from "../../hub/dtos/describe-principal-with-role.dto.js";
import { ConditionSchema } from "./condition.schema.js";

export const DescribePrincipalWithRoleSchema: z.ZodType<DescribePrincipalWithRoleDTO> =
  z.union([
    z.string(),
    z.object({
      role: z.string(),
      condition: ConditionSchema,
    }),
  ]);
