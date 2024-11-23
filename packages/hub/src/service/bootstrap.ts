import { Router } from "artur";
import { Hub } from "../hub/hub";
import { settings } from "./settings";
import * as YAML from "yaml";

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

  router.use('GET', '/openapi', {
    fetch: async (req) => {
      const openapiPayload = YAML.parse(await Bun.file(openapi).text());

      openapiPayload.servers = {
        url: new URL(settings.base, req.url).toString()
      }

      return new Response(YAML.stringify(openapiPayload), {
        headers: {
          'Content-Type': 'text/yaml'
        }
      })
    }
  })

  return router;
};
