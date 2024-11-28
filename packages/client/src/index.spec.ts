import { describe, it, expect, mock } from "bun:test";
import { OndinaClient } from ".";

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
});
