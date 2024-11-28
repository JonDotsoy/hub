import { get } from "@jondotsoy/utils-js/get";

const getURL = (obj: unknown, ...paths: PropertyKey[]) => {
  const value = get(obj, ...paths);
  if (value instanceof URL) return value;
  if (typeof value === "string" && URL.canParse(value)) return new URL(value);
  return null;
};

const ONDINA_HUB_URL = process.env.ONDINA_HUB_URL;

export type IsAllowedOptionsDTO = {
  principalId: string;
  resource?: any;
  action: string;
};

export type OndinaClientOptions = {};

export namespace agents {
  export abstract class Agent {
    abstract reqJson(url: URL, body: any): Promise<unknown>;
  }

  export class HTTPAgent extends Agent {
    async reqJson(url: URL, body: any): Promise<unknown> {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.status !== 200)
        throw new Error(`Invalid response ${res.status}: ${await res.text()}`);

      return await res.json();
    }
  }

  export const mapAgents: Record<string, undefined | (() => Agent)> = {
    "http:": () => new HTTPAgent(),
    "https:": () => new HTTPAgent(),
  };
}

export class OndinaClient {
  private constructor(
    readonly dsn?: URL,
    readonly agent?: agents.Agent,
  ) {}

  async isAllowed(options: IsAllowedOptionsDTO) {
    const res = await this.agent?.reqJson(
      new URL("./is-allowed", this.dsn),
      options,
    );
    return get.boolean(res, "allowed") ?? false;
  }

  static parseOptions(options?: OndinaClientOptions) {
    const dsnStr = getURL(options, "dsn") ?? ONDINA_HUB_URL;
    const dsn = dsnStr ? new URL(dsnStr) : undefined;
    const agent = dsn ? agents.mapAgents[dsn.protocol]?.() : undefined;

    return {
      dsn,
      agent,
    };
  }

  static init(options?: OndinaClientOptions) {
    const { dsn, agent } = OndinaClient.parseOptions(options);
    return new OndinaClient(dsn, agent);
  }
}

export const ondinaClient = OndinaClient.init({ dsn: ONDINA_HUB_URL });
