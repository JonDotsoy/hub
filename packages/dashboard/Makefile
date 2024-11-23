IMAGE_TAG=ondina-dashboard:latest

.PHONY: dev clean all .docker-images

clean:
	rm -f .docker-images
	rm -rf dist
	rm -rf .astro
	rm -rf node_modules/.vite

dev: ../../node_modules
	bun run dev

build: dist
	bun run build

.docker-images:
	docker build -t ${IMAGE_TAG} .
	docker images ondina-dashboard:latest --digests --format json | jq > .docker-images
	docker run --rm -it -p 4321:4321 ${IMAGE_TAG}

../../node_modules:
	cd ../.. && make ./node_modules

dist: ../../node_modules
	bun run build
