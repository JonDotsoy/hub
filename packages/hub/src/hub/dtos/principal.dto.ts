import type { DescribePrincipalWithRoleDTO } from "./describe-principal-with-role.dto";

export type PrincipalDTO = {
  id: string;
  roles?: DescribePrincipalWithRoleDTO[];
};
