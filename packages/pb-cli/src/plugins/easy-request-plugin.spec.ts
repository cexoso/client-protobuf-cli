import { describe, it } from 'vitest'
import { createContainer } from '../container'
import { join } from 'path'
import { Command } from '../command/command'
import { easyRequestPlugin } from './easy-request-plugin'

const root = join(__dirname, '../../test-protos')
const dist = join(__dirname, '../../dist')

describe('插件', () => {
  it('插件', async () => {
    // 现在全量生成还有部分问题没有解决
    const container = createContainer()
    const cmd = container.get(Command)
    cmd.addPlugin(easyRequestPlugin)
    await cmd.compileProtos({
      protoDir: root,
      outDir: dist,
      verbose: false,
      protoGlob: 'srpc.proto',
      typeFullnameRegExp: /.srpc.CRpcHead/,
      autoClean: true,
      withPrettier: true,
      // 把这个改成 false, 会真实的在 dist 目录输出文件
      dryRun: false,
    })
  })
})
