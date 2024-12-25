import { describe, expect, it } from 'vitest'
import { createContainer } from '../container'
import { TSFilesManager } from './files-manager'
import { dedent } from 'ts-dedent'
import { ProjectInfo } from '../project'
import { join } from 'path'

const root = join(__dirname, '../../test-protos')
describe('files', async () => {
  it('normal', async () => {
    const container = createContainer()
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const filesManager = container.get(TSFilesManager)
    const x = filesManager.getTSFileByProtoPath('./x.proto')
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
        // ./x.ts
        import { get, map, map as xMap, default as _ } from 'radash'
        import { add } from './a'
        const a = get({ a: 1 }, 'a')
        console.log(a)

      `
    )
  })
  it('相对地址', async () => {
    const container = createContainer()
    const filesManager = container.get(TSFilesManager)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setProjectRoot('./src')
    projectInfo.setPbRootPath(join(__dirname, '../../test-protos'))
    const x = filesManager.getTSFileByProtoPath('./dir1/x.proto')
    const y = filesManager.getTSFileByProtoPath('./dir2/y.proto')
    x.addImport({
      absolutePath: y,
      member: 'get',
    })
    const imports = x.getImportsDeclaration().trim()
    expect(imports).eq(`import { get } from '../dir2/y'`)
  })
})
