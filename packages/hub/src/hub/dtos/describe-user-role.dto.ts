import type { ConditionDTO } from "./condition.dto.js";

export type DescribeUserRoleDTO =
  | string
  | {
      role: string;
      condition: ConditionDTO;
    };
