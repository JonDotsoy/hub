import { Router } from "artur";
import { settings } from "./settings";
import { bootstrap } from "./bootstrap";

const router = await bootstrap();

export const server = Bun.serve({
  port: settings.port,
  fetch: async (req) => {
    console.log(`${req.method} ${req.url}`)
    return (await router.fetch(req)) ?? new Response(null, { status: 404 });
  },
});

console.log(`Server is ready on ${server.url}`);
