import { describe, expect, it } from 'vitest'
import { createContainer } from '../container'
import { MessageGenerator } from './generate-message'
import { isAbsolute, join, relative } from 'path'
import { PBLoader } from '../pb-loader/pb-loader'
import { ProjectInfo } from '../project'
import { TSFilesManager } from '../files-manager/files-manager'
import {
  createProgram,
  createSourceFile,
  createCompilerHost,
  getPreEmitDiagnostics,
} from 'typescript'

const root = join(__dirname, '../../test-protos')

describe('generate', () => {
  it('所有内容生成', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('example.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files)
    const filesManager = container.get(TSFilesManager)
    const fileContent = filesManager.listAllFile()
    expect(fileContent).lengthOf(2)

    const toProjectRelativePath = (p: string) => {
      if (isAbsolute(p)) {
        return relative(process.cwd(), p)
      }
      return p
    }
    const fileNames = fileContent.map((file) => {
      return file.fileNameWithProject
    })

    const compiler = createCompilerHost({})
    const originGetSourceFile = compiler.getSourceFile
    compiler.getSourceFile = (fileName, languageVersion) => {
      const file = filesManager.getFileByTs(toProjectRelativePath(fileName))
      if (file) {
        return createSourceFile(fileName, file.body, languageVersion)
      }
      return originGetSourceFile(fileName, languageVersion)
    }
    const fileExists = compiler.fileExists
    compiler.fileExists = (fileName: string) => {
      const x = toProjectRelativePath(fileName)
      const file = filesManager.getFileByTs(x)
      if (file) {
        return true
      }
      return fileExists(fileName)
    }
    const originReadFile = compiler.readFile
    compiler.readFile = (fileName: string) => {
      const file = filesManager.getFileByTs(toProjectRelativePath(fileName))
      if (file) {
        return file.body
      }
      return originReadFile(fileName)
    }
    const program = createProgram(fileNames, {}, compiler)

    const diagnostics = getPreEmitDiagnostics(program)
    expect(diagnostics).lengthOf(0)
  })
})
