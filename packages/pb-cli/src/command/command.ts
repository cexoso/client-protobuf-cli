import { inject, injectable } from 'inversify'
import { ProjectInfo } from '../project'
import { PBLoader } from '../pb-loader/pb-loader'
import { MessageGenerator } from '../generate-message/generate-message'
import { TSFilesManager } from '../files-manager/files-manager'
import { Root } from 'protobufjs'
import { InterfaceGenerater } from '../generate-message/generate/g-interface'

export interface Context {
  files: Map<string, Root>
  filesManager: TSFilesManager
  interfaceGenerater: InterfaceGenerater
  messageGenerator: MessageGenerator
}
export interface Plugin {
  afterGenerate?: (context: Context) => void
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
    this.projectInfo.setProjectRoot(opts.outDir)
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
    const context: Context = {
      filesManager: this.filesManager,
      files: this.files!,
      interfaceGenerater: this.interfaceGenerater,
      messageGenerator: this.messageGenerator,
    }
    this.#plugins.forEach((plugin) => {
      plugin[phase]?.(context)
    })
  }
  addPlugin(plugin: Plugin) {
    this.#plugins.push(plugin)
  }
}
