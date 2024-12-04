PRETTIER=bunx prettier

PACKAGES=$(wildcard packages/*)

.PHONY: fmt check test clean pack test %@packages/%

check: ./node_modules test
	${PRETTIER} --check .

fmt: ./node_modules
	${PRETTIER} -w .

clean: clean@packages/hub clean@packages/dashboard clean@packages/client
	rm -rf node_modules

test: test@packages/hub test@packages/client

./node_modules:
	bun i

%@packages/client: ./node_modules
	make -C packages/client $*

%@packages/hub: ./node_modules
	make -C packages/hub $*

%@packages/dashboard: ./node_modules
	make -C packages/dashboard $*

