import { Field, Type } from 'protobufjs'
import { isEnum, isScalarType, mapScalarToEncodeMethod } from './scalar'
import { upperCaseFirst } from '../../prettier/string-format'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { FilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { getFilenameByType } from '../get-filename-by-type'
import { getTypeName } from '../get-type-name'

@injectable()
export class EncoderGenerater {
  constructor(@inject(FilesManager) private filesManager: FilesManager) {}
  #messageEncodeMap = new Map<string, { content: string; file: File }>()
  #addImport(field: Field, modulePath: string, member: string) {
    const file = this.filesManager.getFileByPath(getFilenameByType(field))
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
    const method = mapScalarToEncodeMethod(field)
    // TODO: proto3 默认使用 packed 了, 我们目前仍使用 proto2
    // 但也应该尽量把这个逻辑补上，防止接受 Proto3 的时候出问题
    const packed = field?.options?.packed ?? false
    const encodeName = packed ? 'encodePackedRepeatToBuffer' : 'encodeRepeatToBuffer'
    this.#addImport(field, '@protobuf-es/core', encodeName)
    const result = `${encodeName}(value["${field.name}"], ${method}, ${field.id}, writer)`
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

    if (isScalarType(field.type) || isEnum(field.resolvedType!)) {
      const method = this.#mapTypeToEncodeMethod(field)
      this.#addImport(field, '@protobuf-es/core', method)
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
    return fields
      .filter((field) => !isScalarType(field.type) && !isEnum(field.resolvedType!))
      .map((field) => {
        const encodeMethodName = 'encode' + upperCaseFirst(getTypeName(field))
        return {
          typeName: encodeMethodName,
          file: this.#generateMessageEncodeCode(field.root.lookupType(field.type)).file!,
        }
      })
  }

  #generateMessageEncodeCode(type: Type) {
    const name = 'encode' + upperCaseFirst(type.name)
    let result = this.#messageEncodeMap.get(name)

    if (result === undefined) {
      const currentFile = this.filesManager.getFileByPath(getFilenameByType(type))
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
          absolutePath: file.fileAbsolutePath,
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
}
