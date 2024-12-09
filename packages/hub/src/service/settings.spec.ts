import { describe, it, beforeAll, expect, mock } from "bun:test";
import * as fs from "fs/promises";
import { loadSettings } from "./settings.js";
import type { HubManifest } from "../hub-manifest/hub-manifest-schema.js";

const useServer = (loadPayload: (req: Request) => Response) => {
  const server = Bun.serve({
    port: 56789,
    fetch: (req) => loadPayload(req),
  });

  return {
    url: server.url,
    server,
    [Symbol.dispose]() {
      server.stop(true);
    },
  };
};

describe("loadSettings", () => {
  it("loads settings from a YAML manifest", async () => {
    const manifestPath = new URL(
      "__samples__/manifest_formats/manifest.yaml",
      import.meta.url,
    );

    const settings = await loadSettings({
      MANIFEST_LOCATION: manifestPath.pathname.toString(),
    });

    expect(settings.hubSchema?.get()).toMatchSnapshot();
  });

  it("loads settings from a JSON manifest", async () => {
    const manifestPath = new URL(
      "__samples__/manifest_formats/manifest.json",
      import.meta.url,
    );

    const settings = await loadSettings({
      MANIFEST_LOCATION: manifestPath.pathname.toString(),
    });

    expect(settings.hubSchema?.get()).toMatchSnapshot();
  });

  it("loads settings from a JSON manifest served by a mock server", async () => {
    const fn = mock(() => {
      const body: HubManifest = {
        principals: [{ id: "asd", roles: ["asd"] }],
        roles: [
          {
            id: "asd",
            permissions: ["asd"],
          },
        ],
        permissions: ["asd"],
      };
      return Response.json(body);
    });

    using server = useServer(fn);

    const manifestPath = new URL("manifest.json", server.url);

    const settings = await loadSettings({
      MANIFEST_LOCATION: manifestPath.toString(),
    });

    expect(settings.hubSchema?.get()).toMatchSnapshot();
  });

  it("loads settings from a manifest served by a mock server without extension", async () => {
    const fn = mock(() => {
      const body: HubManifest = {
        principals: [{ id: "asd", roles: ["asd"] }],
        roles: [
          {
            id: "asd",
            permissions: ["asd"],
          },
        ],
        permissions: ["asd"],
      };
      return Response.json(body);
    });

    using server = useServer(fn);

    const manifestPath = new URL("manifest", server.url);

    const settings = await loadSettings({
      MANIFEST_LOCATION: manifestPath.toString(),
    });

    expect(settings.hubSchema?.get()).toMatchSnapshot();
  });

  it("loads settings from a manifest served by a mock server with SSE", async () => {
    const hubManifest: HubManifest = {
      principals: [{ id: "asd", roles: ["asd"] }],
      roles: [
        {
          id: "asd",
          permissions: ["asd"],
        },
      ],
      permissions: ["asd"],
    };

    let fetches = 0;

    const fn = mock((req: Request) => {
      const url = new URL(req.url);

      if (url.pathname === "/manifest") {
        fetches++;
        return Response.json(hubManifest, {
          headers: {
            "X-Content-Refresh": new URL(
              "/manifest-watching",
              req.url,
            ).toString(),
          },
        });
      }

      if (url.pathname === "/manifest-watching") {
        return new Response(
          new ReadableStream({
            start: (ctrl) => {
              hubManifest.permissions?.push("writer");
              hubManifest.roles?.at(0)?.permissions?.push("writer");
              ctrl.enqueue("event: refresh\n");
              ctrl.enqueue("data: refresh\n\n");

              setTimeout(() => ctrl.close(), 100);
            },
          }),
          {
            headers: {
              "Content-Type": "text/event-stream",
            },
          },
        );
      }

      return new Response(null, { status: 404 });
    });

    using server = useServer(fn);

    const manifestPath = new URL("manifest", server.url);

    using settings = await loadSettings({
      MANIFEST_LOCATION: manifestPath.toString(),
    });

    expect(settings.hubSchema?.get()).toMatchSnapshot("initial");
    await new Promise((r) => setTimeout(r, 400));
    expect(settings.hubSchema?.get()).toMatchSnapshot("updated");
    expect(fetches).toBe(2);
  });

  it("loads settings from a manifest served by a mock server with multiple SSE events", async () => {
    const hubManifest: HubManifest = {
      principals: [{ id: "asd", roles: ["asd"] }],
      roles: [
        {
          id: "asd",
          permissions: ["asd"],
        },
      ],
      permissions: ["asd"],
    };

    let fetches = 0;

    const fn = mock((req: Request) => {
      const url = new URL(req.url);

      if (url.pathname === "/manifest") {
        fetches++;
        return Response.json(hubManifest, {
          headers: {
            "X-Content-Refresh": new URL(
              "/manifest-watching",
              req.url,
            ).toString(),
          },
        });
      }

      if (url.pathname === "/manifest-watching") {
        return new Response(
          new ReadableStream({
            start: (ctrl) => {
              hubManifest.permissions?.push("writer");
              hubManifest.roles?.at(0)?.permissions?.push("writer");
              ctrl.enqueue("event: refresh\n");
              ctrl.enqueue("data: refresh\n\n");
              ctrl.enqueue("event: refresh\n");
              ctrl.enqueue("data: refresh\n\n");
              ctrl.enqueue("event: refresh\n");
              ctrl.enqueue("data: refresh\n\n");

              setTimeout(() => ctrl.close(), 100);
            },
          }),
          {
            headers: {
              "Content-Type": "text/event-stream",
            },
          },
        );
      }

      return new Response(null, { status: 404 });
    });

    using server = useServer(fn);

    const manifestPath = new URL("manifest", server.url);

    using settings = await loadSettings({
      MANIFEST_LOCATION: manifestPath.toString(),
    });

    expect(settings.hubSchema?.get()).toMatchSnapshot("initial");
    await new Promise((r) => setTimeout(r, 400));
    expect(settings.hubSchema?.get()).toMatchSnapshot("updated");
    expect(fetches).toBe(2);
  });
});
