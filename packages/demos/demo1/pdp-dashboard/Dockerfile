FROM oven/bun:1 AS base
# FROM oven/bun:1-alpine AS base

WORKDIR /usr/share/app/

FROM base AS build

ENV HOST=0.0.0.0
ENV PORT=4321
ENV HUB_URL=http://hub-ondina:3000
EXPOSE 4321
EXPOSE 4321

COPY package.json package.json

RUN bun install --production

CMD [ "bun", "/usr/share/app/node_modules/@ondina/dashboard/dist/server/entry.mjs" ]
