import type { HubManifest } from "@ondina/hub/hub-manifest";
import { settings } from "../settings";

if (!settings.hub.url) throw new Error("HUB_URL environment is required");

const fnCache = <T>(cb: () => Promise<T>) => {
  let cache: { state: T; nextRefresh: number } | null = null;
  const ttl = 1000;

  return async () => {
    if (cache && cache.nextRefresh > Date.now()) return cache.state;

    cache = {
      state: await cb(),
      nextRefresh: Date.now() + ttl,
    };

    return cache.state;
  };
};

export const loadHubManifest = fnCache(async (): Promise<HubManifest> => {
  console.log("pull manifest");
  const res = await fetch(new URL("manifest", settings.hub.url), {
    headers: { Accept: "application/json" },
  });
  return res.json();
});
