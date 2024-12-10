import { describe, expect, it } from 'vitest'
import { createContainer } from '../container'
import { FilesManager } from './files-manager'
import { dedent } from 'ts-dedent'
import { ProjectInfo } from '../project'
import { join } from 'path'

describe('files', async () => {
  it('normal', async () => {
    const container = createContainer()
    const filesManager = container.get(FilesManager)
    const x = filesManager.getFileByPath('./x.ts')
    x.addImport({
      absolutePath: 'radash',
      member: 'get',
    })
    x.addImport({
      absolutePath: 'radash',
      member: 'map',
    })
    x.addImport({
      absolutePath: 'radash',
      member: 'map as xMap',
    })
    x.addImport({
      absolutePath: 'radash',
      member: 'default as _',
    })
    x.addImport({
      absolutePath: './a',
      member: 'add',
    })
    x.write(`const a = get({ a: 1 }, 'a')`)
    x.write(`console.log(a)`)

    expect(x.toString()).deep.eq(
      dedent`
        // x.ts
        import { get, map, map as xMap, default as _ } from 'radash'
        import { add } from './a'
        const a = get({ a: 1 }, 'a')
        console.log(a)
      `
    )
  })
  it('相对地址', async () => {
    const container = createContainer()
    const filesManager = container.get(FilesManager)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setProjectRoot('./src')
    projectInfo.setPbRootPath(join(__dirname, '../../test-protos'))
    const x = filesManager.getFileByPath('./dir1/x.ts')
    const y = filesManager.getFileByPath('./dir2/y.ts')
    x.addImport({
      absolutePath: y.fileAbsolutePath,
      member: 'get',
    })
    const imports = x.getImportsDeclaration().trim()
    expect(imports).eq(`import { get } from '../dir2/y'`)
  })
})
