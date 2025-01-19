import { describe, expect, it } from 'vitest'
import { join } from 'path'
import { GrpcServerFramework } from './grpc-server-framework'
import { createContainer } from '../container'
import { Command } from '../command/command'

const root = join(__dirname, '../../test-protos')
const dist = join(__dirname, '../../dist')

describe('grpc server framework, 为自己写的 grpc 框架生成代码', () => {
  it('helloworld', async () => {
    const container = createContainer()
    const cmd = container.get(Command)

    cmd.addPlugin(GrpcServerFramework())
    const files = await cmd.compileProtos({
      protoDir: root,
      outDir: dist,
      verbose: false,
      protoGlob: 'helloworld.proto',
      autoClean: true,
      withPrettier: true,
      // 把这个改成 false, 会真实的在 dist 目录输出文件
      dryRun: false,
    })

    const allFile = files.map((file) => file.toString())

    expect(files[0]?.fileNameWithProject).eq('./helloworld.ts')
    expect(allFile).lengthOf(2)
  })
})
