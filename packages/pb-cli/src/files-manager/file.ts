import { relative, join, isAbsolute } from 'path'
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

  #transformToProjectRelativePath(absolutePath: string) {
    if (isAbsolute(absolutePath)) {
      let x = relative(this.opts.pbRootPath, absolutePath)
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
  get fileNameWithProject() {
    return this.#transformToProjectRelativePath(this.fileAbsolutePath)
  }

  #getMemberDeclaration = (members: Set<string>) => {
    if (members.size === 0) {
      return ''
    }

    let memberDeclarations = [...members].map((m) => m).join(', ')
    return `{ ${memberDeclarations} } from `
  }
  #getImportsDeclaration() {
    const allImports = [...this.#imports.entries()]
    return (
      allImports
        .map(([module, members]) => {
          const memberDeclarations = this.#getMemberDeclaration(members)
          const modulePath = this.#transformToProjectRelativePath(module)
          return `import ${memberDeclarations}'${modulePath}'`
        })
        .join('\n') + '\n'
    )
  }

  toString() {
    const filename = this.fileNameWithProject
    const content = this.#contents.join('\n')
    let body = `// ${filename}\n`
    body += this.#getImportsDeclaration()
    body += content
    return body
  }
}