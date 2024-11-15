import { HubManifestSchema } from "../schemas/hub-manifest.schema.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as YAML from "yaml";

const jsonManifestDestination = new URL(
  "../../../hub-manifest.schema.json",
  import.meta.url,
);
const yamlManifestDestination = new URL(
  "../../../hub-manifest.schema.yaml",
  import.meta.url,
);

// Log will be make a hub-manifest.schema.*
// console.log(jsonManifestDestination);
// console.log(yamlManifestDestination);

// HubManifestSchema
const jsonSchema = zodToJsonSchema(HubManifestSchema);

await Bun.write(jsonManifestDestination, JSON.stringify(jsonSchema, null, 2));
await Bun.write(yamlManifestDestination, YAML.stringify(jsonSchema));

console.log(`Generated JSON schema at ${jsonManifestDestination}`);
console.log(`Generated YAML schema at ${yamlManifestDestination}`);
