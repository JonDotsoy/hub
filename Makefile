PACKAGES=$(wildcard packages/*)

.PHONY: fmt check test clean pack test %@packages/%

check: ./node_modules
	bunx prettier --check .
	bun test

fmt: ./node_modules
	bunx prettier -w .

# clean: clean@packages/hub clean@packages/dashboard
# 	rm -rf node_modules

# pack: pack@packages/hub

test:

./node_modules:
	bun i

%@packages/client: ./node_modules
	make -C packages/client $*

%@packages/hub: ./node_modules
	make -C packages/hub $*

%@packages/dashboard: ./node_modules
	make -C packages/dashboard $*

