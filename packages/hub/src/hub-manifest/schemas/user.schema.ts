import { z } from "zod";
import type { User } from "../../hub/dtos/user.dto.js";
import { DescribeUserRoleSchema } from "./describe-user-role.schema.js";

export const UserSchema: z.ZodType<User> = z.object({
  id: z.string(),
  roles: z.array(DescribeUserRoleSchema),
});
