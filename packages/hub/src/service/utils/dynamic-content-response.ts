import type { Middleware } from "artur/http/router";
import * as YAML from "yaml";
import * as TOML from "@iarna/toml";
import xml from "xml";

const payloads = new WeakMap();

const contentTypeAbles = new Set([
  "application/yaml",
  "application/toml",
  "application/json",
  "application/xml",
  "text/html",
  "application/*",
  "*/*",
]);

const parseAccepts = (req: Request) => {
  const acceptsHeader =
    (req.headers.get("accept") ?? "*/*")?.split(",").map((str) => {
      const [mediaType, qFactor] = str.split(";").map((e) => e.trim());
      return { mediaType, qFactor };
    }) ?? [];

  return acceptsHeader.filter((e) => contentTypeAbles.has(e.mediaType));
};

namespace xmlResponse {
  const exp = /[a-z]\W/g;

  const resolveByTypes: Record<string, undefined | ((payload: any) => any)> = {
    string: (payload) => [payload],
    number: (payload) => [payload],
    boolean: (payload) => [payload],
    object: (payload: any) =>
      Array.from(Object.entries(payload), ([k, v]) => [
        {
          ["prop"]: [{ _attr: { key: k, type: toType(v) } }, ...resolve(v)],
        },
      ]).flat(),
    array: (payload: any[]): any => [
      ...payload.map((e) => [{ item: resolve(e) }]).flat(),
    ],
  };
  const toType = (value: unknown) => {
    if (Array.isArray(value)) return "array";
    return typeof value;
  };
  export const resolve = (payload: unknown): any[] => {
    const byType = resolveByTypes[toType(payload)];
    if (byType) return byType(payload);
    return [];
  };
}

const createFormatResponse: Record<string, (payload: any) => Response> = {
  "application/yaml": (payload) =>
    new Response(YAML.stringify(payload), {
      headers: {
        "Content-Type": "application/yaml",
      },
    }),
  "application/toml": (payload) =>
    new Response(TOML.stringify(payload), {
      headers: {
        "Content-Type": "application/toml",
      },
    }),
  "text/html": (payload) =>
    new Response(
      `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payload</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>
            <script>hljs.highlightAll();</script>
        </head>
        <body>
            <h2>Payload</h2>
            <pre><code class="language-yaml">${YAML.stringify(payload)}</code></pre>
        </body>
        </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    ),
  "application/xml": (payload) =>
    new Response(xml(xmlResponse.resolve({ doc: payload }), {}), {
      headers: {
        "Content-Type": "application/xml",
      },
    }),
  "application/json": (payload) => Response.json(payload),
};

createFormatResponse["application/*"] =
  createFormatResponse["application/yaml"];
createFormatResponse["text/*"] = createFormatResponse["application/*"];
createFormatResponse["*/*"] = createFormatResponse["application/*"];

export const dynamicContentMiddleware: Middleware<any> = (fetch) => {
  return async (req) => {
    const accepts = parseAccepts(req);

    if (accepts.length === 0) return new Response(null, { status: 406 });

    const res = await fetch(req);

    const payload = res ? payloads.get(res) : null;

    for (const accept of accepts) {
      const formatResponse = createFormatResponse[accept.mediaType];
      if (formatResponse) return formatResponse(payload);
    }

    return new Response(null, {
      status: 406,
    });
  };
};

export class DynamicContentResponse extends Response {
  constructor(payload: unknown, body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
    payloads.set(this, payload);
  }
}
