import type { ConditionDTO } from "./condition.dto.js";

export type DescribePrincipalWithRoleDTO =
  | string
  | {
      role: string;
      condition: ConditionDTO;
    };
