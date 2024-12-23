import { Field, MapField, Root, Type } from 'protobufjs'
import { isEnum, isScalarType, mapScalarToEncodeMethod } from './scalar'
import { upperCaseFirst } from '../../prettier/string-format'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { getFilenameByType } from '../get-filename-by-type'
import dedent from 'dedent'

@injectable()
export class EncoderGenerater {
  constructor(@inject(TSFilesManager) private filesManager: TSFilesManager) {}
  #messageEncodeMap = new Map<string, { content: string; file: File }>()
  #addImport(field: Field, modulePath: string, member: string) {
    const file = this.filesManager.getTSFileByProtoPath(getFilenameByType(field))
    file.addImport({ absolutePath: modulePath, member })
  }
  #genRepeatFieldContent(field: Field) {
    const isScalar = isScalarType(field.type)
    if (!isScalar) {
      const encodeMethodName = 'encode' + upperCaseFirst(field.type)
      this.#generateMessageEncodeCode(field.root.lookupType(field.type))
      this.#addImport(field, '@protobuf-es/core', 'encodeRepeatToBuffer')
      this.#addImport(field, '@protobuf-es/core', 'encodeMessageToBuffer')
      return `encodeRepeatToBuffer(
        value["${field.name}"],
        ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, ${encodeMethodName}),
        ${field.id},
        writer
      )`
    }
    const method = mapScalarToEncodeMethod(field.type)
    // TODO: proto3 默认使用 packed 了, 我们目前仍使用 proto2
    // 但也应该尽量把这个逻辑补上，防止接受 Proto3 的时候出问题
    const packed = field?.options?.packed ?? false
    const encodeName = packed ? 'encodePackedRepeatToBuffer' : 'encodeRepeatToBuffer'
    this.#addImport(field, '@protobuf-es/core', encodeName)
    const result = `${encodeName}(value["${field.name}"], ${method}, ${field.id}, writer)`
    return result
  }
  #mapTypeToEncodeMethod(root: Root, type: string) {
    if (isScalarType(type)) {
      return {
        typeName: mapScalarToEncodeMethod(type),
        file: '@protobuf-es/core',
      }
    }
    if (isEnum(root.lookupTypeOrEnum(type))) {
      // enum
      return {
        typeName: 'encodeEnumToBuffer',
        file: '@protobuf-es/core',
      }
    }
    const name = 'encode' + upperCaseFirst(type)
    return {
      typeName: name,
      file: this.#generateMessageEncodeCode(root.lookupType(type)).file.finalTsAbsolutePath,
    }
  }

  #genFieldContent(field: Field) {
    const root = field.root
    if (field.repeated) {
      return this.#genRepeatFieldContent(field)
    }

    if (field instanceof MapField) {
      this.#addImport(field, '@protobuf-es/core', 'encodeMapToBuffer')

      const keyType = field.keyType !== 'string' ? '\nisKeyNumber: true,' : ''
      return dedent`
        encodeMapToBuffer(value["${field.name}"], {
          tag: ${field.id},
          writer,${keyType}
          keyEncoderWithTag: ${this.#mapTypeToEncodeMethod(root, field.keyType).typeName},
          valueEncoderWithTag: ${this.#mapTypeToEncodeMethod(root, field.type).typeName},
        })
      `
    }
    if (isScalarType(field.type) || isEnum(field.resolvedType!)) {
      const { typeName: method } = this.#mapTypeToEncodeMethod(root, field.type)
      return `${method}({
        value: value["${field.name}"],
        tag: ${field.id},
        writer,
      })`
    }

    const encodeMethodName = 'encode' + upperCaseFirst(field.type)
    this.#addImport(field, '@protobuf-es/core', 'encodeMessageToBuffer')
    return `encodeMessageToBuffer(
      {
        value: value["${field.name}"],
        tag: ${field.id},
        writer,
      },
      ${encodeMethodName}
    )`
  }

  #getAndCompileDependenciesEncode(fields: Field[]) {
    if (fields.length === 0) {
      return []
    }
    const root = fields[0].root
    return (
      fields
        .map((field) => field.type)
        // .filter((field) => !isScalarType(field.type) && !isEnum(field.resolvedType!))
        // 这里似乎不需要算是 MapField, 因为 MapField 的 keyType 不可能是一个 message
        .map((type) => {
          return this.#mapTypeToEncodeMethod(root, type)
        })
    )
  }

  #generateMessageEncodeCode(type: Type) {
    const name = this.#getEncoderName(type)
    let result = this.#messageEncodeMap.get(name)

    if (result === undefined) {
      const currentFile = this.filesManager.getTSFileByProtoPath(getFilenameByType(type))
      result = { content: '', file: currentFile }
      this.#messageEncodeMap.set(name, result)
      const genFieldEncode = (field: Field) => {
        let content = this.#genFieldContent(field)
        if (field.optional) {
          content = `
            if (value["${field.name}"] !== undefined) {
              ${content}
            }
          `
        }
        return content
      }

      const isEmpty = type.fieldsArray.length === 0
      const paramsDefined = isEmpty ? `{ value: _value, writer: _writer }` : `{ value, writer }`

      const files = this.#getAndCompileDependenciesEncode(type.fieldsArray)
      files.map(({ file, typeName }) => {
        currentFile.addImport({
          absolutePath: file,
          member: typeName,
        })
      })

      // 需要考虑嵌套请求参数
      result.content = formatTypescript(
        `export const ${name}: EncoderWithoutTag<${type.name}> = (${paramsDefined}) => {
          ${type.fieldsArray.map((field) => genFieldEncode(field)).join('\n')}
        }`
      )

      result.file.write(result.content)

      currentFile.addImport({
        absolutePath: '@protobuf-es/core',
        member: 'EncoderWithoutTag',
      })
      this.#messageEncodeMap.set(name, result)
    }
    return result
  }

  generateEncodeCode(type: Type) {
    return this.#generateMessageEncodeCode(type)
  }
  #getEncoderName(type: Type) {
    return 'encode' + upperCaseFirst(type.name)
  }
  getEncoderByType(type: Type) {
    const name = this.#getEncoderName(type)
    return {
      memberName: name,
      ...this.#messageEncodeMap.get(name)!,
    }
  }
}
