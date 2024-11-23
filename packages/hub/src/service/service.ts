import { Router } from "artur";
import { settings } from "./settings";
import { bootstrap } from "./bootstrap";

const router = await bootstrap();

export const server = Bun.serve({
  port: settings.port,
  fetch: async (req) => {
    const reqTime = Date.now();
    console.log(`${req.method} ${req.url}`);
    try {
      return (await router.fetch(req)) ?? new Response(null, { status: 404 });
    } finally {
      console.log(`${req.method} ${req.url} ${Date.now() - reqTime}ms`);
    }
  },
});

console.log(`Server is ready on ${server.url}`);

for (const route of router.routes) {
  console.log(
    `Listen`,
    route.method,
    `${route.urlPattern.protocol}://${route.urlPattern.username}:${route.urlPattern.password}@${route.urlPattern.hostname}:${route.urlPattern.port}${route.urlPattern.pathname}?${route.urlPattern.search}`.toString(),
  );
}
