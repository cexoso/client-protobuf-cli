import { existsSync, lstatSync } from 'fs'
import { injectable } from 'inversify'
import { isAbsolute, join } from 'path'

@injectable()
export class ProjectInfo {
  // PB 存放的位置
  #pbRootPath: string = ''

  // 文件会基于当前值生成基础路径
  // 这个基础路径是可以在生成过程中修改的
  #basepath: string = ''
  #getPathSafely(path: string, ignoreNotFound: boolean = false) {
    const absolutePath = isAbsolute(path)
      ? path
      : // 从执行的路径开始查找
        join(process.cwd(), path)
    if (!ignoreNotFound) {
      this.#assertIsDirectory(absolutePath)
    }
    return absolutePath.endsWith('/') ? absolutePath : absolutePath + '/'
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
  setBasepath(path: string) {
    this.#basepath = this.#getPathSafely(path, true)
  }
  get basepath() {
    return this.#basepath
  }
}
