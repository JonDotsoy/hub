.PHONY: fmt check test clean pack test %@packages/%

check: ./node_modules
	bunx prettier --check .
	bun test

fmt: ./node_modules
	bunx prettier -w .

clean: clean@packages/hub clean@packages/dashboard
	rm -rf node_modules

pack: pack@packages/hub

test: test@packages/hub

./node_modules:
	bun i

#############
# dashboard
#############

dev@packages/dashboard:
	cd packages/dashboard && make dev

build@packages/dashboard:
	cd packages/dashboard && make build

clean@packages/dashboard:
	cd packages/dashboard && make clean

#############
# hub
#############

clean@packages/hub:
	cd packages/hub && make clean

pack@packages/hub:
	cd packages/hub && make pack

dev@packages/hub:
	cd packages/hub && make dev

test@packages/hub:
	cd packages/hub && bun test

