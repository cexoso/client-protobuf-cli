import { createModule } from '@protobuf-es/grpc-frame-work'
import { GreeterService } from './helloworld/greeter'

/**
 ****************************************
 * 命令行生成的文件，不要直接修改该文件 *
 ****************************************
 */
export const grpcServiceAgentModule = createModule(() => {
  return {
    injectables: [GreeterService],
  }
})
