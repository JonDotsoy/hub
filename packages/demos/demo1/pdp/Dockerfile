FROM oven/bun:1 AS base
FROM oven/bun:1-alpine AS base-alpine

WORKDIR /usr/share/app/

FROM base AS build

EXPOSE 3000

COPY . .

RUN bun install && bun install yaml
RUN bun build node_modules/@ondina/hub/lib/esm/service/service.js --target bun --outfile /usr/share/app/service.bun.js

FROM base-alpine
COPY --from=build /usr/share/app/service.bun.js /usr/share/app/service.bun.js

CMD [ "bun", "/usr/share/app/service.bun.js" ]
