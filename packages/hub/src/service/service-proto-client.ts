import grpc, {
  type ServiceClientConstructor,
  type ServiceDefinition,
} from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import type { ProtoGrpcType } from "./protos/service";

export const serviceProto = new URL("./protos/service.proto", import.meta.url);

const packageDefinition = await protoLoader.load(serviceProto.pathname, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const routeguide: any = grpc.loadPackageDefinition(packageDefinition);
// console.log("🚀 ~ routeguide:", new routeguide.HubService)
export const HubService: ProtoGrpcType["HubService"] = routeguide.HubService;
// const e = ('RouteGuide' in routeguide) ? new routeguide.RouteGuide() : null;
