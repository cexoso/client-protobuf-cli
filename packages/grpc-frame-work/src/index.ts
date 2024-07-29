export { CustomerError } from './errors/index'

export { MetadataManager } from './metadata-manager/metadata-manager'

export { GrpcMethod } from './decorators/grpc-decorator'

export { Controller, Service, getClassDescription, GET, POST } from './decorators'

export { grpcApp } from './frame/module/grpc-module'
export type { RouteConfig, CreateRequestOptions } from './frame/module/grpc-module'
export type { Context } from './frame/middleware'

export { UnauthorizedError, Forbidden } from './errors/index'

export { composeMethodDecorator, apply, toDecorator } from './decorators/apply-method-middleware-decorator'

export type { FunctionMiddleware } from './decorators/apply-method-middleware-decorator'

export { createModule } from './frame/module/modules'
export type { ModulePredicate, Modules } from './frame/module/modules'

export { inject } from 'inversify'
