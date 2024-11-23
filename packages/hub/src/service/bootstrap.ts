import { Router } from "artur";
import { Hub } from "../hub/hub";
import { settings } from "./settings";
import * as YAML from "yaml";
import {
  DynamicContentResponse,
  dynamicContentResponseMiddleware,
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
    fetch: () => Response.json(settings.hubSchema),
  });

  router.use("GET", "/openapi", {
    middlewares: [dynamicContentResponseMiddleware],
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
    middlewares: [dynamicContentResponseMiddleware],
    fetch: async (req) => {
      return new DynamicContentResponse(hub.toJSON());
    },
  });

  return router;
};
