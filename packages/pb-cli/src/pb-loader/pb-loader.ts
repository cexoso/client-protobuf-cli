import { Root, loadSync } from 'protobufjs'
import { isAbsolute, join } from 'path'
import { existsSync } from 'fs'
import { inject, injectable } from 'inversify'
import { globSync } from 'glob'
import { ProjectInfo } from '../project'
const buildInProtobufPath = join(__dirname, '../buildin-protobufs')

@injectable()
export class PBLoader {
  #root: Root
  constructor(@inject(ProjectInfo) private projectInfo: ProjectInfo) {
    this.#root = new Root()
    this.#root.resolvePath = (origin, target) => {
      if (isAbsolute(target)) {
        return target
      }
      const baseCurrentPath = join(origin, target)

      // 这个好像是不对的，pb 并不存在基于当前文件路径的做法
      if (existsSync(baseCurrentPath)) {
        return baseCurrentPath
      }

      const baseRoot = join(this.projectInfo.pbRootPath, target)
      if (existsSync(baseRoot)) {
        // 更多情况是基于 PB root 目录
        return baseRoot
      }

      const baseBuildin = join(buildInProtobufPath, target)
      // 兜底到内置的 PB 目录来查找像：
      // validate.proto, google/type/phone_number.proto
      if (existsSync(baseBuildin)) {
        return baseBuildin
      }
      return target
    }
  }
  #pbFiles = new Map<string, Root>()
  public async loadByPath(path: string) {
    const allPBs = globSync(path, {
      cwd: this.projectInfo.pbRootPath,
      absolute: true,
    })
    await Promise.all(
      allPBs.map(async (pbPath) => {
        const x = loadSync(pbPath, this.#root)
        x.resolveAll()
        this.#pbFiles.set(pbPath, x)
      })
    )
    return this.#pbFiles
  }
}
