import { createContainer } from './container'
import { Command } from './command/command'

const container = createContainer()
const cmd = container.get(Command)

export const compileProtos = cmd.compileProtos.bind(cmd)
