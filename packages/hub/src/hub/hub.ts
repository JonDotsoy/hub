import { get } from "@jondotsoy/utils-js/get";
import { evaluateCondition } from "./condition/condition.js";
import type { DescribePrincipalWithRoleDTO } from "./dtos/describe-principal-with-role.dto.js";
import type { RoleDTO } from "./dtos/role.dto.js";
import type { IsAllowedOptionsDTO } from "./dtos/is-alloword-options.dto.js";
import type { HubManifest } from "../hub-manifest/hub-manifest-schema.js";

export type { DescribePrincipalWithRoleDTO } from "./dtos/describe-principal-with-role.dto.js";
export type { RoleDTO } from "./dtos/role.dto.js";
export type { IsAllowedOptionsDTO } from "./dtos/is-alloword-options.dto.js";

export class Hub {
  permissions = new Set<string>();
  roles = new Map<string, RoleDTO>();
  principals = new Map<
    string,
    { roles: Map<string, true | DescribePrincipalWithRoleDTO> }
  >();

  /**
   *
   */
  async isAllowed(options: IsAllowedOptionsDTO) {
    const principal = this.principals.get(options.principalId);

    for (const [roleName, roleOptions] of principal?.roles ?? []) {
      const permissions = new Set(this.roles.get(roleName)?.permissions);
      if (permissions?.has(options.action)) {
        if (typeof roleOptions === "object") {
          return evaluateCondition(roleOptions.condition, options.resource);
        }

        return true;
      }
    }

    return false;
  }

  async attachPermission(roleName: string, permissions: string[]) {
    const role = this.roles.get(roleName);
    if (!role) return;
    role.permissions = Array.from(
      new Set([...(role.permissions ?? []), ...permissions]),
    );
  }

  async createPrincipal(
    principalId: string,
    options?: { roles?: DescribePrincipalWithRoleDTO[] },
  ) {
    const roles = new Map<string, true | DescribePrincipalWithRoleDTO>(
      options?.roles?.map((role) =>
        typeof role === "string"
          ? ([role, true] as const)
          : ([role.role, role] as const),
      ),
    );

    for (const [roleName] of roles) {
      if (!this.roles.has(roleName))
        throw new Error(`Role ${roleName} not found`);
    }

    this.principals.set(principalId, {
      roles,
    });
  }
  async createRole(
    roleId: string,
    role?: Pick<RoleDTO, Exclude<keyof RoleDTO, "id">>,
  ) {
    // check all actions are created
    if (role)
      for (const permission of role.permissions ?? [])
        if (!this.permissions.has(permission)) {
          throw new Error(`Permission ${permission} not found`);
        }

    this.roles.set(roleId, { id: roleId, permissions: [], ...role });
  }

  async createPermission(permissionId: string) {
    this.permissions.add(permissionId);
  }

  listRoles(): Iterable<RoleDTO> {
    return this.roles.values();
  }

  toJSON(): unknown {
    return {
      permissions: Array.from(this.permissions),
      roles: Array.from(this.roles.values()),
      principals: Array.from(
        this.principals.entries(),
        ([principalId, principal]) => {
          return {
            id: principalId,
            roles: Array.from(principal.roles.keys()),
          };
        },
      ),
    } as HubManifest;
  }

  static async from(state: unknown) {
    const hub = new Hub();

    for (const permissionAlt of get.array(state, "permissions") ?? []) {
      const permission = get.string(permissionAlt);
      if (permission) await hub.createPermission(permission);
    }

    for (const roleAlt of get.array(state, "roles") ?? []) {
      const roleId = get.string(roleAlt, "id");
      const roleTitle = get.string(roleAlt, "title");
      const roleDescription = get.string(roleAlt, "description");
      const rolePermissions =
        get
          .array(roleAlt, "permissions")
          ?.filter((permission) => typeof permission === "string") ?? [];

      if (roleId)
        await hub.createRole(roleId, {
          title: roleTitle,
          description: roleDescription,
          permissions: rolePermissions,
        });
    }

    for (const principal of get.array(state, "principals") ?? []) {
      const principalId = get.string(principal, "id");
      if (principalId) {
        const roles =
          get
            .array(principal, "roles")
            ?.map((role) => {
              const roleId =
                typeof role === "string" ? role : get.string(role, "role");
              if (!roleId) return null;
              const condition = get.record(role, "condition");
              if (condition) {
                return {
                  role: roleId,
                  condition,
                } as DescribePrincipalWithRoleDTO;
              } else {
                return roleId;
              }
            })
            .filter((e) => e !== null) ?? [];

        await hub.createPrincipal(principalId, { roles });
      }
    }

    return hub;
  }
}
