import { get } from "@jondotsoy/utils-js/get";

const getStringNumber = (obj: unknown, ...paths: PropertyKey[]) => {
  const value = get(obj, ...paths);
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value))
    return Number(value);
  return null;
};

const getHubSchema = async (
  obj: unknown,
  ...paths: PropertyKey[]
): Promise<unknown> => {
  const hubManifestLocation = get.string(obj, ...paths);
  if (hubManifestLocation) {
    const realFile = new URL(hubManifestLocation, `file:${process.cwd()}/`);
    if (await Bun.file(realFile).exists()) {
      return await Bun.file(realFile).json();
    }
  }
};

export const settings = {
  port: getStringNumber(process.env, "PORT") ?? 3000,
  base: get.string(process.env, "BASE") ?? "/",
  site: get.string(process.env, "SITE"),
  hubSchema: await getHubSchema(process.env, "MANIFEST_LOCATION"),
};
