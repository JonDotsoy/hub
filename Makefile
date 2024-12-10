PRETTIER=bunx prettier

.PHONY: check
check: ./node_modules test
	${PRETTIER} --check .

.PHONY: fmt
fmt: ./node_modules
	${PRETTIER} -w .

.PHONY: clean
clean: clean@packages/hub clean@packages/dashboard clean@packages/client clean@packages/demos
	rm -rf node_modules

.PHONY: test
test: test@packages/hub test@packages/client

./node_modules:
	bun i

.PHONY: %@packages/%
clean@packages/%:
	make -C packages/$* clean

%@packages/client: ./node_modules
	make -C packages/client $*

%@packages/hub: ./node_modules
	make -C packages/hub $*

%@packages/demos:
	make -C packages/demos $*

%@packages/dashboard: ./node_modules
	make -C packages/dashboard $*

