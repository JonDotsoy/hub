import { get } from "@jondotsoy/utils-js/get";
import { evaluateCondition } from "./condition/condition.js";
import type { DescribeUserRoleDTO } from "./dtos/describe-user-role.dto.js";
import type { RoleDTO } from "./dtos/role.dto.js";

export class Hub {
  actions = new Set<string>();
  roles = new Map<string, RoleDTO>();
  users = new Map<string, { roles: Map<string, true | DescribeUserRoleDTO> }>();

  /**
   *
   */
  async isAllowed(options: { userId: string; resource?: any; action: string }) {
    const user = this.users.get(options.userId);

    for (const [roleName, roleOptions] of user?.roles ?? []) {
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

  async createUser(
    userName: string,
    options?: { roles?: DescribeUserRoleDTO[] },
  ) {
    const roles = new Map<string, true | DescribeUserRoleDTO>(
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

    this.users.set(userName, {
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
        if (!this.actions.has(permission)) {
          throw new Error(`Permission ${permission} not found`);
        }

    this.roles.set(roleId, { id: roleId, permissions: [], ...role });
  }

  async createAction(permissionName: string) {
    this.actions.add(permissionName);
  }

  listRoles(): Iterable<RoleDTO> {
    return this.roles.values();
  }

  static async from(state: unknown) {
    const hub = new Hub();

    for (const permissionAlt of get.array(state, "permissions") ?? []) {
      const permission = get.string(permissionAlt);
      if (permission) await hub.createAction(permission);
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

    for (const user of get.array(state, "users") ?? []) {
      const userId = get.string(user, "id");
      if (userId) {
        const roles =
          get
            .array(user, "roles")
            ?.map((role) => {
              const roleId =
                typeof role === "string" ? role : get.string(role, "role");
              if (!roleId) return null;
              const condition = get.record(role, "condition");
              if (condition) {
                return {
                  role: roleId,
                  condition,
                } as DescribeUserRoleDTO;
              } else {
                return roleId;
              }
            })
            .filter((e) => e !== null) ?? [];

        await hub.createUser(userId, { roles });
      }
    }

    return hub;
  }
}
