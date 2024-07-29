import { injectable } from 'inversify'
import { Field, Type, Enum } from 'protobufjs'
import { camel } from 'radash'
type ShortName = string
type FullName = string

@injectable()
export class NameManager {
  #nameMap = new Map<ShortName, FullName>()
  #formatFullName(name: string) {
    return camel(name)
  }
  getUniqueName(type: Type | Field | Enum) {
    const fullName = this.#nameMap.get(type.name)
    const formatedFullName = this.#formatFullName(type.fullName)
    if (fullName === undefined) {
      // 没有占用过
      this.#nameMap.set(type.name, formatedFullName) // 自己占用
      return type.name
    }
    if (fullName === formatedFullName) {
      // 如果是自己，也返回 shortName
      return type.name
    }
    return formatedFullName
  }
}
