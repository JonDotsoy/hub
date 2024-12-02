// Original file: protos/service.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Body as _Body, Body__Output as _Body__Output } from './Body';
import type { Validation as _Validation, Validation__Output as _Validation__Output } from './Validation';

export interface HubServiceClient extends grpc.Client {
  isAllowed(argument: _Body, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_Validation__Output>): grpc.ClientUnaryCall;
  isAllowed(argument: _Body, metadata: grpc.Metadata, callback: grpc.requestCallback<_Validation__Output>): grpc.ClientUnaryCall;
  isAllowed(argument: _Body, options: grpc.CallOptions, callback: grpc.requestCallback<_Validation__Output>): grpc.ClientUnaryCall;
  isAllowed(argument: _Body, callback: grpc.requestCallback<_Validation__Output>): grpc.ClientUnaryCall;
  
}

export interface HubServiceHandlers extends grpc.UntypedServiceImplementation {
  isAllowed: grpc.handleUnaryCall<_Body__Output, _Validation>;
  
}

export interface HubServiceDefinition extends grpc.ServiceDefinition {
  isAllowed: MethodDefinition<_Body, _Validation, _Body__Output, _Validation__Output>
}
