.PHONY: build pack clean

clean:
	rm -rf lib/esm

build:
	bunx tsc --project tsconfig.esm.json --outDir lib/esm

pack: build
	npm pack

test:
	echo test
