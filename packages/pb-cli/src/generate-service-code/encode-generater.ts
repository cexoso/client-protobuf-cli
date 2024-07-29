import { Field, Type } from 'protobufjs'
import { isEnum, isScalarType, mapScalarToEncodeMethod } from './scalar'
import { upperCaseFirst } from '../prettier/string-format'
import { formatTypescript } from '../prettier'
import { ImportManager } from './imports-manager'

export class EncoderGenerater {
  #importManager = new ImportManager()
  #messageEncodeOrder: string[] = []
  #messageEncodeMap = new Map<string, string>()
  #genRepeatFieldContent(field: Field) {
    const isScalar = isScalarType(field.type)
    if (!isScalar) {
      const encodeMethodName = 'encode' + upperCaseFirst(field.type)
      this.#generateMessageEncodeCode(field.root.lookupType(field.type))
      this.#importManager.addImportsIfNeed('protobuf-frontend', 'encodeRepeatToBuffer')
      this.#importManager.addImportsIfNeed('protobuf-frontend', 'encodeMessageToBuffer')
      return `encodeRepeatToBuffer(
        value.${field.name},
        ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, ${encodeMethodName}),
        ${field.id},
        writer
      )`
    }
    const method = mapScalarToEncodeMethod(field)
    // TODO: proto3 默认使用 packed 了, 我们目前仍使用 proto2
    // 但也应该尽量把这个逻辑补上，防止接受 Proto3 的时候出问题
    const packed = field?.options?.packed ?? false
    const encodeName = packed ? 'encodePackedRepeatToBuffer' : 'encodeRepeatToBuffer'
    this.#importManager.addImportsIfNeed('protobuf-frontend', encodeName)
    const result = `${encodeName}(value.${field.name}, ${method}, ${field.id}, writer)`
    return result
  }
  #mapTypeToEncodeMethod(field: Field) {
    if (isScalarType(field.type)) {
      return mapScalarToEncodeMethod(field)
    }

    // enum
    return 'encodeEnumToBuffer'
  }
  #genFieldContent(field: Field) {
    if (field.repeated) {
      return this.#genRepeatFieldContent(field)
    }

    if (isScalarType(field.type) || isEnum(field.resolvedType)) {
      const method = this.#mapTypeToEncodeMethod(field)
      this.#importManager.addImportsIfNeed('protobuf-frontend', method)
      return `${method}({
        value: value.${field.name},
        tag: ${field.id},
        writer,
      })`
    }
    const encodeMethodName = 'encode' + upperCaseFirst(field.type)
    this.#generateMessageEncodeCode(field.root.lookupType(field.type))
    this.#importManager.addImportsIfNeed('protobuf-frontend', 'encodeMessageToBuffer')
    return `encodeMessageToBuffer(
      {
        value: value.${field.name},
        tag: ${field.id},
        writer,
      },
      ${encodeMethodName}
    )`
  }
  #generateMessageEncodeCode(type: Type) {
    const name = 'encode' + upperCaseFirst(type.name)
    let result = this.#messageEncodeMap.get(name)

    if (result === undefined) {
      this.#messageEncodeMap.set(name, '')
      const genFieldEncode = (field: Field) => {
        let content = this.#genFieldContent(field)
        if (field.optional) {
          content = `
            if (value.${field.name} !== undefined) {
              ${content}
            }
          `
        }
        return content
      }

      const isEmpty = type.fieldsArray.length === 0
      const paramsDefined = isEmpty ? `{ value: _value, writer: _writer }` : `{ value, writer }`
      // 需要考虑嵌套请求参数
      result = formatTypescript(
        `const ${name}: EncoderWithoutTag<${type.name}> = (${paramsDefined}) => {
          ${type.fieldsArray.map((field) => genFieldEncode(field)).join('\n')}
        }`
      )

      this.#importManager.addImportsIfNeed('protobuf-frontend', 'EncoderWithoutTag')
      this.#messageEncodeOrder.push(name)
      this.#messageEncodeMap.set(name, result)
    }
    return result
  }

  generateEncodeCode(type: Type) {
    this.#generateMessageEncodeCode(type)
    return this.toFiles()
  }
  toFiles() {
    return {
      encodeMessageCodes: this.#messageEncodeOrder.map((name) => this.#messageEncodeMap.get(name)),
      imports: this.#importManager,
    }
  }
}
