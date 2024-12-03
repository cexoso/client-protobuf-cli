import { existsSync, lstatSync } from 'fs'
import { injectable } from 'inversify'
import { isAbsolute, join } from 'path'

@injectable()
export class ProjectInfo {
  #pbRootPath: string = ''
  setPbRootPath(path: string) {
    const absolutePath = isAbsolute(path)
      ? path
      : // 从执行的路径开始查找
        join(process.cwd(), path)

    this.#assertIsDirectory(absolutePath)
    this.#pbRootPath = path
  }
  #assertIsDirectory(absolutePath: string) {
    if (!existsSync(absolutePath)) {
      console.log('root 目录不存在:', absolutePath)
      throw new Error(`can't found directory ${absolutePath}`)
    }
    if (!lstatSync(absolutePath).isDirectory()) {
      console.log('root 应该是一个目录:', absolutePath)
      throw new Error(`${absolutePath} is not a directory`)
    }
  }
  get pbRootPath() {
    return this.#pbRootPath
  }
}
