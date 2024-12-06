import { describe, it } from 'vitest'
import { join } from 'path'
import { createContainer } from '../../container'
import { PBLoader } from '../../pb-loader/pb-loader'
import { ProjectInfo } from '../../project'
import { MessageGenerator } from '../generate-message'
import { FilesManager } from '../../files-manager/files-manager'

const root = join(__dirname, '../../../test-protos')

describe('encode', () => {
  it.only('encode', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('**/color.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateType(files)
    const filesManager = container.get(FilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    console.log(fileContent.map((file) => file.toString()).join('\n'))
    console.log('debugger 🐛 fileContent', fileContent.length)
  })
})
