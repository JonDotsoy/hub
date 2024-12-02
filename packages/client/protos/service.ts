import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { HubServiceClient as _HubServiceClient, HubServiceDefinition as _HubServiceDefinition } from './HubService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  Body: MessageTypeDefinition
  HubService: SubtypeConstructor<typeof grpc.Client, _HubServiceClient> & { service: _HubServiceDefinition }
  Validation: MessageTypeDefinition
}

