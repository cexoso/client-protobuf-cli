import { grpcApp } from '@protobuf-es/grpc-frame-work'
import { metadataManager } from './messages/index'
import { microservicesModule } from './business/index'
import { grpcServiceAgentModule } from './grpc-service-agent'

export const HelloApp: ReturnType<typeof grpcApp> = grpcApp({
  importModules: [microservicesModule, grpcServiceAgentModule],
  metadataManager,
})
