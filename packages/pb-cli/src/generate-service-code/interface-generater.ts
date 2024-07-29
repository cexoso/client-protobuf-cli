import { Field, Type } from 'protobufjs'
import { isScalarType, scalarToTypescript, isEnum } from './scalar'
import { formatTypescript } from '../prettier'

export class InterfaceGenerater {
  #interfaces: Map<string, string> = new Map()
  // 存的是 type
  #interfaceOrderList: string[] = []

  #getType(field: Field) {
    if (isScalarType(field.type)) {
      return scalarToTypescript(field.type)
    }
    this.#generateMessageInterfaceIfNeed(field.root.lookupTypeOrEnum(field.type))
    return field.type
  }
  #generateFieldDescription(field: Field) {
    const optionalTag = field.optional ? '?' : ''
    let type = this.#getType(field)
    const content = `${field.name}${optionalTag}: ${type}${field.repeated ? '[]' : ''}`
    return content
  }

  #generateMessageInterfaceIfNeed(type: Type) {
    let declareContent = this.#interfaces.get(type.name)
    if (declareContent === undefined) {
      // 如果不存在声明, 也先填充一个空的，这是为了防止类型循环依赖无限生成
      this.#interfaces.set(type.name, '')
      if (isEnum(type)) {
        // 采用 const string 作为 enum 的值，目的是为了可读，以及兼容 javascript
        declareContent = formatTypescript(
          `export enum ${type.name} {
            ${Object.keys(type.values)
              .map((key) => `${key}=${type.values[key]},`)
              .join('\n')}
          }`
        )
      } else {
        declareContent = formatTypescript(
          `export interface ${type.name} {
            ${type.fieldsArray.map((field) => this.#generateFieldDescription(field)).join('\n')}
          }`
        )
      }
      this.#interfaceOrderList.push(type.name)
      this.#interfaces.set(type.name, declareContent)
    }
    return declareContent
  }

  generateMessage(type: Type) {
    this.#generateMessageInterfaceIfNeed(type)
    return this.toFiles()
  }
  toFiles() {
    return {
      interfaces: this.#interfaceOrderList.map((type) => this.#interfaces.get(type)),
    }
  }
}
