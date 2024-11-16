import { it, describe, expect } from "bun:test";
import { Hub } from "./hub";
import type { HubManifest } from "../hub-manifest/hub-manifest-schema";

describe("Hub", () => {
  it("can be instantiated", () => {
    new Hub();
  });

  it("can create a permission", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
  });

  it("can create a role", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
    await hub.createRole("taz", { permissions: ["foo"] });
  });

  it("can attach a permission to a role", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
    await hub.createRole("taz");
    await hub.attachPermission("taz", ["foo"]);
  });

  it("can create a user", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
    await hub.createRole("taz", { permissions: ["foo"] });
    await hub.createUser("biz", { roles: ["taz"] });
  });

  it("can create a user with a conditional role", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
    await hub.createRole("taz", { permissions: ["foo"] });
    await hub.createUser("biz", {
      roles: [
        {
          role: "taz",
          condition: {
            equal: ["name", "lol"],
          },
        },
      ],
    });
  });

  it("can check if a user is allowed to perform an action", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
    await hub.createRole("taz", { permissions: ["foo"] });
    await hub.createUser("biz", { roles: ["taz"] });

    expect(
      await hub.isAllowed({
        userId: "biz",
        resource: { name: "lol" },
        action: "foo",
      }),
    ).toBeTrue();
  });

  it("can check if a user is not allowed to perform an action", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
    await hub.createRole("taz", { permissions: ["foo"] });
    await hub.createUser("biz", {
      roles: [
        {
          role: "taz",
          condition: {
            equal: ["name", "lol"],
          },
        },
      ],
    });

    expect(
      await hub.isAllowed({
        userId: "biz",
        resource: { name: "zoom" },
        action: "foo",
      }),
    ).toBeFalse();
  });

  it("can check if a user is not allowed to perform an action with empty resource", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
    await hub.createRole("taz", { permissions: ["foo"] });
    await hub.createUser("biz", {
      roles: [
        {
          role: "taz",
          condition: {
            equal: ["name", "lol"],
          },
        },
      ],
    });

    expect(
      await hub.isAllowed({
        userId: "biz",
        resource: {},
        action: "foo",
      }),
    ).toBeFalse();
  });

  it("can check if a user is allowed to perform an action with a matching condition", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
    await hub.createRole("taz", { permissions: ["foo"] });
    await hub.createUser("biz", {
      roles: [
        {
          role: "taz",
          condition: {
            equal: ["name", "lol"],
          },
        },
      ],
    });

    expect(
      await hub.isAllowed({
        userId: "biz",
        resource: { name: "lol" },
        action: "foo",
      }),
    ).toBeTrue();
  });

  it("can list roles", async () => {
    const hub = new Hub();

    await hub.createAction("foo");
    await hub.createRole("taz", { permissions: ["foo"] });
    await hub.createUser("biz", {
      roles: [
        {
          role: "taz",
          condition: {
            equal: ["name", "lol"],
          },
        },
      ],
    });

    const roles = [...(await hub.listRoles())];

    expect(roles).toEqual([
      {
        id: "taz",
        permissions: ["foo"],
      },
    ]);
  });
});

describe("Hub.from", () => {
  it("can be instantiated from a json object", async () => {
    const hub = await Hub.from({} satisfies HubManifest);

    const roles = [...hub.listRoles()];

    expect(roles).toEqual([]);
  });
  it("can be instantiated from a json object with roles", async () => {
    const hub = await Hub.from({
      permissions: ["foo"],
      roles: [
        {
          id: "taz",
          permissions: ["foo"],
        },
      ],
    } satisfies HubManifest);

    const roles = [...hub.listRoles()];

    expect(roles).toEqual([
      {
        id: "taz",
        permissions: ["foo"],
      },
    ]);
  });
});

describe("Hub error handling", () => {
  it("throws an error if an action does not exist", () => {
    const hub = new Hub();

    expect(
      hub.createRole("taz", {
        permissions: ["foo"],
      }),
    ).rejects.toThrowError();
  });

  it("throws an error if a role does not exist", () => {
    const hub = new Hub();

    expect(
      hub.createUser("taz", {
        roles: ["foo"],
      }),
    ).rejects.toThrowError();
  });
});

it("can check if a user is allowed to perform an action from manifest", async () => {
  const manifest: HubManifest = {
    permissions: ["users.list", "users.create", "users.delete"],
    roles: [
      { id: "rrhh", permissions: ["users.list", "users.create"] },
      {
        id: "admin",
        permissions: ["users.list", "users.create", "users.delete"],
      },
    ],
    users: [
      { id: "bob", roles: ["rrhh"] },
      { id: "alice", roles: ["admin"] },
    ],
  };

  const hub = await Hub.from(manifest);

  expect(
    await hub.isAllowed({ userId: "bob", action: "users.list" }),
  ).toBeTrue();
});

it("can check if a user is allowed to perform an action with a condition from manifest", async () => {
  const manifest: HubManifest = {
    permissions: ["users.list", "users.create", "users.delete"],
    roles: [
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
    ],
  };

  const hub = await Hub.from(manifest);

  expect(
    await hub.isAllowed({
      userId: "alice",
      resource: {
        group: {
          office: "NY",
        },
      },
      action: "users.delete",
    }),
  ).toBeTrue();
});
