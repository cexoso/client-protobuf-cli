import { describe, it } from 'vitest'
import { createContainer } from '../container'
import { PBLoader } from './pb-loader'
import { join } from 'path'
import { ProjectInfo } from '../project'
const root = join(__dirname, '../../test-protos')

describe('pbloader', () => {
  it('load 不报错', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    await pbLoader.loadByPath('*.proto')
  })
})
