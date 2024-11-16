import type { DescribeUserRoleDTO } from "./describe-user-role.dto";

export type User = {
  id: string;
  roles?: DescribeUserRoleDTO[];
};
