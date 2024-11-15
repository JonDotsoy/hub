import { z } from "zod";
import type { DescribeUserRoleDTO } from "../../hub/dtos/describe-user-role.dto.js";
import { ConditionSchema } from "./condition.schema.js";

export const DescribeUserRoleSchema: z.ZodType<DescribeUserRoleDTO> = z.union([
  z.string(),
  z.object({
    role: z.string(),
    condition: ConditionSchema,
  }),
]);
