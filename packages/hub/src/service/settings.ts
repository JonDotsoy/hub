import { get } from "@jondotsoy/utils-js/get";
import * as YAML from "yaml";
import { atom, type ReadableAtom } from "nanostores";
import { NativeEventSource, EventSourcePolyfill } from "event-source-polyfill";

const EventSource = NativeEventSource || EventSourcePolyfill;

namespace MediaType {
  export const parse = (mediaType: string) => {
    const [mimeType, ...parametersStrings] = mediaType
      .split(";")
      .map((s) => s.trim());
    if (!mimeType) return null;
    const [type, subtype] = mimeType.split("/").map((s) => s.trim());
    const parameters = parametersStrings
      .map((parameterString) => parameterString.split("=").map((s) => s.trim()))
      .reduce(
        (acc, [name, value]) => {
          return {
            ...acc,
            [name]: acc[name] ? [...acc[name], value] : value,
          };
        },
        {} as Record<string, string | string[]>,
      );

    return {
      mimeType,
      type,
      subtype,
      parameters,
    };
  };

  export const isJSON = (mediaType?: string): boolean =>
    mediaType
      ? parse(mediaType)?.mimeType.toLowerCase() === "application/json"
      : false;
  export const isYAML = (mediaType?: string): boolean =>
    mediaType
      ? parse(mediaType)?.mimeType.toLowerCase() === "application/yaml"
      : false;
}

type ResourceData = {
  contentType?: string;
  body: string;
};

type ResourceDataAtom = ReadableAtom<ResourceData>;

namespace loadHubSchema {
  const downloadHttpAgent = async (target: URL): Promise<ResourceDataAtom> => {
    const disposeFunctions = new Set<() => any>();
    const addDisposeFunction = (fn: () => any) => {
      disposeFunctions.add(fn);
    };

    const pull = async () => {
      const res = await fetch(target);
      const text = await res.text();
      return { res, text };
    };

    const { text, res } = await pull();

    const resourceDataState = atom<ResourceData>({
      body: text,
      contentType: res.headers.get("content-type") ?? undefined,
    });

    const xContentRefresh = res.headers.get("X-Content-Refresh")?.trim();

    if (xContentRefresh && URL.canParse(xContentRefresh)) {
      const loop = async () => {
        let iterations = 0;
        let res = Promise.withResolvers();
        const eventSource = new EventSource(xContentRefresh);
        addDisposeFunction(() => eventSource.close());
        eventSource.addEventListener("refresh", () => {
          res.resolve();
        });
        const r: AsyncIterable<any> = {
          [Symbol.asyncIterator]() {
            return {
              next: async () => {
                await res.promise;
                res = Promise.withResolvers();
                return {
                  value: iterations++,
                  done: false,
                };
              },
            };
          },
        };
        for await (const refresh of r) {
          const { res, text } = await pull();
          resourceDataState.set({
            body: text,
            contentType: res.headers.get("content-type") ?? undefined,
          });
        }
      };
      loop().catch(console.error);
    }

    const originalResourceDataStateDispose = get.function(
      resourceDataState,
      Symbol.dispose,
    );
    Reflect.set(resourceDataState, Symbol.dispose, () => {
      originalResourceDataStateDispose?.();
      for (const disposeFunction of disposeFunctions) {
        disposeFunction();
      }
    });

    return resourceDataState;
  };

  const downloadFileAgent = async (target: URL): Promise<ResourceDataAtom> =>
    atom({ body: await Bun.file(target).text() });

  const downloadAgents: Record<
    string,
    undefined | ((target: URL) => Promise<ResourceDataAtom>)
  > = {
    "http:": downloadHttpAgent,
    "https:": downloadHttpAgent,
    "file:": downloadFileAgent,
  };

  const parsers: Array<{
    test: (metadata: { target: string }, payload: ResourceDataAtom) => boolean;
    parser: (payload: ResourceDataAtom) => ReadableAtom<any>;
  }> = [
    {
      test: ({ target }, payload) =>
        target.endsWith(".yml") ||
        target.endsWith(".yaml") ||
        MediaType.isYAML(payload.get().contentType),
      parser: (stringReadable: ResourceDataAtom) =>
        atom(YAML.parse(stringReadable.get().body)),
    },
    {
      test: ({ target }, payload) =>
        target.endsWith(".json") || MediaType.isJSON(payload.get().contentType),
      parser: (stringReadable: ResourceDataAtom) =>
        atom(JSON.parse(stringReadable.get().body)),
    },
  ];

  const downloadSources = (target: URL) => {
    const downloadAgent = downloadAgents[target.protocol];
    if (!downloadAgent)
      throw new Error(`Unsupported protocol ${target.protocol}`);
    return downloadAgent(target);
  };

  const parseSource = (target: URL, source: ResourceDataAtom) => {
    const parser =
      parsers.find(({ test }) => test({ target: target.pathname }, source))
        ?.parser ?? null;
    if (!parser) throw new Error(`Unsupported extension ${target.pathname}`);
    return parser(source);
  };

  export const load = async (target: string) => {
    const targetUrl = new URL(target, `file:${process.cwd()}/`);
    const source = await downloadSources(targetUrl);
    const data = parseSource(targetUrl, source);
    const originalDispose = get.function(data, Symbol.dispose);
    Reflect.set(data, Symbol.dispose, () => {
      originalDispose?.();
      get.function(source, Symbol.dispose)?.();
    });
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
  const hubSchema = await getHubSchemaState(envs, "MANIFEST_LOCATION");
  return {
    port: getStringNumber(envs, "PORT") ?? 3000,
    grpcPort: getStringNumber(envs, "PORT") ?? 3001,
    base: get.string(envs, "BASE") ?? "/",
    site: get.string(envs, "SITE"),
    hubSchema: hubSchema,
    [Symbol.dispose]() {
      get.function(hubSchema, Symbol.dispose)?.();
    },
  };
};

export const settings = await loadSettings(process.env);
