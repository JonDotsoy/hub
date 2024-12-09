DOCKER_IMAGE=ondina-hub
DOCKER_CLI=docker

.PHONY: all
all: test

.PHONY: build-essential
build-essential: hub-manifest.schema.* src/service/protos/service.ts

.PHONY: build
build: build-essential lib

.PHONY: clean
clean: clean@src/service/protos/service.ts
	rm -rf ./lib
	rm -f hub-manifest.schema.*

.PHONY: test
test:
	bun test

.PHONY: test-watch
test-watch:
	bun --watch test

.PHONY: dev
dev: hub-manifest.schema.*
	bun dev

clean@src/service/protos/service.ts:
	find src/service/protos -name *.ts | xargs -I_ rm _

src/service/protos/service.ts:
	bunx proto-loader-gen-types src/service/protos/service.proto --longs=String --enums=String --defaults --oneofs --grpcLib=@grpc/grpc-js --outDir src/service/protos/

.PHONY: pack
pack:
	npm pack

hub-manifest.schema.*:
	bun ./src/hub-manifest/tasks/generate-hub-manifest-schema-json.ts

lib: lib/esm

lib/esm:
	bunx tsc --project tsconfig.esm.json --outDir ./lib/esm

.PHONY: serve
serve: build-essential
	bun src/service/service.ts
