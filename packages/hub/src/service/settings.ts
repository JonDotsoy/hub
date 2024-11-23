import { get } from "@jondotsoy/utils-js/get";

const tryNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return null;
};

const loadHubSchema = async (): Promise<unknown> => {
  const hubManifestLocation = get.string(process.env, "MANIFEST_LOCATION");
  if (hubManifestLocation) {
    const realFile = new URL(hubManifestLocation, `file:${process.cwd()}/`);
    if (await Bun.file(realFile).exists()) {
      return await Bun.file(realFile).json();
    }
  }
};

export const settings = {
  port: tryNumber(get(process.env, "PORT")) ?? 3000,
  hubSchema: await loadHubSchema(),
};
