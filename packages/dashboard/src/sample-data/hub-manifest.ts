import type { HubManifest } from "../../../hub/src/hub-manifest/hub-manifest-schema";

export const manifest: HubManifest = {
  permissions: [
    "users.list",
    "users.create",
    "users.delete",
    "platform.view",
    "platform.write",
    "sales.list",
    "sales.read",
    "sales.write",
  ],
  roles: [
    {
      id: "auditor",
      permissions: ["users.list", "platform.view", "sales.list", "sales.read"],
    },
    { id: "rrhh", permissions: ["users.list", "users.create"] },
    {
      id: "admin",
      permissions: ["users.list", "users.create", "users.delete"],
    },
  ],
  users: [
    { id: "bob", roles: ["rrhh"] },
    {
      id: "alice",
      roles: [
        {
          role: "admin",
          condition: {
            equal: ["group.office", "NY"],
          },
        },
      ],
    },
    {
      id: "carl",
      roles: ["auditor", "rrhh"],
    },
  ],
};
