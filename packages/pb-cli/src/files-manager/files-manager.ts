import { inject, injectable } from 'inversify'
import { ProjectInfo } from '../project'
import { File } from './file'
import { join, isAbsolute, extname, dirname, relative } from 'path'
import { mkdirSync, writeFileSync, lstatSync, existsSync, rmSync } from 'fs'

@injectable()
export class TSFilesManager {
  #files = new Map<string, File>()
  constructor(@inject(ProjectInfo) private projectInfo: ProjectInfo) {}
  #pathToKey(path: string) {
    const absolutePath = isAbsolute(path) ? path : join(this.projectInfo.pbRootPath, path)
    return absolutePath
  }
  #transformExtToTs(absolutePath: string) {
    const ext = extname(absolutePath)
    if (ext) {
      absolutePath = absolutePath.replace(new RegExp(`${ext}$`), '.ts')
    }
    return absolutePath
  }
  // 转换成最终 ts 的绝对路径
  #transformToFinalTSAbsolutePath(path: string) {
    const absolutePath = this.#pathToKey(path)
    let x = relative(this.projectInfo.pbRootPath, absolutePath)
    const result = join(this.projectInfo.projectRoot, x)
    return this.#transformExtToTs(result)
  }
  getTSFileByProtoPath(path: string) {
    const finalTSAbsolutePath = this.#transformToFinalTSAbsolutePath(path)
    const key = finalTSAbsolutePath

    let file = this.#files.get(key)
    if (!file) {
      file = new File(finalTSAbsolutePath, {
        projectRoot: this.projectInfo.projectRoot,
        pbRootPath: this.projectInfo.pbRootPath,
      })
      this.#files.set(key, file)
    }
    return file
  }
  getFileByTs(path: string): File | undefined {
    const absolutePath = isAbsolute(path) ? path : join(this.projectInfo.projectRoot, path)
    const key = this.#transformExtToTs(absolutePath)

    return this.#files.get(key)
  }

  catAllFile() {
    console.log(
      this.listAllFile()
        .map((file) => file.toString())
        .join('\n\n')
    )
  }

  listAllFile() {
    return [...this.#files].map(([_, file]) => file)
  }

  #cleanAndMakeOutDir() {
    if (existsSync(this.projectInfo.projectRoot)) {
      // 这个命令有点危险，我不确定要不要检查 projectRoot 是一个合法的目录
      rmSync(this.projectInfo.projectRoot, {
        recursive: true,
        force: true,
      })
    }
    mkdirSync(this.projectInfo.projectRoot)
  }

  #makeSureDirExists(dirName: string) {
    const exist = existsSync(dirName)
    if (!exist) {
      mkdirSync(dirName, { recursive: true })
      return
    }
    const stat = lstatSync(dirName)
    if (stat.isDirectory()) {
      return
    }
    console.log(`${dirName} 已经存在，且不是一个有效的目录`)
  }
  writeFileWithCreateDir(absolutePath: string, content: string) {
    const dirName = dirname(absolutePath)
    this.#makeSureDirExists(dirName)
    writeFileSync(absolutePath, content)
  }
  renderAllFileToDir(opts: {
    verbose?: boolean
    dryRun?: boolean
    autoClean?: boolean
    withPrettier?: boolean
  }) {
    const log = (...message: any[]) => {
      if (opts.verbose) {
        console.log(...message)
      }
    }
    const renderFile = (file: File) => {
      const path = file.absoluteFileName
      log(path)
      if (opts.dryRun) {
        return
      }

      this.writeFileWithCreateDir(
        path,
        file.getBody({
          formatWithCurrentPrettier: opts.withPrettier,
        })
      )
      // 真实的渲染到文件系统
    }
    log('渲染文件:')

    if (opts.autoClean && !opts.dryRun) {
      this.#cleanAndMakeOutDir()
    }
    for (let [_key, file] of this.#files) {
      renderFile(file)
    }
  }
}
