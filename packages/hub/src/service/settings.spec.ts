import { describe, it, beforeAll, expect } from "bun:test";
import * as fs from "fs/promises";
import { loadSettings } from "./settings.js";

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
});
