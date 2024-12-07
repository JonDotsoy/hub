import { get } from "@jondotsoy/utils-js/get";
import * as YAML from "yaml";
import { atom, type ReadableAtom } from "nanostores";

namespace loadHubSchema {
  const downloadHttpAgent = async (
    target: URL,
  ): Promise<ReadableAtom<string>> => atom((await fetch(target)).text());
  const downloadFileAgent = async (
    target: URL,
  ): Promise<ReadableAtom<string>> => atom(await Bun.file(target).text());

  const downloadAgents: Record<
    string,
    undefined | ((target: URL) => Promise<ReadableAtom<string>>)
  > = {
    "http:": downloadHttpAgent,
    "https:": downloadHttpAgent,
    "file:": downloadFileAgent,
  };

  const parsers: Record<
    string,
    undefined | ((payload: ReadableAtom<string>) => ReadableAtom<any>)
  > = {
    ".yml": (stringReadable: ReadableAtom<string>) =>
      atom(YAML.parse(stringReadable.get())),
    ".yaml": (stringReadable: ReadableAtom<string>) =>
      atom(YAML.parse(stringReadable.get())),
    ".json": (stringReadable: ReadableAtom<string>) =>
      atom(JSON.parse(stringReadable.get())),
  };

  const downloadSources = (target: URL) => {
    const agent = downloadAgents[target.protocol];
    if (!agent) throw new Error(`Unsupported protocol ${target.protocol}`);
    return agent(target);
  };

  const parseSource = (target: URL, source: ReadableAtom<string>) => {
    const getParse = () => {
      for (const [name, parse] of Object.entries(parsers)) {
        if (target.pathname.endsWith(name) && parse) return parse;
      }
      return null;
    };

    const parse = getParse();
    if (!parse) throw new Error(`Unsupported extension ${target.pathname}`);
    return parse(source);
  };

  export const load = async (target: string) => {
    const targetUrl = new URL(target, `file:${process.cwd()}/`);
    const source = await downloadSources(targetUrl);
    const data = parseSource(targetUrl, source);
    return data;
  };
}

const getStringNumber = (obj: unknown, ...paths: PropertyKey[]) => {
  const value = get(obj, ...paths);
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value))
    return Number(value);
  return null;
};

async function getHubSchemaState(obj: unknown, ...paths: PropertyKey[]) {
  const hubManifestLocation = get.string(obj, ...paths);
  if (hubManifestLocation) {
    return await loadHubSchema.load(hubManifestLocation);
  }

  return null;
}

export const loadSettings = async (
  envs: Record<string, string | undefined> = process.env,
) => {
  return {
    port: getStringNumber(envs, "PORT") ?? 3000,
    grpcPort: getStringNumber(envs, "PORT") ?? 3001,
    base: get.string(envs, "BASE") ?? "/",
    site: get.string(envs, "SITE"),
    hubSchema: await getHubSchemaState(envs, "MANIFEST_LOCATION"),
  };
};

export const settings = await loadSettings(process.env);
