FROM oven/bun AS base
WORKDIR /usr/share/ondina-hub

FROM base AS builder

RUN apt update && apt install -y make
COPY . .
RUN apt install && make build-essential

FROM base

COPY --from=builder /usr/share/ondina-hub /usr/share/ondina-hub
RUN bun install

EXPOSE 3000
EXPOSE 3001

CMD ["bun", "src/service/service.ts"]
