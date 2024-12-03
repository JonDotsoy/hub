import { get } from "@jondotsoy/utils-js/get";
import grpc from "@grpc/grpc-js";
import grpcLoader from "@grpc/proto-loader";
import { serviceProtoobject } from "../protos/service.protoobject.js";
import type { ProtoGrpcType } from "../protos/service.js";
import type { HubServiceClient } from "../protos/HubService.js";

grpcLoader.loadFileDescriptorSetFromObject;

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

export type OndinaClientOptions = {
  dsn?: string | URL | undefined;
};

export namespace agents {
  export abstract class Agent {
    constructor(readonly dsn: URL) {}

    // abstract reqJson(url: URL, body: any): Promise<unknown>;
    abstract isAllowed?(options: IsAllowedOptionsDTO): Promise<boolean>;
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

    async isAllowed(options: IsAllowedOptionsDTO) {
      const res = await this?.reqJson(
        new URL("./is-allowed", this.dsn),
        options,
      );
      return get.boolean(res, "allowed") ?? false;
    }
  }

  export class GRPCAgent extends Agent {
    hubService: HubServiceClient;

    constructor(dsn: URL) {
      super(dsn);

      const packageDefinition =
        grpcLoader.loadFileDescriptorSetFromObject(serviceProtoobject);
      const proto = grpc.loadPackageDefinition(
        packageDefinition,
      ) as any as ProtoGrpcType;

      this.hubService = new proto.HubService(
        dsn.host,
        grpc.credentials.createInsecure(),
      );
    }

    isAllowed(options: IsAllowedOptionsDTO): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        this.hubService.isAllowed(options, (err, value) => {
          if (err) return reject(err);
          return resolve(value?.allowed ?? false);
        });
      });
    }
  }

  export const mapAgents: Record<string, undefined | ((dsn: URL) => Agent)> = {
    "http:": (dsn) => new HTTPAgent(dsn),
    "https:": (dsn) => new HTTPAgent(dsn),
    "http+grpc:": (dsn) => new GRPCAgent(dsn),
    "grpc:": (dsn) => new GRPCAgent(dsn),
  };
}

export class OndinaClient {
  private constructor(
    readonly dsn?: URL,
    readonly agent?: agents.Agent,
  ) {}

  async isAllowed(options: IsAllowedOptionsDTO) {
    return this.agent?.isAllowed?.(options) ?? false;
  }

  static parseOptions(options?: OndinaClientOptions) {
    const dsnStr = getURL(options, "dsn") ?? ONDINA_HUB_URL;
    const dsn = dsnStr ? new URL(dsnStr) : undefined;
    const agent = dsn ? agents.mapAgents[dsn.protocol]?.(dsn) : undefined;

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
