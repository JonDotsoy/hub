.PHONY: all dev build clean test test-* pack

all: test

build: hub-manifest.schema.* lib

clean: clean@src/service/protos/service.ts
	rm -rf ./lib
	rm -f hub-manifest.schema.*

test:
	bun test

test-watch:
	bun --watch test

dev: hub-manifest.schema.*
	bun dev

clean@src/service/protos/service.ts:
	find src/service/protos -name *.ts | xargs -I_ rm _

src/service/protos/service.ts:
	bunx proto-loader-gen-types src/service/protos/service.proto --longs=String --enums=String --defaults --oneofs --grpcLib=@grpc/grpc-js --outDir src/service/protos/

pack:
	npm pack

hub-manifest.schema.*:
	bun ./src/hub-manifest/tasks/generate-hub-manifest-schema-json.ts

lib: lib/esm

lib/esm:
	bunx tsc --project tsconfig.esm.json --outDir ./lib/esm
