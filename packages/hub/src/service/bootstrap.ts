import { Router, params } from "artur";
import { Hub } from "../hub/hub";
import { settings } from "./settings";
import * as YAML from "yaml";
import {
  DynamicContentResponse,
  dynamicContentMiddleware,
} from "./utils/dynamic-content-response";

const openapi = new URL("./openapi.yml", import.meta.url);

export const bootstrap = async () => {
  const router = new Router();
  const hub = await Hub.from(settings.hubSchema);

  router.use("POST", "/is-allowed", {
    fetch: async (req) => {
      const body = await req.json();

      const allowed = await hub.isAllowed({
        principalId: body.principalId,
        resource: body.resource,
        action: body.action,
      });

      return Response.json({ allowed });
    },
  });

  router.use("GET", "/", {
    middlewares: [dynamicContentMiddleware],
    fetch: (req) => new DynamicContentResponse({
      uptimeMs: Math.floor(process.uptime()),
      apis: router.routes
        .map(route => {
          const relativeUrl = new URL(route.urlPattern.pathname, req.url);

          if (!route.urlPattern.test(relativeUrl)) return [];

          return {
            method: route.method,
            url: relativeUrl,
          }
        })
        .flat()
    }),
  });

  router.use("GET", "/openapi", {
    middlewares: [dynamicContentMiddleware],
    fetch: async (req) => {
      const openapiPayload = YAML.parse(await Bun.file(openapi).text());

      openapiPayload.servers = [
        {
          url: new URL(settings.base, req.url).toString(),
        },
        ...(openapiPayload.servers ?? []),
      ];

      return new DynamicContentResponse(openapiPayload);
    },
  });

  router.use("GET", "/manifest", {
    middlewares: [dynamicContentMiddleware],
    fetch: async (req) => {
      return new DynamicContentResponse(hub.toJSON());
    },
  });

  return router;
};
