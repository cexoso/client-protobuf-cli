import { describe, it } from 'vitest'
import { createContainer } from '../container'
import { Command } from './command'
import { join } from 'path'
import { FilesManager } from '../files-manager/files-manager'

const root = join(__dirname, '../../test-protos')
const dist = join(__dirname, '../../dist')

describe('Command', () => {
  it.skip('生成', async () => {
    const container = createContainer()
    const cmd = container.get(Command)
    const filesManager = container.get(FilesManager)
    await cmd.compileProtos({
      protoDir: root,
      outDir: dist,
      verbose: true,
      autoClean: true,
      withPrettier: true,
      // 把这个改成 false, 会真实的在 dist 目录输出文件
      dryRun: true,
    })
  })
})
