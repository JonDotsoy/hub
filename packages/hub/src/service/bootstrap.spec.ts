import { describe, it, expect } from "bun:test";
import { bootstrap, type ProtoServiceDefinition } from "./bootstrap";
import type { Router } from "artur";
import grpc from "@grpc/grpc-js";
import { HubService } from "./service-proto-client";
import type { Validation__Output } from "./protos/Validation";

async function useServer(
  httpRouter: Router,
  protoServiceDefinitions: ProtoServiceDefinition[],
) {
  const httpServer = Bun.serve({
    port: 56987,
    fetch: async (req) =>
      (await httpRouter.fetch(req)) ?? new Response(null, { status: 404 }),
  });
  const protoServer = new grpc.Server();

  for (const { service, handlers } of protoServiceDefinitions) {
    protoServer.addService(service, handlers);
  }

  await new Promise((resolve, reject) => {
    protoServer.bindAsync(
      "0.0.0.0:56988",
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) return reject(err);
        return resolve(port);
      },
    );
  });

  return {
    get httpURL() {
      return httpServer.url;
    },
    get protoHost() {
      return new URL("proto://localhost:56988").host;
    },
    [Symbol.dispose]() {
      httpServer.stop();
      protoServer.forceShutdown();
    },
  };
}

describe("bootstrap", () => {
  it("serves the proto definitions", async () => {
    const { httpRouter, protoServiceDefinitions } = await bootstrap();
    using server = await useServer(httpRouter, protoServiceDefinitions);
    const res = await fetch(new URL("/proto", server.httpURL));
    expect(res.status).toEqual(200);
    expect(res.headers.get("content-type")).toEqual("application/protobuf");
    expect(await res.text()).toMatchSnapshot();
  });

  it("calls the hub service", async () => {
    const { httpRouter, protoServiceDefinitions } = await bootstrap();
    using server = await useServer(httpRouter, protoServiceDefinitions);

    const hubService = new HubService(
      server.protoHost,
      grpc.credentials.createInsecure(),
    );

    const value = await new Promise<Validation__Output | undefined>(
      (resolve, reject) => {
        hubService.isAllowed(
          { principalId: "a", action: "b" },
          (err, value) => {
            if (err) return reject(err);
            return resolve(value);
          },
        );
      },
    );

    expect(value?.allowed).toBeFalse();
  });
});
