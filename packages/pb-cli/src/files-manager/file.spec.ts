import { describe, expect, it } from 'vitest'
import { createContainer } from '../container'
import { FilesManager } from './files-manager'
import { dedent } from 'ts-dedent'

describe('files', async () => {
  it('normal', async () => {
    const container = createContainer()
    const filesManager = container.get(FilesManager)
    const x = filesManager.getFilesByPath('./x.ts')
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
})
