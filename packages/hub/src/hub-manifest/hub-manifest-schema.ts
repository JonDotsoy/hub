import type { z } from "zod";
import type { HubManifestSchema } from "./schemas/hub-manifest.schema.js";

export type HubManifest = z.infer<typeof HubManifestSchema>;
