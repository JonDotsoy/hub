import { Router } from "artur";
import { Hub } from "../hub/hub";
import { settings } from "./settings";

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

  return router;
};
