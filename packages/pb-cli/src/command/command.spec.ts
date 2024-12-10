import { describe, it } from 'vitest'
import { createContainer } from '../container'
import { Command } from './command'
import { join } from 'path'

const root = join(__dirname, '../../test-protos')
const dist = join(__dirname, '../../dist')

describe('Command', () => {
  it('生成所有的文件', async () => {
    const container = createContainer()
    const cmd = container.get(Command)
    await cmd.compileProtos({
      protoDir: root,
      outDir: dist,
      verbose: false,
      autoClean: true,
      withPrettier: true,
      // 把这个改成 false, 会真实的在 dist 目录输出文件
      dryRun: true,
    })
  })
  it('使用 srpc Header 类编解码', async () => {
    // 现在全量生成还有部分问题没有解决
    const container = createContainer()
    const cmd = container.get(Command)
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
