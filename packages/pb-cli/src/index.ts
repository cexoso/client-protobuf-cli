import { createContainer } from './container'
import { Command } from './command/command'
export { getAllService } from './generate-message/get-all-type'
export { easyRequestPlugin } from './plugins/easy-request-plugin'
export type { Plugin, Context } from './command/command'

const container = createContainer()
export const cmd = container.get(Command)

export const compileProtos = cmd.compileProtos.bind(cmd)
