import { describe, it, expect } from 'vitest'
import { createContainer } from '../container'
import { PBLoader } from './pb-loader'
import { join } from 'path'
const root = join(__dirname, '../../test-protos')

describe('pbloader', () => {
  it('load 不报错', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    pbLoader.setPbRoot(root)
    await pbLoader.loadByPath('*.proto')
  })
})
