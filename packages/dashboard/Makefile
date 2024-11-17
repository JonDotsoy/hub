IMAGE_TAG=ondina-dashboard:latest

.PHONY: clean all .docker-images

clean:
	rm -f .docker-images
	rm -rf dist

.docker-images:
	docker build -t ${IMAGE_TAG} .
	docker images ondina-dashboard:latest --digests --format json | jq > .docker-images
	docker run --rm -it -p 4321:4321 ${IMAGE_TAG}

../../node_modules:
	bun i

dist: ../../node_modules
	bun run build
