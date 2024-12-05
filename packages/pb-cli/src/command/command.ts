import { inject, injectable } from 'inversify'
import { ProjectInfo } from '../project'
import { PBLoader } from '../pb-loader/pb-loader'
import { MessageGenerator } from '../generate-message/generate-message'
import { FilesManager } from '../files-manager/files-manager'

@injectable()
export class Command {
  constructor(
    @inject(ProjectInfo) private projectInfo: ProjectInfo,
    @inject(PBLoader) private loader: PBLoader,
    @inject(MessageGenerator) private messageGenerator: MessageGenerator,
    @inject(FilesManager) private filesManager: FilesManager
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
  }) {
    this.projectInfo.setPbRootPath(opts.protoDir)
    this.projectInfo.setProjectRoot(opts.outDir)
    const glob = opts.protoGlob ?? '**/*.proto'
    const files = await this.loader.loadByPath(glob)
    this.messageGenerator.generateAllCode(files)

    this.filesManager.renderAllFileToDir({
      verbose: opts.verbose,
      dryRun: opts.dryRun,
      autoClean: opts.autoClean,
      withPrettier: opts.withPrettier,
    })
  }
}
