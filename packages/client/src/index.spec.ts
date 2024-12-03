import { describe, it, expect, mock } from "bun:test";
import { OndinaClient } from ".";
import type { ProtoGrpcType } from "../protos/service";
import type { HubServiceHandlers } from "../protos/HubService";
import type { Validation__Output } from "../protos/Validation";

const portState = {
  port: 13988,
};

class MockServer {
  server: import("bun").Server;

  constructor(fn: (url: URL, req: Request) => any) {
    this.server = Bun.serve({
      port: MockServer.nextPort(),
      fetch: (req) => fn(new URL(req.url), req),
    });
  }

  get url() {
    return this.server.url;
  }

  [Symbol.dispose]() {
    this.server.stop(true);
  }

  static nextPort() {
    return portState.port++;
  }
}

const useMockGrpcServer = async () => {
  const mockIsAllowed = mock((): Validation__Output => ({ allowed: true }));

  const grpc = await import("@grpc/grpc-js");
  const grpcLoader = await import("@grpc/proto-loader");

  const protoFile = new URL("../protos/service.proto", import.meta.url);

  const packageDefinition = grpcLoader.loadSync(protoFile.pathname, {
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }) as any;

  const protoGrpcType: ProtoGrpcType = grpc.loadPackageDefinition(
    packageDefinition,
  ) as any;

  const serve = new grpc.Server();

  serve.addService(protoGrpcType.HubService.service, {
    isAllowed: (call, callback) => {
      callback(null, mockIsAllowed());
    },
  } satisfies HubServiceHandlers);

  const url = new URL("grpc://localhost:56887");

  await new Promise<number>((resolve, reject) => {
    serve.bindAsync(
      url.host,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) return reject(err);
        resolve(port);
      },
    );
  });

  return {
    mockIsAllowed,
    url,
    [Symbol.dispose]() {
      serve.forceShutdown();
    },
  };
};

describe("OndinaClient", () => {
  it("should call the isAllowed endpoint", async () => {
    const fn = mock((url: URL, req: Request): Response | Promise<Response> =>
      Response.json({}),
    );

    using mockServer = new MockServer(fn);

    const ondinaClient = OndinaClient.init({ dsn: mockServer.url });

    await ondinaClient.isAllowed({ principalId: "user", action: "read" });

    expect(fn.mock.calls[0][0].pathname).toStartWith("/is-allowed");
  });

  it("should append the path to the DSN", async () => {
    const fn = mock((url: URL, req: Request): Response | Promise<Response> =>
      Response.json({}),
    );

    using mockServer = new MockServer(fn);

    const ondinaClient = OndinaClient.init({
      dsn: new URL("/sub-path/", mockServer.url),
    });

    await ondinaClient.isAllowed({ principalId: "user", action: "read" });

    expect(fn.mock.calls[0][0].pathname).toEndWith("/sub-path/is-allowed");
  });

  it("should return true if the response is allowed", async () => {
    const fn = mock((url: URL, req: Request): Response | Promise<Response> =>
      Response.json({}),
    );

    using mockServer = new MockServer(fn);

    const ondinaClient = OndinaClient.init({ dsn: mockServer.url });

    fn.mockReturnValue(Response.json({ allowed: true }));
    const allowed = await ondinaClient.isAllowed({
      principalId: "user",
      action: "read",
    });

    expect(allowed).toBeTrue();
  });

  it("should return false if the response is not allowed", async () => {
    const fn = mock((url: URL, req: Request): Response | Promise<Response> =>
      Response.json({}),
    );

    using mockServer = new MockServer(fn);

    const ondinaClient = OndinaClient.init({ dsn: mockServer.url });

    fn.mockReturnValue(Response.json({ allowed: false }));
    const allowed = await ondinaClient.isAllowed({
      principalId: "user",
      action: "read",
    });

    expect(allowed).toBeFalse();
  });

  it("should return false if the response is invalid", async () => {
    const fn = mock((url: URL, req: Request): Response | Promise<Response> =>
      Response.json({}),
    );

    using mockServer = new MockServer(fn);

    const ondinaClient = OndinaClient.init({ dsn: mockServer.url });

    fn.mockReturnValue(Response.json({ no_valid: true }));
    const allowed = await ondinaClient.isAllowed({
      principalId: "user",
      action: "read",
    });

    expect(allowed).toBeFalse();
  });

  it("should throw an error if the response is a 500", () => {
    const fn = mock((url: URL, req: Request): Response | Promise<Response> =>
      Response.json({}),
    );

    using mockServer = new MockServer(fn);

    const ondinaClient = OndinaClient.init({ dsn: mockServer.url });

    fn.mockReturnValue(Response.json({}, { status: 500 }));

    expect(
      ondinaClient.isAllowed({ principalId: "user", action: "read" }),
    ).rejects.toThrowError();
  });

  it("should work with grpc", async () => {
    using g = await useMockGrpcServer();
    const client = await OndinaClient.init({ dsn: g.url });

    const res = await client.isAllowed({ principalId: "asd", action: "foo" });

    expect(res).toBeTrue();
  });
});
