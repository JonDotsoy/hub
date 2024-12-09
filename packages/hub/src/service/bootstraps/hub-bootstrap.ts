import { atom, type ReadableAtom } from "nanostores";
import { Hub } from "../../hub/hub";
import { settings } from "../settings";

export const subscribeHub = async (hubSchema: ReadableAtom<any> | null) => {
  const hub = atom(await Hub.from(hubSchema?.get()));
  const w = async () => {
    let hubSchemaPending = Promise.withResolvers<any>();
    hubSchema?.listen(() => {
      hubSchemaPending.resolve(hubSchema.get());
    });
    while (true) {
      const hubSchema = await hubSchemaPending.promise;
      hubSchemaPending = Promise.withResolvers<any>();
      try {
        hub.set(await Hub.from(hubSchema));
      } catch (err) {
        console.error(err);
      }
    }
  };
  w().catch((err) => console.error(err));
  return hub;
};

export const hubBootstrap = () => {
  return subscribeHub(settings.hubSchema);
};
