import { relative, join, isAbsolute, extname, dirname } from 'path'
import { formatTypescript } from '../prettier'
export class File {
  #contents: string[] = []
  #imports = new Map<string, Set<string>>()
  constructor(
    // (PBRoot) 下的绝对路径
    public fileAbsolutePath: string,
    private opts: {
      projectRoot: string
      pbRootPath: string
    }
  ) {}
  write(content: string) {
    this.#contents.push(content)
  }

  #getDeclarationsByPath(absolutePath: string) {
    let declarations = this.#imports.get(absolutePath)
    if (!declarations) {
      declarations = new Set()
      this.#imports.set(absolutePath, declarations)
    }
    return declarations
  }
  addImport({ absolutePath, member }: { absolutePath: string; member: string }) {
    if (this.fileAbsolutePath === absolutePath) {
      return
    }
    const declarations = this.#getDeclarationsByPath(absolutePath)
    declarations.add(member)
  }

  #transformToRelativePath(baseAbsolutePath: string, absolutePath: string) {
    if (isAbsolute(absolutePath)) {
      let x = relative(baseAbsolutePath, absolutePath)
      if (!x.startsWith('.')) {
        x = `./${x}`
      }
      return x
    }
    return absolutePath
  }

  // 最终生成到项目目录下的绝对路径
  get absoluteFileName() {
    return join(this.opts.projectRoot, this.fileNameWithProject)
  }
  #getRelativeTsPath(baseAbsolutePath: string, absolutePath: string, ignoreExt: boolean = false) {
    const directoryName = baseAbsolutePath.endsWith('/')
      ? baseAbsolutePath
      : dirname(baseAbsolutePath)
    const relativePath = this.#transformToRelativePath(directoryName, absolutePath)
    return this.#changeExtName(relativePath, ignoreExt ? '' : '.ts')
  }
  #changeExtName(path: string, extName: string) {
    const ext = extname(path)
    if (ext) {
      return path.replace(new RegExp(`${ext}$`), extName)
    }
    return path
  }
  get fileNameWithProject() {
    return this.#getRelativeTsPath(this.opts.pbRootPath, this.fileAbsolutePath)
  }

  #getMemberDeclaration = (members: Set<string>) => {
    if (members.size === 0) {
      return ''
    }

    let memberDeclarations = [...members].map((m) => m).join(', ')
    return `{ ${memberDeclarations} } from `
  }
  getImportsDeclaration() {
    const allImports = [...this.#imports.entries()]
    return (
      allImports
        .map(([module, members]) => {
          const memberDeclarations = this.#getMemberDeclaration(members)
          const modulePath = this.#getRelativeTsPath(this.fileAbsolutePath, module, true)
          return `import ${memberDeclarations}'${modulePath}'`
        })
        .join('\n') + '\n'
    )
  }

  get body() {
    return this.getImportsDeclaration() + this.#contents.join('\n')
  }

  getBody(opts: { formatWithCurrentPrettier?: boolean }) {
    const body = this.body
    if (opts.formatWithCurrentPrettier) {
      return formatTypescript(body) // 现在这个 File 是耦合了 TS 的
    }
    return body
  }

  toString() {
    const filename = this.fileNameWithProject
    let body = `// ${filename}\n`
    return body + this.body
  }
}
