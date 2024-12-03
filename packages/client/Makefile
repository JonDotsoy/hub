.PHONY: build pack clean clean@protos

clean:
	rm -rf lib/esm

build: protos/service.ts protos/service.proto.buff.ts
	bunx tsc --project tsconfig.esm.json --outDir lib/esm

pack: build
	npm pack

test:
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
