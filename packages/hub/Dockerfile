FROM oven/bun AS base
WORKDIR /usr/share/ondina-hub

FROM base AS builder

RUN apt update && apt install -y make
COPY . .
RUN bun install && make build-essential

FROM base

COPY --from=builder /usr/share/ondina-hub /usr/share/ondina-hub
RUN bun install

ENV PORT=8080
ENV GRPC_PORT=9090

# HTTP service
EXPOSE 8080
# GRPC Service
EXPOSE 9090

CMD ["bun", "src/service/service.ts"]
