.PHONY: fmt check

check: ./node_modules
	bunx prettier --check .
	bun test

fmt: ./node_modules
	bunx prettier -w .

./node_modules:
	bun i
