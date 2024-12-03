import { parse, Root, IParserResult, loadSync } from 'protobufjs'
import { isAbsolute, join } from 'path'
import { existsSync, readFile } from 'fs'
import { inject, injectable } from 'inversify'
import { globSync } from 'glob'
import { ProjectInfo } from '../project'
const buildInProtobufPath = join(__dirname, '../buildin-protobufs')

type onFetchFunction = (
  path: string,
  callback: (error: Error | null, content?: string) => void
) => void

@injectable()
export class PBLoader {
  constructor(@inject(ProjectInfo) private projectInfo: ProjectInfo) {}
  #pbFiles = new Map<string, Root>()
  async #readFile(path: string) {
    return new Promise<string>((resolve, reject) => {
      readFile(path, (err, content) => {
        if (err) {
          reject(err)
        } else {
          resolve(content.toString())
        }
      })
    })
  }
  #getPathRelativeToRoot = (path: string) => {
    const absolutePath = join(this.projectInfo.pbRootPath, path)
    if (existsSync(absolutePath)) {
      return absolutePath
    }
    return null
  }
  #getBuiltinPath = (path: string) => {
    const absolutePath = join(buildInProtobufPath, path)
    if (existsSync(absolutePath)) {
      return absolutePath
    }
    return null
  }
  #onFetch: onFetchFunction = (
    path: string,
    callback: (error: Error | null, content?: string | null) => void
  ) => {
    const readAndFill = (path: string) => {
      this.#readFile(path).then(
        (content) => {
          callback(null, content)
        },
        () => callback(new Error(`can't find ${path}`))
      )
    }

    if (isAbsolute(path)) {
      return readAndFill(path)
    }
    const pathRelativeToRoot = this.#getPathRelativeToRoot(path)
    if (pathRelativeToRoot) {
      return readAndFill(pathRelativeToRoot)
    }

    readAndFill(this.#getBuiltinPath(path))
  }
  public async loadByPath(path: string) {
    const allPBs = globSync(path, {
      cwd: this.projectInfo.pbRootPath,
      absolute: true,
    })
    await Promise.all(
      allPBs.map(async (pbPath) => {
        const x = loadSync(pbPath)
        x.resolveAll()
        this.#pbFiles.set(pbPath, x)
      })
    )
    return this.#pbFiles
  }
}
