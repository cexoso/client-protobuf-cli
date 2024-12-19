import { inject, injectable } from 'inversify'
import { ProjectInfo } from '../project'
import { File } from './file'
import { join, isAbsolute, extname, dirname } from 'path'
import { mkdirSync, writeFileSync, lstatSync, existsSync, rmSync } from 'fs'

@injectable()
export class TSFilesManager {
  #files = new Map<string, File>()
  constructor(@inject(ProjectInfo) private projectInfo: ProjectInfo) {}
  #pathToKey(path: string) {
    const absolutePath = isAbsolute(path) ? path : join(this.projectInfo.pbRootPath, path)
    return absolutePath
  }
  #ignoreExt(absolutePath: string) {
    const ext = extname(absolutePath)
    if (ext) {
      absolutePath = absolutePath.replace(new RegExp(`${ext}$`), '')
    }
    return absolutePath
  }
  getFileByPath(path: string) {
    const absolutePath = this.#pathToKey(path)
    const key = this.#ignoreExt(absolutePath)
    let file = this.#files.get(key)
    if (!file) {
      file = new File(absolutePath, {
        projectRoot: this.projectInfo.projectRoot,
        pbRootPath: this.projectInfo.pbRootPath,
      })
      this.#files.set(key, file)
    }
    return file
  }
  getFile(path: string): File | undefined {
    const absolutePath = this.#pathToKey(path)
    const key = this.#ignoreExt(absolutePath)
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
  // 下面这部分的代码明显没有思考充分, 我现在只是想让项目跑起来
  hasFileByFileName(fileName: string) {
    const key = join(this.projectInfo.projectRoot, fileName)
    return this.#files.has(key)
  }
  getOrCreateFile(fileName: string) {
    const key = join(this.projectInfo.projectRoot, fileName)
    let file = this.#files.get(key)
    if (file === undefined) {
      file = new File(key, {
        projectRoot: this.projectInfo.projectRoot,
        pbRootPath: this.projectInfo.pbRootPath,
      })
      this.#files.set(key, file)
    }
    return file
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
