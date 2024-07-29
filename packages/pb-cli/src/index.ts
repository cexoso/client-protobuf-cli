import { createContainer } from './container'
import { Command } from './command/command'
export { GrpcServerFramework } from './plugins/grpc-server-framework'
export { getAllService } from './generate-message/get-all-type'
export type { Plugin, Context } from './command/command'

// 多实例
export const getCmd = () => {
  const container = createContainer()
  const cmd = container.get(Command)
  return cmd
}

// 默认 cmd
export const cmd = getCmd()

export const compileProtos = cmd.compileProtos.bind(cmd)
