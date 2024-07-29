type PackageOrFile = string
type Member = string
export class ImportManager {
  #imports = new Map<PackageOrFile, Set<Member>>()
  #getOrCreatePackageSet(packageOrFile: string) {
    let result = this.#imports.get(packageOrFile)
    if (result === undefined) {
      result = new Set()
      this.#imports.set(packageOrFile, result)
    }
    return result
  }
  addImportsIfNeed(packageOrFile: string, member: Member) {
    const packageSet = this.#getOrCreatePackageSet(packageOrFile)
    if (!packageSet.has(member)) {
      // 其实可以直接 add, 不需要判空
      packageSet.add(member)
    }
  }
  merge(importManager: ImportManager) {
    const originData = importManager.getImportsOriginData()
    for (let [packageOrFile, members] of originData) {
      const memberList = [...members]
      memberList.forEach((member) => {
        this.addImportsIfNeed(packageOrFile, member)
      })
    }
    return this
  }
  toImportsDeclare() {
    const declares: string[] = []
    for (let [packageOrFile, members] of this.#imports) {
      const memberList = [...members]
      if (memberList.length !== 0) {
        declares.push(`import { ${[...members].join(', ')} } from '${packageOrFile}'`)
      } else {
        declares.push(`import '${packageOrFile}'`)
      }
    }
    return declares
  }
  getImportsOriginData() {
    return this.#imports
  }
}
