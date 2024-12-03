import { relative, join } from 'path'
export class File {
  #contents: string[] = []
  constructor(
    // (PBRoot) 下的绝对路径
    private fileAbsolutePath: string,
    private opts: {
      projectRoot: string
      pbRootPath: string
    }
  ) {}
  write(content: string) {
    this.#contents.push(content)
  }
  addImport(opts: { absolutePath: string; members: string }) {}

  // 最终生成到项目目录下的绝对路径
  get absoluteFileName() {
    return join(this.opts.projectRoot, this.fileNameWithProject)
  }
  get fileNameWithProject() {
    return relative(this.opts.pbRootPath, this.fileAbsolutePath)
  }
  toString() {
    const filename = this.fileNameWithProject
    const content = this.#contents.join('\n')
    let body = `// ${filename}\n`
    body += content
    return body
  }
}
