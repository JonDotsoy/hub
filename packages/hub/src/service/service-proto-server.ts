import grpc, { type ServiceDefinition } from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import type { ProtoGrpcType } from "./protos/service";
import grpcReflection from "@grpc/reflection";

export const serviceProto = new URL("./protos/service.proto", import.meta.url);

const packageDefinition = await protoLoader.load(serviceProto.pathname, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
export const protoGrpcType = grpc.loadPackageDefinition(
  packageDefinition,
) as any as ProtoGrpcType;
export const reflection = new grpcReflection.ReflectionService(
  packageDefinition,
);
