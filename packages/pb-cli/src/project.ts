import { existsSync, lstatSync } from 'fs'
import { injectable } from 'inversify'
import { isAbsolute, join } from 'path'

@injectable()
export class ProjectInfo {
  // PB 存放的位置
  #pbRootPath: string = ''
  // 最后产物生成的项目位置
  #projectRoot: string = ''
  #getPathSafely(path: string) {
    const absolutePath = isAbsolute(path)
      ? path
      : // 从执行的路径开始查找
        join(process.cwd(), path)

    this.#assertIsDirectory(absolutePath)
    return absolutePath
  }
  setPbRootPath(path: string) {
    this.#pbRootPath = this.#getPathSafely(path)
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
  setProjectRoot(path: string) {
    this.#projectRoot = this.#getPathSafely(path)
  }
  get projectRoot() {
    return this.#projectRoot
  }
}
