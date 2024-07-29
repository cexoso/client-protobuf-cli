import { inject, injectable } from 'inversify'
import { ProjectInfo } from '../project'
import { PBLoader } from '../pb-loader/pb-loader'
import { MessageGenerator } from '../generate-message/generate-message'
import { TSFilesManager } from '../files-manager/files-manager'
import { Root, Service } from 'protobufjs'
import { InterfaceGenerater } from '../generate-message/generate/g-interface'
import { getAllService } from '../generate-message/get-all-type'

export interface Context {
  files: Map<string, Root>
  filesManager: TSFilesManager
  interfaceGenerater: InterfaceGenerater
  messageGenerator: MessageGenerator
  getAllService: () => Service[]
  // 根据文件生成的基础路径，这个能力是用于插件修改不同类型文件生成目录的
  updateBasepath: (callback: (originProjectPath: string) => string) => void
}
export interface Plugin {
  afterGenerate?: (context: Context) => void
  beforeGenerate?: (context: Context) => void
}

@injectable()
export class Command {
  #plugins: Plugin[] = []
  files?: Map<string, Root>
  constructor(
    @inject(ProjectInfo) private projectInfo: ProjectInfo,
    @inject(PBLoader) private loader: PBLoader,
    @inject(MessageGenerator) private messageGenerator: MessageGenerator,
    @inject(TSFilesManager) private filesManager: TSFilesManager,
    @inject(InterfaceGenerater) private interfaceGenerater: InterfaceGenerater
  ) {}
  async compileProtos(opts: {
    protoDir: string
    outDir: string
    dryRun?: boolean
    // 用于在 protoDir 下搜索 pb 的 glob，默认是 **/* 会包含所有的 PB
    protoGlob?: string
    verbose?: boolean
    // 清空目标目录再输出
    autoClean?: boolean
    withPrettier?: boolean
    typeFullnameRegExp?: RegExp | string
  }) {
    this.projectInfo.setPbRootPath(opts.protoDir)
    this.projectInfo.setBasepath(opts.outDir)
    this.#callPlugin('beforeGenerate')
    const glob = opts.protoGlob ?? '**/*.proto'
    this.files = await this.loader.loadByPath(glob)
    this.messageGenerator.generateAllCode(this.files, {
      typeFullnameRegExp: opts.typeFullnameRegExp,
    })
    this.#callPlugin('afterGenerate')
    this.filesManager.renderAllFileToDir({
      verbose: opts.verbose,
      dryRun: opts.dryRun,
      autoClean: opts.autoClean,
      withPrettier: opts.withPrettier,
    })
    return this.filesManager.listAllFile()
  }
  #callPlugin(phase: keyof Plugin) {
    const files = this.files!
    const context: Context = {
      filesManager: this.filesManager,
      files,
      interfaceGenerater: this.interfaceGenerater,
      messageGenerator: this.messageGenerator,
      updateBasepath: (callback) => {
        const nextPath = callback(this.projectInfo.originProjectPath)
        this.projectInfo.setBasepath(nextPath)
      },
      getAllService: function (): Service[] {
        const serviceMap = new Map<string, Service>()
        for (const [_, root] of files) {
          const services = getAllService(root)
          for (const service of services) {
            if (!serviceMap.has(service.fullName)) {
              serviceMap.set(service.fullName, service)
            }
          }
        }
        return [...serviceMap.values()]
      },
    }
    this.#plugins.forEach((plugin) => {
      plugin[phase]?.(context)
    })
  }
  addPlugin(plugin: Plugin) {
    this.#plugins.push(plugin)
  }
}
