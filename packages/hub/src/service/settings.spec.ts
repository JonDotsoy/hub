import { describe, it, beforeAll, expect, mock } from "bun:test";
import * as fs from "fs/promises";
import { loadSettings } from "./settings.js";
import type { HubManifest } from "../hub-manifest/hub-manifest-schema.js";

const useServer = (loadPayload: (req: Request) => any) => {
  const server = Bun.serve({
    port: 56789,
    fetch: (req) => {
      return Response.json(loadPayload(req));
    },
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
      return body;
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
      return body;
    });

    using server = useServer(fn);

    const manifestPath = new URL("manifest", server.url);

    const settings = await loadSettings({
      MANIFEST_LOCATION: manifestPath.toString(),
    });

    expect(settings.hubSchema?.get()).toMatchSnapshot();
  });
});
