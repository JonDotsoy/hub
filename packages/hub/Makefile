.PHONY: all build clean test

all: hub-manifest.schema.* lib

build: hub-manifest.schema.*

clean:
	rm -rf ./lib
	rm -f hub-manifest.schema.*

test:
	bun test

../../node_modules:
	bun i

hub-manifest.schema.*: ../../node_modules
	bun ./src/hub-manifest/tasks/generate-hub-manifest-schema-json.ts

lib:
	bunx tsc --project tsconfig.esm.json --outDir ./lib/esm
