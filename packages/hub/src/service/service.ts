import { Router } from "artur";
import { settings } from "./settings";
import { bootstrap } from "./bootstrap";
import grpc from "@grpc/grpc-js";
import grpcReflection from "@grpc/reflection";
import { reflection } from "./service-proto-server";

const { httpRouter, protoServiceDefinitions } = await bootstrap();
const grpcServer = new grpc.Server();
reflection.addToServer(grpcServer);

for (const { service, handlers } of protoServiceDefinitions) {
  grpcServer.addService(service, handlers);
}

const grpcPort = await new Promise((resolve, reject) => {
  grpcServer.bindAsync(
    `localhost:${settings.grpcPort}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) return reject(err);
      return resolve(port);
    },
  );
});

export const server = Bun.serve({
  port: settings.port,
  fetch: async (req) => {
    const reqTime = Date.now();
    console.log(`${req.method} ${req.url}`);
    try {
      return (
        (await httpRouter.fetch(req)) ?? new Response(null, { status: 404 })
      );
    } finally {
      console.log(`${req.method} ${req.url} ${Date.now() - reqTime}ms`);
    }
  },
});

console.log(
  `Server is ready on ${new URL(settings.base, settings.site ?? server.url)}`,
);
console.log(`GRPC Server is ready on ${`localhost:${settings.grpcPort}`}`);

for (const route of httpRouter.routes) {
  console.log(
    `Listen`,
    route.method,
    `${route.urlPattern.protocol}://${route.urlPattern.username}:${route.urlPattern.password}@${route.urlPattern.hostname}:${route.urlPattern.port}${route.urlPattern.pathname}?${route.urlPattern.search}`.toString(),
  );
}
