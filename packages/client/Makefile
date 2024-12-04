TSC=bunx tsc

.PHONY: build pack clean clean@protos

clean: clean@protos
	rm -rf lib/esm

build: protos/service.ts protos/service.protoobject.ts
	${TSC} --project tsconfig.esm.json --outDir lib/esm

pack: build
	npm pack

test: protos/service.ts protos/service.protoobject.ts
	echo test

clean@protos:
	rm -rf protos

protos/service.proto:
	mkdir -p protos
	cp ../hub/src/service/protos/service.proto protos/service.proto

protos/service.ts: protos/service.proto
	bunx proto-loader-gen-types protos/service.proto --longs=String --enums=String --defaults --oneofs --grpcLib=@grpc/grpc-js --outDir protos/

protos/service.protoobject.ts:
	bun script/protofile-to-object.ts protos/service.proto | jq -Rrs '"export const serviceProtoobject = " + (. | @text)' > protos/service.protoobject.ts
