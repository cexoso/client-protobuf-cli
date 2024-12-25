import { inject, injectable } from 'inversify'
import { Root, Type } from 'protobufjs'
import { getAllMessages } from './get-all-type'
import { Traversal } from './generate/traversal'

interface Opts {
  typeFullnameRegExp?: RegExp | string
}

function getRoots(files: Map<string, Root> | Root) {
  if (files instanceof Map) {
    return [...files.values()]
  }
  return [files]
}

@injectable()
export class MessageGenerator {
  constructor(@inject(Traversal) private traversal: Traversal) {}
  getAllTypes(files: Map<string, Root> | Root) {
    const dedupeMap = new Set<string>()
    const roots = getRoots(files)
    const data = roots.flatMap((root) => getAllMessages(root))
    return data.filter((type) => {
      if (dedupeMap.has(type.fullName)) {
        return false
      }
      dedupeMap.add(type.fullName)
      return true
    })
  }

  doForType(files: Map<string, Root>, job: (_: Type) => any, opts?: Opts) {
    const data = this.getAllTypes(files)
    data.map((type) => {
      if (opts?.typeFullnameRegExp && !type.fullName.match(opts.typeFullnameRegExp)) {
        return
      }
      job(type)
    })
  }
  generateAllCode(files: Map<string, Root>, opts?: Opts) {
    this.doForType(files, (type) => this.traversal.generate(type), opts)
  }

  getAllMemberByType(type: Type) {
    return this.traversal.getAllMemberByType(type)
  }
}
