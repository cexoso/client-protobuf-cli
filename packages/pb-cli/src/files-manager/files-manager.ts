import { inject, injectable } from 'inversify'
import { ProjectInfo } from '../project'
import { File } from './file'
import { join, isAbsolute, extname } from 'path'

@injectable()
export class FilesManager {
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

  listAllFile() {
    return [...this.#files].map(([_, file]) => file)
  }
}
