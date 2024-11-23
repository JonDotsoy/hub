.PHONY: all dev build clean test pack

all: test

build: hub-manifest.schema.* lib

clean:
	rm -rf ./lib
	rm -f hub-manifest.schema.*

test: ../../node_modules
	bun test

dev: ../../node_modules hub-manifest.schema.*
	bun dev

pack:
	npm pack

../../node_modules:
	cd ../.. && make ./node_modules

hub-manifest.schema.*: ../../node_modules
	bun ./src/hub-manifest/tasks/generate-hub-manifest-schema-json.ts

lib: lib/esm

lib/esm: ../../node_modules
	bunx tsc --project tsconfig.esm.json --outDir ./lib/esm
