import { inject, injectable } from 'inversify'
import { ProjectInfo } from '../project'
import { File } from './file'
import { join, isAbsolute } from 'path'

@injectable()
export class FilesManager {
  #files = new Map<string, File>()
  constructor(@inject(ProjectInfo) private projectInfo: ProjectInfo) {}

  getFileByPath(path: string) {
    const absolutePath = isAbsolute(path) ? path : join(this.projectInfo.pbRootPath, path)
    let file = this.#files.get(absolutePath)
    if (!file) {
      file = new File(absolutePath, {
        projectRoot: this.projectInfo.projectRoot,
        pbRootPath: this.projectInfo.pbRootPath,
      })
      this.#files.set(absolutePath, file)
    }
    return file
  }
  listAllFile() {
    return [...this.#files].map(([_, file]) => file)
  }
}
